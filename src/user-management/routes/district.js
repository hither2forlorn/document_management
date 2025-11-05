const router = require("express").Router();
const auth = require("../../config/auth");
const { District } = require("../../config/database");

router.get("/district", auth.required, async (req, res, next) => {
  District.findAll({
    where: { isDeleted: false },
  })
    .then((district) => {
      res.json({ success: true, data: district });
    })
    .catch((err) => {
      console.log(err);
      res.status(500);
      res.json({ success: false, message: "Server Error!" });
    });
});

module.exports = router;
