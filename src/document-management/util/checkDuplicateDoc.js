const { Document } = require("../../config/database");

const duplicateChecker = async (req, res, next) => {
  const checkDuplicateDocument = await Document.findOne({
    where: {
      otherTitle: req.body.otherTitle,
      isDeleted: false,
    },
  });

  if (checkDuplicateDocument) {
    res.json({
      success: false,
      message: "Duplicate Document Found",
    });
    return next();
  } else {
    return next();
  }
  return next();
};

module.exports = { duplicateChecker };
