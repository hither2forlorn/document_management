/**
 * @module SetupModule
 */
const Sequelize = require("sequelize");
const router = require("express").Router();
const fs = require("fs");
const path = require("path");

const {
  sequelize,
  DocumentType,
  SecurityLevel,
  Watermark,
  RoleType,
  //Not Mandatory
  User,
  Role,
  RoleControl,
  Branch,
  Department,
  SecurityHierarchy,
  ModelTypes,
  LocationType,
  Province,
  District,
  DocumentCondition,
} = require("./database");
/**
 * @const {Object} setup_data - Gets data from the setup.json file to populate the table on initial setup
 */
const {
  roleTypes,
  securityLevels,
  users,
  security_hierarchies,
  modelTypes,
  locationTypes,
  document_condition,
} = require("./setup.json");
const { resolve } = require("path");
const DistrictJSON = require("./json/District");
const ProvinceJSON = require("./json/Province");

/**
 *
 * Add data function to populate the table from the values in setup_data
 * @method
 */
const addData = async () => {
  await addMandatory();
  await Watermark.create({});
  const types = await RoleType.findAll({ attributes: ["id", "type"] });
  for (user of users) {
    const role = await Role.create(user.role);
    const branch = await Branch.create(user.branch);
    const department = await Department.create(user.department);
    // const hierarchy = await SecurityHierarchy.create(user.hierarchy);
    await User.create({
      ...user,
      type: "admin",
      roleId: role.id,
      branchId: branch.id,
      departmentId: department.id,
      hierarchy: "Super-001",
    });
    await Promise.all(
      types.map((type) => {
        if (type.type == "boolean") {
          RoleControl.create({
            roleId: role.id,
            roleTypeId: type.id,
            value: "true",
          });
        } else
          RoleControl.create({
            roleId: role.id,
            roleTypeId: type.id,
            value: 3,
          });
      })
    );
  }
  return "Success!";
};

/**
 * Setup mandatory data in the table: without these the
 * system would not be able to function to its full potential
 */
const addMandatory = async () => {
  for (roleType of roleTypes) {
    await RoleType.create(roleType);
  }
  for (securityLevel of securityLevels) {
    await SecurityLevel.create(securityLevel);
  }
  for (hierarchy of security_hierarchies) {
    await SecurityHierarchy.create(hierarchy);
  }
  for (model_type of modelTypes) {
    await ModelTypes.create(model_type);
  }
  for (locationType of locationTypes) {
    await LocationType.create(locationType);
  }
  for (row of ProvinceJSON) {
    await Province.create(row);
  }
  for (row of DistrictJSON) {
    await District.create(row);
  }
  for (row of document_condition) {
    await DocumentCondition.create(row);
  }
  return "Success!";
};

/**
 * Route to initially setup the system for usage - **`<SERVER_URL>/initial`**
 * @alias InitialSetupRoute
 */
router.get("/initial", (req, res, next) => {
  if (!fs.existsSync("temp")) fs.mkdirSync("temp");
  User.findAndCountAll({
    attributes: [[Sequelize.fn("count", Sequelize.col("id")), "count"]],
    raw: true,
  }).then((user) => {
    if (user.count === 0) {
      addData()
        .then((_) => {
          res.send(
            "<h1>Completed</h1><br/><strong>Username: </strong>admin@gentech.com<br/><strong>Password:</strong>admin123"
          );
        })
        .catch((err) => {
          console.log(err);
          res.send("<h1>500 Error Occurred</h1>");
        });
    } else {
      res.send(
        "<h1>Setup already completed</h1><br/><strong>Username: </strong>admin@gentech.com<br/><strong>Password:</strong>admin123"
      );
    }
  });
});

router.get("/seed", async (req, res, next) => {
  const user = await DocumentType.findAndCountAll({
    attributes: [[sequelize.fn("count", sequelize.col("id")), "count"]],
    raw: true,
  });

  if (user.count === 0) {
    let query = await fs.readFileSync(resolve(__dirname, `../sql/seed.sql`)).toString();

    if (query) {
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT,
      });

      res.send("<h1>Seed completed</h1>");
    }
  } else {
    res.send("<h1>Seed already completed</h1>");
  }
});

