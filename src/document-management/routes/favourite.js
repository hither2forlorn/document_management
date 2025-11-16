const router = require("express").Router();
const crypto = require("crypto");
//AUTHENTICATION
const auth = require("../../config/auth");
const logger = require("../../config/logger");
const { canViewTheDocument } = require("../auth");
const Op = require("sequelize").Op;
const { Favourite, Document, sequelize, Branch } = require("../../config/database");
const _ = require("lodash");
const { getArchivedDocumnet, getFavouriteDocument } = require("../util/documentPaginate");
const Sequelize = require("sequelize");
const getAssociatedBranches = require("../../util/getAssociatedBranches");
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
    let paginationDocument = await sequelize.query(getFavouriteDocument(req.query, false, req.payload), {
      type: Sequelize.QueryTypes.SELECT,
    });

    console.log('Before filtering - raw documents:', paginationDocument.length);
    
    // FIRST: Remove duplicates and get only current user's favourites
    const userFavourites = await Favourite.findAll({
      where: {
        ownerId: req.payload.id,
        isfavourite: true
      },
      attributes: ['documentId'],
      raw: true
    });

    const favouriteDocIds = userFavourites.map(fav => fav.documentId);

    // SECOND: Filter to show only documents that current user has favourited
    paginationDocument = paginationDocument.filter(doc => 
      favouriteDocIds.includes(doc.id)
    );

    // THIRD: Remove duplicates (in case same document appears multiple times)
    const uniqueDocuments = [];
    const seenIds = new Set();
    
    paginationDocument.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        uniqueDocuments.push(doc);
      }
    });

    paginationDocument = uniqueDocuments;

    // Apply role-based filtering for non-admin users
    if (req.payload.roleId !== 1) {
      if (req.payload.branchId) {
        const userBranch = await Branch.findAll({
          attributes: ["name"],
          where: {
            id: req.payload.branchId,
          },
          raw: true,
        });
        if (userBranch.length > 0) {
          const branchName = userBranch[0].name;
          paginationDocument = paginationDocument.filter((doc) => doc.Branch === branchName);
        } else {
          paginationDocument = [];
        }
      } else {
        const allowedBranches = await getAssociatedBranches(req.payload.departmentId);
        const allowedBranchNames = allowedBranches.map((b) => b.name);
        paginationDocument = paginationDocument.filter((doc) => {
          if (doc.Branch === null || doc.Branch === undefined) return true;
          return allowedBranchNames.includes(doc.Branch);
        });
      }
    }

    res.send({
      paginationDocument,
      total: paginationDocument.length, // Use actual count after filtering
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ 
      message: 'Internal server error',
      success: false 
    });
  }
});
module.exports = router;
