const router = require("express").Router();
const crypto = require("crypto");
//AUTHENTICATION
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { canViewTheDocument } = require("../auth");
const Op = require("sequelize").Op;
const { Favourite, Document, sequelize } = require("../../config/database");
const _ = require("lodash");
const { getArchivedDocumnet, getFavouriteDocument } = require("../util/documentPaginate");
const Sequelize = require("sequelize");
router.get("/favourite", auth.required, async (req, res, next) => {
  const { docId } = req.query;
  if (docId) {
    const result = await Favourite.findAll({
      where: {
        ownerId: req.payload.id,
        documentId: docId,
        isfavourite: true,
      },
    });
    res.json({ success: true, data: result.length > 0 ? "true" : "false" });
  } else res.json({ success: true, data: "false" });
});

router.post("/favourite", auth.required, async (req, res, next) => {
  const { documentId, isfavourite } = req.body;

  const ownerId = req.payload.id;
  const result = await Favourite.findOne({
    where: {
      ownerId: ownerId,
      documentId: documentId,
    },
  });
  const data = JSON.parse(JSON.stringify(result));
  if (result) {
    await Favourite.update(
      { isfavourite: data.isfavourite ? false : true },
      {
        where: {
          ownerId,
          documentId,
        },
      }
    );
  } else {
    await Favourite.create({
      documentId,
      ownerId,
      isfavourite,
    });
  }
  res.json({
    success: true,
    message: "Favourite iteam successfully created!",
  });
});

/**
 * list all favourite document
 */
router.get("/favourite/list", auth.required, async (req, res, next) => {
  req.query.userId = req.payload.id;
  try {
    const paginationDocument = await sequelize.query(getFavouriteDocument(req.query, false, req.payload), {
      type: Sequelize.QueryTypes.SELECT,
    });
    const totalDocument = await sequelize.query(
      // true for counting document
      getFavouriteDocument(req.query, true, req.payload),
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    res.send({
      paginationDocument,
      total: totalDocument[0]?.total,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.send({ message: err });
  }
});
module.exports = router;
