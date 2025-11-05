const router = require("express").Router();
const auth = require("../../config/auth");
const { Memo, MemoValue, Form, FormDetail, MemoClient, Attachment, WorkflowMaster } = require("../../config/database");
const logger = require("../../config/logger");
const _ = require("lodash");
const sequelize = require("sequelize");
const MyWorkflow = require("../../workflow/util/workflow");
const { sendInitiateEmail, sendApprovedEmail } = require("../../memo-mangement/util/send_email");
const { downloadAttachments } = require("../util/attachment");
const Op = sequelize.Op;

router.get("/forms", auth.client, (req, res, next) => {
  Form.hasOne(FormDetail);
  Form.findAll({
    where: { isActive: true },
    include: [
      {
        model: FormDetail,
        where: { isForCustomer: true },
        attributes: [],
        required: true,
      },
    ],
  })
    .then((form) => {
      form.formData = form.formData || "[]";
      res.send(form);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/forms/:tag", auth.client, (req, res, next) => {
  const tag = req.params.tag;
  Form.findOne({
    where: {
      [Op.or]: [{ tag: tag }],
    },
  })
    .then((form) => {
      form.formData = form.formData || "[]";
      res.send(form);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.post("/memo", auth.client, async (req, res, next) => {
  const formId = req.body.formId;
  const memoValues = req.body.memoValues;
  const { phone, email, id: userId } = req.payload;
  const clientEmail = req.body.email;
  const memo = {
    formId,
    createdBy: userId,
  };
  Memo.create(memo)
    .then(async (memo) => {
      await Promise.all([
        MemoClient.create({
          memoId: memo.id,
          userId: userId,
          phone,
          email,
        }),
        ...memoValues.map((formValue) => {
          const memoValue = {
            formId,
            memoId: memo.id,
            name: formValue.name,
            value: JSON.stringify(formValue.value),
            clientEmail: clientEmail,
          };
          return MemoValue.create(memoValue);
        }),
      ]);
    })
    .then((_) => {
      res.send();
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/memo", auth.client, async (req, res, next) => {
  Memo.belongsTo(Form);
  const searchQuery = {
    isDeleted: false,
    createdBy: req.payload.id,
  };
  Memo.hasOne(WorkflowMaster, {
    foreignKey: "id",
    sourceKey: "workflowMasterId",
  });
  Memo.findAll({
    where: {
      ...searchQuery,
    },
    attributes: ["id", "workflowMasterId"],
    include: [
      {
        model: Form,
        attributes: ["name", "description"],
        required: true,
      },
      {
        model: WorkflowMaster,
        required: false,
        attributes: ["id", "assignedTo", "initiatorId", "currentStatus"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
    .then((memos) => {
      res.send(memos);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/memo/:memoId", auth.client, (req, res, next) => {
  Memo.belongsTo(Form);
  Memo.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
  Memo.hasMany(MemoValue);
  Memo.hasOne(WorkflowMaster, {
    foreignKey: "id",
    sourceKey: "workflowMasterId",
  });
  Memo.findOne({
    where: {
      id: req.params.memoId,
      createdBy: req.payload.id,
      isDeleted: false,
    },
    attributes: ["id", "createdBy", "workflowMasterId"],
    include: [
      {
        model: Form,
        required: true,
      },
      {
        model: MemoValue,
        attributes: ["id", "name", "value"],
        required: true,
        raw: true,
      },
      {
        model: Attachment,
        required: false,
        where: {
          isDeleted: false,
          itemType: "memo",
        },
      },
      {
        model: WorkflowMaster,
        required: false,
        attributes: ["id", "assignedTo", "initiatorId"],
      },
    ],
    order: [["createdAt", "DESC"]],
  })
    .then(async (memo) => {
      if (!memo) throw new Error("Memo not found!");
      const images = _.filter(memo.attachments, (a) => a.fileType.includes("image") && !a.isCompressed && !a.isEncrypted);
      await Promise.all([downloadAttachments(images)]);
      return { memo };
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.put("/memo", auth.client, async (req, res, next) => {
  const memo = req.body;
  const memoValues = req.body.memoValues;
  const editedBy = req.body.editedBy;
  await Promise.all(
    memoValues.map((formValue) => {
      const memoValue = {
        name: formValue.name,
        value: JSON.stringify(formValue.value),
        editedBy,
      };
      return MemoValue.update(memoValue, {
        where: { memoId: memo.id, name: memoValue.name },
      }).then((count) => {
        return count[0] === 0
          ? MemoValue.create({
              ...memoValue,
              memoId: memo.id,
              formId: memo.formId,
              createdBy: editedBy,
            })
          : "";
      });
    })
  )
    .then((_) => {
      res.send();
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.post("/memo/:action/:memoId", auth.client, async (req, res, next) => {
  switch (req.params.action) {
    case "start":
      const memoId = req.params.memoId;
      const memo = await Memo.findOne({ where: { id: memoId } });
      if (!memo) {
        res.status(404).send("Memo Not found");
        return;
      }
      const form = await Form.findOne({ where: { id: memo.formId } });
      const workflowMaster = await MyWorkflow.initiate(req.payload.id, form.workflowId);
      const requestId = workflowMaster.requestId;
      Memo.update(
        {
          editedBy: req.body.createdBy,
          workflowMasterId: workflowMaster.id,
        },
        {
          where: { id: memo.id },
        }
      )
        .then((_) => {
          res.send();
          MemoClient.findOne({ where: { memoId } })
            .then((mC) => {
              return sendInitiateEmail({ email: mC.email, requestId });
            })
            .catch((err) => logger.error(err));
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    case "submit":
      new MyWorkflow(req)
        .submit()
        .then((_) => {
          res.send();
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    default:
      res.status(404).send("Not a valid action");
      break;
  }
});

module.exports = router;
