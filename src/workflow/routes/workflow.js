const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { Workflow, WorkflowUser, WorkflowMaster, WorkflowLog } = require("../../config/database");
const WorkflowClass = require("../util/workflow");

router.get("/workflow/:id", auth.required, (req, res, next) => {
  Workflow.hasMany(WorkflowUser);
  Workflow.findOne({
    where: {
      id: req.params.id,
      isActive: true,
    },
    include: [
      {
        model: WorkflowUser,
        required: false,
        where: {
          isActive: true,
        },
      },
    ],
  })
    .then((workflow) => {
      res.send(workflow);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.put("/workflow/:id", auth.required, (req, res, next) => {
  const workflow = req.body;
  Workflow.update(workflow, {
    where: { id: workflow.id },
  })
    .then(async (_) => {
      await WorkflowUser.update({ isActive: false }, { where: { workflowId: workflow.id } });
      const workflowUsers = workflow.workflow_users || [];
      await Promise.all(
        workflowUsers.map((workflowUser) =>
          workflowUser.id
            ? WorkflowUser.update(workflowUser, {
                where: { id: workflowUser.id },
              })
            : WorkflowUser.create({ ...workflowUser, workflowId: workflow.id })
        )
      );
      res.send("Completed!");
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.get("/workflow/master/:workflowMasterId", auth.required, (req, res, next) => {
  WorkflowMaster.hasMany(WorkflowLog);
  WorkflowMaster.hasMany(WorkflowUser, {
    foreignKey: "workflowId",
    sourceKey: "workflowId",
  });
  WorkflowMaster.findOne({
    where: {
      id: req.params.workflowMasterId,
    },
    include: [
      {
        model: WorkflowUser,
        required: false,
        where: {
          isActive: true,
        },
      },
      {
        model: WorkflowLog,
        required: false,
      },
    ],
  })
    .then((workflowMaster) => {
      res.send(workflowMaster);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.post("/workflow/submit/:action", auth.required, (req, res, next) => {
  const action = req.params.action;
  const MyWorkflow = new WorkflowClass(req);
  switch (action) {
    case "submit":
      MyWorkflow.submit()
        .then((_) => res.send("Success!"))
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    case "return":
      MyWorkflow.return()
        .then((_) => res.send("Success!"))
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    case "skip":
      MyWorkflow.skip()
        .then((_) => res.send("Success!"))
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    case "comment":
      MyWorkflow.comment()
        .then((_) => res.send("Success!"))
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    case "complete":
      MyWorkflow.complete()
        .then((_) => {
          res.send("Success!");
        })
        .catch((err) => {
          logger.error(err);
          res.status(500).send("Error!");
        });
      break;
    default:
      break;
  }
});

module.exports = router;
