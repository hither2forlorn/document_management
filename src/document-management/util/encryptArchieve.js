const { Attachment, Document } = require("../../config/database");
const { checkFtp } = require("../../config/filesystem");
const { downloadAttachments, uploadAttachments } = require("./attachment");
const compressing = require("compressing");
const Sequelize = require("sequelize");

// wrap the function in a try catch block

const encryptArchieve = async () => {
  try {
    checkFtp(async (isConnected) => {
      let res;
      if (!isConnected) return res.json({ success: false, message: "FTP Server is down!" });

      // mock req.payload
      const reqPayload = {
        id: 1,
        email: "admin@gentech.com",
        roleId: 1,
        hierarchy: "Super-001",
        branchId: 1,
        departmentId: 1,
        exp: 1666031279,
        iat: 1666013279,
      };

      Document.hasMany(Attachment, { foreignKey: "itemId", sourceKey: "id" });

      // find documents with isArchieved is true
      const docs = await Document.findAll({
        where: {
          isArchived: true,
          isDeleted: false,
          hasEncryption: false,
        },
        include: [
          {
            model: Attachment,
            where: { isDeleted: false, isEncrypted: false, redaction: false, itemType: "document" },
            required: false,
          },
        ],
        limit: 1,
      });
      if (docs.length > 0) {
        for (const doc of docs.splice(0, 1)) {
          console.log("--------------------DOCOUMENT FOUND-----------");
          const attachments = doc.attachments;
          if (attachments.length > 0) {
            // download attachments from ftp
            const isDownloaded = await downloadAttachments(attachments, (isWatermark = false), {
              email: reqPayload.email,
            });
            console.log("-----------DOWNLOADED ATTACHMENT------");

            if (isDownloaded && doc.id) {
              const doc_name = doc.id;
              const output_file = doc_name + ".tar";

              const localZip = "temp/" + "document" + "/" + doc_name;
              const zipLocation = "temp/" + "document" + "/" + output_file;
              const remoteSend = "document/" + doc_name + "/" + output_file;

              // upload compressed folder to ftp
              await compressing.tar
                .compressDir(localZip, zipLocation)
                .then(() => {
                  console.log("-----------COMPRESSED------");
                  uploadAttachments(
                    [{ filePath: remoteSend, localPath: zipLocation, itemId: doc.id }],
                    res,
                    reqPayload,
                    true
                  )
                    .then((isUploaded) => {
                      if (isUploaded) {
                        console.log("-----------COMPRESSED ATTACHMENTS UPLOADED------");
                      }
                    })
                    .catch((err) => {
                      console.log("Error in uploading", err);
                    });
                })
                .catch((err) => {
                  console.log(err, " this is errrr");
                });

              const filteredAttachments = attachments.map((att) => {
                return {
                  name: att.name,
                  fileType: att.fileType,
                  size: att.size,
                  isEncrypted: true,
                  redaction: JSON.parse(att.redaction) || false,
                  filePath: att.filePath,
                  localPath: "temp" + att.filePath,
                  itemId: att.itemId,
                  attachmentType: "normal-upload",
                  isDeleted: false,
                  createdBy: att.createdBy,
                };
              });
              await Document.update(
                { hasEncryption: true, isArchived: true },
                {
                  where: {
                    id: doc.id,
                  },
                }
              );
              // upload encrypted attachments
              await uploadAttachments(filteredAttachments, res, reqPayload, true);
              console.log("-----------DOCUMENT UPLOADED TO FTP------");

              const getIdToUpdate = filteredAttachments.map((ele) => ele.itemId);
              await Document.update(
                { hasEncryption: true },
                {
                  where: {
                    id: getIdToUpdate,
                  },
                }
              );
              await Attachment.update(
                { isEncrypted: true },
                {
                  where: {
                    itemId: {
                      [Sequelize.Op.in]: getIdToUpdate,
                    },
                  },
                }
              );
              console.log("-----------ATTACHMENT UPLOADED TO FTP------");
            }
          }
        }
      } else {
        console.log("No Document Found");
        return;
      }
      return;
    });
  } catch (err) {
    console.log(err, " this is errrr");
  }
};

module.exports = encryptArchieve;