// BOK Seed
router.get("/seed/bok", async (req, res, next) => {
  const user = await DocumentType.findAndCountAll({
    attributes: [[sequelize.fn("count", sequelize.col("id")), "count"]],
    raw: true,
  });

  if (user.count === 0) {
    let query = await fs.readFileSync(resolve(__dirname, `../sql/bok_seed.sql`)).toString();

    if (query) {
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT,
      });

      res.send("<h1>BOK Seed completed</h1>");
    }
  } else {
    res.send("<h1>BOK Seed already completed</h1>");
  }
});

// RBB Seed
router.get("/seed/rbb", async (req, res, next) => {
  const user = await DocumentType.findAndCountAll({
    attributes: [[sequelize.fn("count", sequelize.col("id")), "count"]],
    raw: true,
  });

  if (user.count === 0) {
    let query = await fs.readFileSync(resolve(__dirname, `../sql/rbb_seed.sql`)).toString();

    if (query) {
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT,
      });

      res.send("<h1>RBB Seed completed</h1>");
    }
  } else {
    res.send("<h1>RBB Seed already completed</h1>");
  }
});

// CITIZEN SEED
router.get("/seed/citizen", async (req, res, next) => {
  const user = await DocumentType.findAndCountAll({
    attributes: [[sequelize.fn("count", sequelize.col("id")), "count"]],
    raw: true,
  });

  if (user.count === 0) {
    let query = await fs.readFileSync(resolve(__dirname, `../sql/citizen_seed.sql`)).toString();

    if (query) {
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT,
      });

      res.send("<h1>Citizen Seed completed</h1>");
    }
  } else {
    res.send("<h1>Citizen Seed already completed</h1>");
  }
});
// EVEREST SEED
router.get("/seed/everest", async (req, res, next) => {
  const user = await DocumentType.findAndCountAll({
    attributes: [[sequelize.fn("count", sequelize.col("id")), "count"]],
    raw: true,
  });

  if (user.count === 0) {
    let query = await fs.readFileSync(resolve(__dirname, `../sql/everest-seed.sql`)).toString();

    if (query) {
      await sequelize.query(query, {
        type: sequelize.QueryTypes.INSERT,
      });

      res.send("<h1>Everest Seed completed</h1>");
    }
  } else {
    res.send("<h1>Everest Seed already completed</h1>");
  }
});

router.get("/view", async (req, res, next) => {
  let query = await fs.readFileSync(resolve(__dirname, "../sql/view.sql")).toString();
  let query1 = await fs.readFileSync(resolve(__dirname, "../sql/view2.sql")).toString();
  let query2 = await fs.readFileSync(resolve(__dirname, "../sql/view3.sql")).toString();

  if (query) {
    await sequelize.query(query, {
      type: sequelize.QueryTypes.INSERT,
    });
    await sequelize.query(query1, {
      type: sequelize.QueryTypes.INSERT,
    });
    await sequelize.query(query2, {
      type: sequelize.QueryTypes.INSERT,
    });

    res.send("<h1>View Seed completed</h1>");
  }
});

router.get("/external-api", (req, res, next) => {
  const accountList = [
    {
      id: "1",
      name: "Hari prasad",
      accountNumber: "111111111111111",
      cif: "234234",
    },
    {
      id: "2",
      name: "Goal prasad",
      accountNumber: "111111111111112",
      cif: "234234",
    },
    {
      id: "3",
      name: "Naryan Ghimire",
      accountNumber: "1111111111111113",
      cif: "234234",
    },
  ];
  res.json({
    data: accountList,
    msg: "success",
  });
});

// router.get("/flush", async (req, res, next) => {
//   let query = await fs
//     .readFileSync(resolve(__dirname, "../sql/flush.sql"))
//     .toString();
//   console.log(query);

//   if (query) {
//     try {
//       await sequelize.query(query, {
//         type: sequelize.QueryTypes.INSERT,
//       });
//     } catch (error) {
//       console.log(error);
//     }
//     res.send("<h1>Flush completed</h1>");
//   }
// });

module.exports = router;
