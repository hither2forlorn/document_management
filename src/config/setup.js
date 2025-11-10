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
const { default: axios } = require("axios");

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

router.get("/account-list", (req, res, next) => {
  console.log("here");
  const ac = [
    {
      id: "1",
      acct: "11111",
      acctName: "Hari prasad",
      custId: "234234",
      branch: "kathmandu",
      schmCode: "5555",
      idNum: "123456",
    },
    {
      id: "2",
      acct: "22222",
      acctName: "Gopal prasad",
      custId: "234234",
      branch: "kathmandu",
      schmCode: "5555",
      idNum: "123456",
    },
    {
      id: "3",
      acct: "33333",
      acctName: "Naryan Ghimire",
      custId: "234234",
      branch: "kathmandu",
      schmCode: "5555",
      idNum: "123456",
    },
  ];
  const accountList = {
    id: "1",
    acct: "11111",
    acctName: "Hari prasad",
    custId: "234234",
    branch: "kathmandu",
    schmCode: "5555",
    idNum: "123456",
  };
  // {
  //   id: "2",
  //   acct: "22222",
  //   acctName: "Gopal prasad",
  //   custId: "234234",
  //   branch: "kathmandu",
  //   schmCode: "5555",
  //   idNum: "123456",
  // },
  // {
  //   id: "3",
  //   acct: "33333",
  //   acctName: "Naryan Ghimire",
  //   custId: "234234",
  //   branch: "kathmandu",
  //   schmCode: "5555",
  //   idNum: "123456",
  // }

  res.json({
    data: accountList,
    msg: "success",
  });
});

router.get("/external-api", async (req, res, next) => {
  console.log(req.query.accNo, "req.query");
  const acNo = req?.query?.accNo;
  try {
    const response = await axios.post("http://localhost:9999/ebl-api", {
      functionName: "SchmDetail",
      requestData: {
        accountNo: acNo,
      },
    });

    console.log(response, "------------========response=============11111");

    const queryResult = response?.data?.QueryResult; // Accessing QueryResult array

    const formattedOutput = queryResult?.map((result) => ({
      value: result.IDNUM || "",
      label: result.ACCT || "",
      accountName: result.ACCTNAME || "",
      branch: result.BRANCH || "",
      schmCode: result.SCHMCODE || "",
      cid: result.CUSTID || "",
      idNum: result.IDNUM || "",
      statusId: result.ACCTSTATUS || "1", // Assuming statusId as string
    }));

    setTimeout(() => {
      res.json({
        data: formattedOutput,
        msg: "success",
      });
    }, 2000); // 2000 milliseconds = 2 seconds
  } catch (e) {
    console.log("------------error on api fetch---------------");
    console.log(e.message);
    res.status(500).json({
      msg: "error",
      error: e.message,
    });
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
