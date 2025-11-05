const {
  Logs,
  Document,
  Attachment,
  User,
  SecurityHierarchy,
  LocationMap,
  DocumentType,
  DocumentTypeIndex,
  Role,
} = require("../config/database");

const _ = require("lodash");

const USER = "user";
const USER_STATUS = "userStatus";
const ROLE = "role";
const DEPARTMENT = "department";
const BRANCH = "branch";
const DOCUMENT = "document";
const ATTACHMENT = "attachment";
const LETTER = "letter";
const DOCUMENT_CONDITION = "documentCondition";
const DOCUMENT_TYPE = "documentType";
const DOCUMENT_INDEX = "documentIndex";
const LOCATION_MAP = "locationMap";
const LOCATION_TYPE = "locationType";
const LANGUAGE = "language";
const FORM = "form";
const MEMO = "memo";
const SECURITY_HIERARCHY = "security_hierarchy";

/**
 * constantLogType is the type of features that is to be logged.
 *
 */
const constantLogType = {
  DOCUMENT: 1,
  ATTACHMENT: 2,
  ROLES: 3,
  USER: 4,
  SECURITY_HIERARCHY: 5,
  LOCATION_MAP: 6,
  DOCUMENT_TYPES: 7,
  DOCUMENT_INDEX: 8,
  DEPARTMENT: 9,
  BRANCH: 10,
};

function findModelType(name) {
  switch (name) {
    case DOCUMENT:
      return 1;

    case ATTACHMENT:
      return 2;

    case ROLE:
      return 3;

    case USER:
      return 4;

    case SECURITY_HIERARCHY:
      return 5;

    case LOCATION_MAP:
      return 6;

    case DOCUMENT_TYPE:
      return 7;

    case DOCUMENT_INDEX:
      return 8;

    case DEPARTMENT:
      return 9;

    case BRANCH:
      return 10;
    default:
      return name;
  }
}

/**
 *
 * @param {*} req contains all the request of different log type
 * @param {*} modelTypeId it represents the model that is going to be logged i.e. (document,  roles etc.)
 * @param {*} modelValueId it represents the value of the model type i.e. (determines the specific docs that we loged)
 * @param {*} query it represents the query of th model type that is going to be logged.
 */
const createLog = async (req, modelTypeId, modelValueId, query, previousValue) => {
  const operation = req.method;
  const url = req.url;
  const statusCode = req.statusCode;
  const statusMessage = req.statusMessage;
  const ipAddress = req.ip || "";
  let diff = {};

  // find the changes in database
  if (previousValue && req.method == "PUT")
    try {
      diff = difference(req.body, previousValue);
    } catch (error) {
      console.log("Error in logs :diff");
      diff = {};
    }

  const body = {
    modelValueId: modelValueId,
    // query: JSON.stringify(query),
    createdBy: req?.payload?.id ? req.payload.id : "1",
    body: JSON.stringify(req?.body || {}) || null,
    modelTypeId: typeof modelTypeId == "string" ? findModelType(modelTypeId) : modelTypeId,
    operation,
    previousValue: previousValue ? JSON.stringify(previousValue) : null,
    url,
    diff: diff ? JSON.stringify(diff) : null,
    statusCode,
    statusMessage,
    ipAddress,
  };

  try {
    await Logs.create(body);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
  function changes(object, base) {
    return _.transform(object, function (result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] = _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

/**
 * Find the previousValue of a table.
 *
 * @param {number} type
 * @param {number} id
 * @returns column value of a model
 */
async function findPreviousData(type, id, operation) {
  if (operation == "GET") return null;

  var Model;

  switch (type) {
    case constantLogType.DOCUMENT:
      Model = Document;
      break;
    case constantLogType.ATTACHMENT:
      Model = Attachment;
      break;
    case constantLogType.ROLES:
      Model = Role;
      break;
    case constantLogType.USER:
      Model = User;
      break;
    case constantLogType.LOCATION_MAP:
      Model = LocationMap;
      break;
    case constantLogType.SECURITY_HIERARCHY:
      Model = SecurityHierarchy;
      break;
    case constantLogType.DOCUMENT_INDEX:
      Model = DocumentTypeIndex;
      break;
    case constantLogType.DOCUMENT_TYPES:
      Model = DocumentType;
      break;
  }

  try {
    const data = await Model.findOne({ where: { id } });
    return data;
  } catch (error) {
    console.log("Error: log Model not found");
    console.log(error);
    return null;
  }
}

module.exports = { createLog, constantLogType, findPreviousData };
