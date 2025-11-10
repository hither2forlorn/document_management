const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { deleteItem, ROLE } = require("../../config/delete");
const { Role, RoleControl, RoleType } = require("../../config/database");
const { availableHierarchy } = require("../../util/hierarchyManage");
const { respond } = require("../../util/response");
const { createLog, constantLogType, findPreviousData } = require("../../util/logsManagement");

router.get("/roles", auth.required, async (req, res, next) => {
  const hierarchyRoles = await availableHierarchy(req.payload.id, "roles", "*", "");
  if (hierarchyRoles) {
    res.json(hierarchyRoles?.filter((role) => role.id != 1 && role.name != "Super Admin"));
  } else {
    console.log(err);
    res.send({ success: false, message: "No Roles found." });
  }
});

router.get("/roles/types", auth.required, (req, res, next) => {
  RoleType.findAll()
    .then((roleTypes) => {
      res.send(roleTypes);
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).send("Error!");
    });
});

router.post("/roles", auth.required, async (req, res, next) => {
  req.body.hierarchy = req.payload?.hierarchy || "";
  const roleControls = req.body?.role_controls || [];
  // To maintain log
  let log_query;

  const role = req.body;

  if (role.hierarchy == "Super-000") {
    return respond(res, "412", `You in . ${role.hierarchy}. Top hierarchy cannot create roles.`);
  }
  // To maintain log
  const previousValue = await findPreviousData(constantLogType.ROLES, role.id, req.method);

  Role.create(
    role,
    // To maintain log
    {
      logging: (sql) => (log_query = sql),
    }
  )
    .then((_) => {
      createLog(req, constantLogType.ROLES, _.id, log_query, previousValue);
      Promise.all([
        roleControls?.map((r) => {
          return RoleControl.create({
            ...r,
            roleId: _.id,
            createdBy: req.body.createdBy,
          });
        }),
      ]);
      res.send({ success: true, message: "Role successfully created!" });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: "Oops! Something went wrong." });
    });
});

router.put("/roles/:id", auth.required, async (req, res, next) => {
  const role = req.body;
  const roleControls = req.body.role_controls;
  // To maintain log
  let log_query;
  // To maintain log
  const previousValue = await findPreviousData(constantLogType.ROLES, role.id, req.method);
  Promise.all([
    Role.update(role, {
      // To maintain log
      logging: (sql) => (log_query = sql),
      raw: true,
      where: { id: role.id },
    }),
    roleControls.map((r) => {
      if (r.id) {
        return RoleControl.update({ ...r, editedBy: req.body.editedBy }, { where: { id: r.id } });
      } else {
        return RoleControl.create({ ...r, createdBy: req.body.createdBy });
      }
    }),
  ])
    .then(async (count, id) => {
      // for log
      createLog(req, constantLogType.ROLES, req.params.id, log_query, previousValue);
      res.send({ success: true, message: "Role successfully updated!" });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: "Oops! Something went wrong." });
    });
});

router.get("/roles/:id", auth.required, (req, res, next) => {
  // To maintain log
  let log_query;
  Role.hasMany(RoleControl);
  Role.findOne({
    include: [
      {
        model: RoleControl,
        required: false,
      },
    ],
    // To maintain log
    logging: (sql) => (log_query = sql),
    where: { id: req.params.id, isDeleted: false },
  })
    .then((role) => {
      // for log
      createLog(req, constantLogType.ROLES, req.params.id, log_query);
      res.send({ success: true, data: role });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: "Oops! Something went wrong." });
    });
});

router.delete("/roles/:id", auth.required, (req, res, next) => {
  deleteItem(
    Role,
    {
      id: req.params.id,
      type: ROLE,
    },
    req.payload,
    (response) => {
      res.send({ response, message: "Roles deleted sucessfully" });
    },
    req
  );
});

module.exports = router;
