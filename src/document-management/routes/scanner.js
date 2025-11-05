const router = require("express").Router();

router.get("/scanner", (req, res) => {
  const scannerPath =
    "C:\\Users\\gente\\Gentech\\Dms\\paperbank\\general-dms-api\\src\\document-management\\naps\\naps2.zip";
  res.download(scannerPath, "naps2.zip");
});

module.exports = router;
