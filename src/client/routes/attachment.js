const router = require("express").Router();
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { checkFtp, storage } = require("../../config/filesystem");
const { Attachment } = require("../../config/database");
const { downloadAttachmentFromFtp, uncompressAttachment, uploadAttachments } = require("../util/attachment");
const multer = require("multer");

async function checkCompressing(attachment) {
  if (attachment.isCompressed) {
    const fileInfo = await uncompressAttachment(attachment.filePath);
    await Attachment.update(
      {
        isCompressed: false,
        filePath: fileInfo.filePath,
        size: fileInfo.size,
      },
      { where: { id: attachment.id } }
    );
    return fileInfo.filePath;
  } else {
    return attachment.filePath;
  }
}

router.get("/attachment/download/:id", auth.client, (req, res, next) => {
  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        where: { id: req.params.id },
        raw: true,
      })
        .then(async (attachment) => {
          const filePath = await checkCompressing(attachment);
          downloadAttachmentFromFtp("temp" + filePath, filePath).then((isSuccessful) => {
            if (isSuccessful) {
              res.send({ success: true, file: filePath });
            } else {
              res.send({ success: false, message: "Error in download!" });
            }
          });
        })
        .catch((err) => {
          logger.error(err);
          res.json({ success: false, message: "Error!!!" });
        });
    } else {
      res.json({ success: false, message: "FTP Server is down!" });
    }
  });
});

router.get("/attachment/preview/:id", auth.client, (req, res, next) => {
  checkFtp((isConnected) => {
    if (isConnected) {
      Attachment.findOne({
        where: { id: req.params.id },
        raw: true,
      })
        .then(async (attachment) => {
          const filePath = await checkCompressing(attachment);
          await downloadAttachmentFromFtp("temp" + filePath, filePath).then((isSuccessful) => {
            if (isSuccessful) {
              const fileType = attachment.name.split(".");
              res.send({
                success: true,
                filePath: filePath,
                fileType: fileType[fileType.length - 1],
              });
            } else {
              res.send({ success: false, message: "Error!" });
            }
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({ success: false, message: "Error!!!" });
        });
    } else {
      res.json({ success: false, message: "FTP Server is down!" });
    }
  });
});

router.post("/attachment", auth.client, (req, res, next) => {
  const createdBy = req.payload.id;
  const upload = multer({ storage: storage }).array("file");
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
      logger.error(err);
      res.status(500).send({ success: false, message: err?.message || "Error" });
    } else {
      const files = req.files;
      const { itemId, itemType } = req.body;
      const attachments = [];
      files.forEach((file) => {
        const attachment = {
          name: file.originalname,
          fileType: file.mimetype,
          size: file.size / 1024,
          filePath: "/" + itemType + "/" + itemId + "/" + Date.now() + "-" + file.originalname,
          localPath: file.path,
          itemId: itemId,
          ...(itemType ? { itemType } : {}),
          attachmentType: "normal-upload",
          isDeleted: false,
          createdBy,
          ...(createdBy === 1 ? { pendingApproval: 1 } : {}),
        };

        attachments.push(attachment);
        console.log(attachments, "hereeee");
      });
      uploadAttachments(attachments)
        .then((success, failure) => {
          if (failure) {
            res.status(500).send("Error");
          } else {
            res.send("Success");
          }
        })
        .catch((err) => {
          res.status(500).send("Error");
        });
    }
  });
});

module.exports = router;
