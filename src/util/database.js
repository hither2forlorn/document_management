const { Document, Attachment } = require("../config/database");

const resolveModel = (tableName) => {
  switch (tableName) {
    case "Document":
      return Document;
    case "Attachment":
      return Attachment;
    default:
    // throw some error.
  }
};

module.exports = {
  resolveModel,
};
