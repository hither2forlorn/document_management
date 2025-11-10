const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { getSortedItems } = require("../../util/array");
const { availableHierarchy } = require("../../util/hierarchyManage");
const {
  User,
  RoleType,
  Language,
  DocumentCondition,
  DocumentType,
  DocumentTypeIndex,
  LocationType,

  SecurityLevel,
  RoleControl,
  Province,
  District,
  Constant,
  UserGroup,
  Branch,
  LocationMap,
} = require("../../config/database");
const PRODUCTION_ENV = require("../../util/checkNodeEnv");
const { filterCheckerList, DocumentTypeData, BranchData } = require("../util/get_all_util");

/**
 * @method module:Miscellaneous#getAll
 * @returns Responds with all the meta_data for viewing purposes in the GUI
 */
router.get("/all", auth.required, async (req, res, next) => {
  if (!PRODUCTION_ENV) console.log(req.socket.remoteAddress);
  const userId = req.payload.id;
  const user = {
    id: userId,
    departmentId: req.payload.departmentId || "",
    branchId: req.payload.branchId || "",
    hierarchy: req.payload.hierarchy,
  };
  
  const userAttributes =
    "branchId,createdAt,createdBy,dateOfBirth,dateRegistered,departmentId,designation,distinguishedName,editedBy,email,expiryDate,gender,hierarchy,id,identityNo,isActive,isDeleted,loginAttempts,loginAttemptsCount,name,notes,phoneNumber,roleId,statusId,type,updatedAt,username";
  const statuses = [
    { name: "Active", id: 1, value: "active" },
    { name: "Checked Out", id: 2, value: "checkedOut" },
    { name: "Suspended", id: 3, value: "checkedIn" },
    { name: "Dormant", id: 4, value: "dormant" },
    { name: "Closed", id: 5, value: "closed" },
  ];
  const userStatuses = [
    { name: "Active", id: 1 },
    { name: "Inactive", id: 2 },
    { name: "Retired", id: 3 },
  ];
  const memoStatuses = [
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Not Started", label: "Not Started" },
  ];

  const isArchived = [
    { id: 0, name: "No" },
    { id: 1, name: "Yes" },
  ];

  let defaultValues = {};
  if (req.payload.branchId) {
    const getBranch = await Branch.findOne({
      where: {
        id: req.payload.branchId,
      },
    });
    const getBranchName = getBranch.dataValues.name;
    const originalBranchName = getBranchName.replace(/ BRANCH/g, "");
    const findLocationMap = await LocationMap.findOne({
      where: {
        name: originalBranchName,
      },
    });

    defaultValues = {
      locationMapId: req.payload.id == 1 ? {} : findLocationMap ? findLocationMap.dataValues.id : {},
      securityLevel: 2,
    };
  }
  const branches = await Branch.findAll({
    where: { isDeleted: false },
  });
  DocumentType.hasMany(DocumentTypeIndex, {
    foreignKey: "docId",
    sourceKey: "id",
  });

  User.hasMany(RoleControl, {
    foreignKey: "roleId",
    sourceKey: "roleId",
  });

  let users = await availableHierarchy(user, "users", userAttributes, "");

  // filter user - active only, checkers,
  const filterUser = await filterCheckerList(req, users, true);
  const checkerList = await filterCheckerList(req, users);
  const viewUsersBySuperAdmin = req?.payload?.hierarchy === "Super-001" ? users : [];

  Promise.all([
    availableHierarchy(user, "roles", "id, name ,hierarchy", ""),
    RoleType.findAll({ where: { isDeleted: false } }),
    SecurityLevel.findAll(),
    Language.findAll({
      where: { isDeleted: false },
      attributes: ["id", "name"],
    }),
    DocumentCondition.findAll({
      where: { isDeleted: false },
      attributes: ["id", "name"],
    }),
    DocumentTypeData(req),
    availableHierarchy(user, "location_maps", "*", ""),
    LocationType.findAll({ where: { isDeleted: false } }),
    availableHierarchy(user, "departments", "*", ""),
    availableHierarchy(user, "security_hierarchies", "*", "", "code"),
    BranchData(req),
    District.findAll({
      where: { isDeleted: false },
    }),
    Province.findAll({
      where: { isDeleted: false },
    }),
    Constant.findAll({}),
    UserGroup.findAll({}),
  ])

    .then(
      ([
        roles,
        roleTypes,
        securityLevels,
        languages,
        documentConditions,
        documentTypes,
        locationMaps,
        locationTypes,
        departments,
        hierarchy,
        districts,
        provinces,
        constants,
        userGroup,
      ]) => {
        res.send({
          users: viewUsersBySuperAdmin,
          roles,
          roleTypes,
          securityLevels,
          languages,
          statuses,
          userStatuses,
          documentConditions,
          documentTypes: getSortedItems(documentTypes, null, true),
          locationMaps: getSortedItems(locationMaps, null, true),
          locationTypes,
          departments: getSortedItems(departments, null, true),
          hierarchy: getSortedItems(hierarchy, null, true).filter((hierarchy) => hierarchy?.id !== 1),
          memoStatuses,
          isArchived,
          districts,
          provinces,
          constants,
          checkerList,
          userGroup,
          defaultValues,
          branches,
        });
      }
    )
    .catch((err) => {
      logger.error(err);
      // console.log(err);
      res.status(500).send("Error!");
    });
});

module.exports = router;
