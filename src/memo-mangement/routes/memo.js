const router = require("express").Router();
const auth = require("../../config/auth");
const {
  Attachment,
  Memo,
  MemoValue,
  MemoClient,
  Form,
  WorkflowMaster,
  WorkflowLog,
  SequelizeInstance,
} = require("../../config/database");
const { deleteItem, MEMO } = require("../../config/delete");
const logger = require("../../config/logger");
const _ = require("lodash");
const { downloadAttachments } = require("../../document-management/util/attachment");
const MyWorkflow = require("../../workflow/util/workflow");
const sequelize = require("sequelize");
const { sendInitiateEmail } = require("../util/send_email");
const { reportAll, reportByStatus } = require("../util/memo");
const Op = sequelize.Op;

router.get("/memo", auth.required, async (req, res, next) => {
  const { name, tag, description, requestedBy, status, requestId, assignedTo, assignedOnStart, assignedOnEnd } = req.query;
  const notStarted = status === "Not Started";
  Memo.belongsTo(Form);
  Memo.hasOne(WorkflowMaster, {
    foreignKey: "id",
    sourceKey: "workflowMasterId",
  });
  WorkflowMaster.hasMany(WorkflowLog);
  const searchQuery = {
    isDeleted: false,
    ...(requestedBy ? { createdBy: requestedBy } : {}),
    ...(notStarted ? { workflowMasterId: null } : {}),
  };
  Memo.findAll({
    where: {
      ...searchQuery,
    },
    attributes: ["id", "createdBy"],
    include: [
      {
        model: Form,
        attributes: ["tag", "name", "description"],
        required: true,
        ...(name || description || tag
          ? {
              where: {
                [Op.and]: [
                  ...(tag ? [{ tag: { [Op.like]: tag } }] : []),
                  ...(name ? [{ name: { [Op.like]: `%${name}%` } }] : []),
                  ...(description ? [{ description: { [Op.like]: `%${description}%` } }] : []),
                ],
              },
            }
          : {}),
      },
      {
        model: WorkflowMaster,
        required: !notStarted,
        where: {
          ...(requestId ? { requestId: { [Op.like]: `%${requestId}%` } } : {}),
          ...(status ? { currentStatus: status } : {}),
          ...(assignedTo ? { assignedTo } : {}),
          ...(assignedOnStart || assignedOnEnd
            ? {
                [Op.and]: [
                  ...(assignedOnStart ? [{ assignedOn: { [Op.gte]: assignedOnStart } }] : []),
                  ...(assignedOnEnd ? [{ assignedOn: { [Op.lte]: assignedOnEnd } }] : []),
                ],
              }
            : {}),
        },
        // include: [
        //     {
        //         model: WorkflowLog,
        //         required: true,
        //         where: {
        //             userId: req.payload.id
        //         },
        //     }
        // ]
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

router.get("/memo/:memoId", auth.required, (req, res, next) => {
  Memo.belongsTo(Form);
  Memo.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });
  Memo.hasMany(MemoValue);
  Memo.findOne({
    where: {
      id: req.params.memoId,
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

router.post("/memo", auth.required, async (req, res, next) => {
  const formId = req.body.formId;
  const workflowId = req.body.workflowId;
  const memoValues = req.body.memoValues;
  const createdBy = req.payload.id;
  /**
   * @method module:Memo#initiateWorkflow
   * @param {Number} userId       - User id of the logged in user
   * @param {Number} workflowId   - Workflow id for the particular form
   *
   * @returns Returns the workflowMaster which is then populated
   * to the memo table to track the workflow status in long run
   */
  const workflowMaster = await MyWorkflow.initiate(req.payload.id, workflowId);
  const memo = {
    formId,
    createdBy,
    workflowMasterId: workflowMaster.id,
  };
  Memo.create(memo)
    .then(async (memo) => {
      await Promise.all([
        ...memoValues.map((formValue) => {
          const memoValue = {
            formId,
            memoId: memo.id,
            name: formValue.name,
            value: JSON.stringify(formValue.value),
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

router.put("/memo", auth.required, async (req, res, next) => {
  const memo = req.body;
  const memoValues = req.body.memoValues;
  const editedBy = req.payload.id;
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

router.delete("/memo/:id", auth.required, (req, res, next) => {
  deleteItem(
    Memo,
    {
      type: MEMO,
      id: req.params.id,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

router.post("/memo/start/:memoId", auth.required, async (req, res, next) => {
  const memoId = req.params.memoId;
  const memo = await Memo.findOne({ where: { id: memoId } });
  if (!memo) {
    res.status(404).send("Memo Not found");
    return;
  }
  const form = await Form.findOne({ where: { id: memo.formId } });
  const workflowMaster = await MyWorkflow.initiate(req.payload.id, form.workflowId);
  const requestId = workflowMaster.requestId;
  Promise.all([
    Memo.update(
      {
        createdBy: req.body.createdBy,
        workflowMasterId: workflowMaster.id,
      },
      {
        where: { id: memo.id },
      }
    ),
    MemoClient.findOne({ where: { memoId } }).then((mC) => {
      return sendInitiateEmail({ email: mC.email, requestId });
    }),
  ])
    .then((_) => {
      res.send();
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/memo/count/:userId", auth.required, (req, res, next) => {
  const userId = req.params.userId;
  Memo.hasOne(WorkflowMaster, {
    foreignKey: "id",
    sourceKey: "workflowMasterId",
  });
  Memo.findAll({
    include: [
      {
        model: WorkflowMaster,
        attributes: [["id", "w_id"], "currentStatus", "assignedTo"],
        where: {
          currentStatus: "Pending",
          assignedTo: userId,
        },
      },
    ],
    attributes: [[sequelize.fn("COUNT", sequelize.col("`memo`.`id`")), "count"]],
  })
    .then((memo) => {
      res.send(memo);
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/memo/report/:type", auth.required, (req, res, next) => {
  const type = req.params.type;
  let query = "";
  switch (type) {
    case "all":
      query = reportAll({ assignedTo: req.payload.id });
      break;
    case "status":
      query = reportByStatus();
      break;
    default:
      res.status(404).send();
      return;
  }
  SequelizeInstance.query(query)
    .then(([results]) => {
      res.send(results);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send(err);
    });
});

module.exports = router;
