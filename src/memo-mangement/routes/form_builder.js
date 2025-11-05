const router = require("express").Router();
const auth = require("../../config/auth");
const { Form, FormDetail } = require("../../config/database");
const { deleteItem, FORM } = require("../../config/delete");
const logger = require("../../config/logger");
const Workflow = require("../../workflow/util/workflow");
const Op = require("sequelize").Op;

router.get("/forms", auth.required, (req, res, next) => {
  Form.hasOne(FormDetail);
  Form.findAll({
    order: [["createdAt", "DESC"]],
    attributes: ["id", "name", "description", "isActive"],
    include: [{ model: FormDetail, required: true, attributes: [] }],
  })
    .then((forms) => {
      res.send(forms);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.post("/forms", auth.required, async (req, res, next) => {
  const form = req.body;
  const workflow = await Workflow.create({
    name: form.name,
  });
  form.workflowId = workflow.id;
  Form.create(form)
    .then(async (form) => {
      await FormDetail.create({ formId: form.id });
      res.send(form);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/forms/:idOrTag", auth.required, (req, res, next) => {
  const idOrTag = req.params.idOrTag;
  Form.hasOne(FormDetail);
  Form.findOne({
    where: {
      [Op.or]: [{ id: idOrTag }, { tag: idOrTag }],
    },
    ...(Number(idOrTag) ? { include: [{ model: FormDetail, required: true }] } : {}),
  })
    .then((form) => {
      if (form) {
        form.formData = form.formData || "[]";
        res.send(form);
      } else {
        res.status(404).send("Not found!");
      }
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.put("/forms", (req, res, next) => {
  const form = req.body;
  const form_detail = req.body.form_detail;
  Promise.all([
    Form.update(form, {
      where: { id: form.id },
    }),
    FormDetail.update(form_detail, {
      where: { id: form_detail.id },
    }),
  ])
    .then((_) => {
      res.send("Success!");
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.delete("/forms/:id", auth.required, (req, res, next) => {
  const { id } = req.params;
  deleteItem(
    Form,
    {
      id: id,
      type: FORM,
    },
    req.payload,
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
