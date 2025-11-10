const router = require("express").Router();
const {accountList,accountNameList  }= require("./mocks");

router.get("/account-list", (req, res, next) => {
res.json({
    data:accountList,
    msg:"success"
});
})