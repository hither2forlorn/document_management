const router = require("express").Router();
const auth = require("../../config/auth");
const sequelize = require("sequelize");
const { canViewTheDocument } = require("../auth");
const { DocumentAudit, Document, Department } = require("../../config/database");

/**
 * Get the data for the tag cloud to view Tag Cloud according to the frequency of document access
 *
 * @memberof DocumentManagementModule
 * @param {Number} userId
 * @returns {Array} List of documents with attributes count,id,name,colorCode
 */
async function getTagCloudData(userId) {
  const options = {
    include: [
      {
        model: Document,
        attributes: [],
      },
    ],
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("documentId")), "count"],
      "document.id",
      "document.name",
      "document.securityLevel",
      "document.ownerId",
      "document.department",
    ],
  };
  Document.hasMany(DocumentAudit, { foreignKey: "documentId" });
  DocumentAudit.belongsTo(Document, { foreignKey: "documentId" });

  const docs = await DocumentAudit.findAll({
    logging: true,
    where: { accessType: "open" },
    raw: true,
    ...options,
    group: ["document.id"],
  });
  const filteredDocs = await canViewTheDocument(userId, docs);
  const finalDocs = await Promise.all(
    filteredDocs.map(async (item) => {
      const dept = await Department.findOne({
        raw: true,
        attributes: ["colorCode"],
        where: { id: item.department },
      });
      return {
        value: item.name,
        count: item.count,
        key: item.id,
        color: dept.colorCode,
      };
    })
  );
  return finalDocs;
}

/**
 * Retrieves the documents with the count on the number of times they have been accessed
 *
 * @alias POST/get-tag-cloud
 * @memberof DocumentManagementModule
 */
router.post("/get-tag-cloud", auth.required, (req, res, next) => {
  /**
   * {
   *      value: "document.name",
   *      count: "COUNT(documentAudit.documentId)",
   *      key: "document.id",
   *      color: "department.colorCode",
   * }
   */
  /**
   * **ERROR IN CONCURRENT REQUEST TO THE ORM**
   */
  getTagCloudData(req.payload.id)
    .then((data) => {
      res.json({ success: true, data: data });
    })
    .catch((err) => {
      console.log(err);
      res.json({ success: false, message: "Error" });
    });
});

module.exports = router;
