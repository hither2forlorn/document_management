const router = require("express").Router();

router.post("/license/add", (req, res, next) => {
  const key = req.body;
  //CHeck for validation
  res.status(200).send({ message: "success" });
});

router.get("/license/check", (req, res, next) => {
  res.send({ isActivated: true });
});

module.exports = router;
