const { includeThisFeature, dms_features } = require("../../config/selectVendor");

const exists = (Model, column) => {
  return (value, req) => {
    return Model.findOne({ where: { [column]: value } }).then((doc) => {
      if (doc) {
        if (doc?.isDeleted) {
          return false;
        } else {
          if (includeThisFeature(dms_features.DOCUMENT_NAME_DUPLICATION)) return false;

          return Promise.reject(`${column === "otherTitle" ? "Document Name" : column} already in use`);
        }
      }
    });
  };
};

module.exports = exists;
