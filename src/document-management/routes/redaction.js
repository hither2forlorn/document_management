const router = require("express").Router();
const multer = require("multer");
const { Attachment } = require("../../config/database");
const { redactionStorage } = require("../../config/filesystem");

let getAttachmentFilePath = "";
let id;
router.get("/redaction/:id", async (req, res, next) => {
  id = req.params.id;
  const attachment = await Attachment.findOne({
    where: {
      id: req.params.id,
    },
  });
  getAttachmentFilePath = "/api" + attachment.filePath;
  res.sendFile("/redaction.html", { root: "redaction" });
  const getAttachment = await Attachment.findOne({
    where: {
      id: req.params.id,
    },
  });

  const updateAttachment = await Attachment.update(
    {
      redaction: true,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  );
});

router.get("/redactionId", (req, res) => {
  res.status(200).send(getAttachmentFilePath);
});

// Assuming you have imported the required modules, models, and the multer setup (redactionStorage).

router.post("/redactedFile", multer({ storage: redactionStorage }).single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const updatedPath = filePath.replace(/\\/g, "/").replace(/temp\//, "");
    const bodyId = req.body.id; // Assuming the ID is passed through the request body.
    await Attachment.update(
      {
        redactedFilePath: updatedPath,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.json({ message: "File path updated successfully" });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
