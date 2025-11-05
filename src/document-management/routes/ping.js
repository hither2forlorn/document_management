const { checkFtp } = require("../../config/filesystem");

const router = require("express").Router();

router.get("/ping", async (req, res, next) => {
  const isConnected = await new Promise((resolve) => checkFtp((isConnected) => resolve(isConnected)));
  if (!isConnected) res.status(400).send({ success: fale, message: "FTP not connected" });
  else res.status(200).send({ success: true, message: "DMS Server is live" });
});

module.exports = router;
