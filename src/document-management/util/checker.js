/**
 * @module ApprovalQueueModule
 */

const { ApprovalMaster, ApprovalQueue, Document, User, Attachment } = require("../../config/database");
const { sendMessage } = require("../../util/send_email");
const {
  makerCheckerInitiated,
  makerCheckerApproved,
  makerCheckerReject,
  documentDeleteEmail,
} = require("../../util/email_template");
const { DOCUMENT, ATTACHMENT } = require("../../config/delete");
const { getDocument } = require("./getModelDetail");
const { execSelectQuery } = require("../../util/queryFunction");
const { Op } = require("sequelize");

/**
 * Find document or attachment from doc id
 * @params docId
 * @returns DOCUMENT OR ATTACHMENT
 */
async function get_document_or_attachment(docId) {
  // get isApproved from document
  const { isApproved } = await getDocument(docId);
  const type = isApproved ? ATTACHMENT : DOCUMENT;
  return type;
}

/**
 * Sending email to the Checker for approval
 *
 * @method module:ApprovalQueueModule#sendEmailMakerCheckerInit
 * @param {Number} makerId      User id of the document creator (Maker)
 * @param {Number} checkerId    User id of the document approver (Checker)
 * @param {Number} docId        Id of the document
 */
module.exports.sendEmailMakerCheckerInit = async (makerId, checkerId, docId) => {
  const getMaker = User.findOne({
    where: { id: makerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getChecker = User.findOne({
    where: { id: checkerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getDoc = Document.findOne({
    where: { id: docId },
    raw: true,
  });
  const [maker, checker, document] = await Promise.all([getMaker, getChecker, getDoc]);
  sendMessage(makerCheckerInitiated(maker, checker, document));
};
module.exports.sendEmailDocumentDelete = async (makerId, checkerId, docId) => {
  const getMaker = User.findOne({
    where: { id: makerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getChecker = User.findOne({
    where: { id: checkerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getDoc = Document.findOne({
    where: { id: docId },
    raw: true,
  });
  const [maker, checker, document] = await Promise.all([getMaker, getChecker, getDoc]);
  await sendMessage(documentDeleteEmail(maker, checker, document));
};

/**
 *
 * @method module:ApprovalQueueModule#sendEmailMakerCheckerApprove
 * @param {Number} checkerId    User id of the document approver (Checker)
 * @param {Number} docId        Id of the document
 */
async function sendEmailMakerCheckerApprove(checkerId, docId, rejectionMessage) {
  const getChecker = User.findOne({
    where: { id: checkerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getDoc = Document.findOne({
    where: { id: docId },
    raw: true,
  });
  let [checker, document] = await Promise.all([getChecker, getDoc]);
  User.findOne({
    where: { id: document.ownerId },
    raw: true,
  }).then((maker) => {
    document.rejectionMessage = rejectionMessage;

    sendMessage(makerCheckerApproved(maker, checker, document));
  });
}

/**
 *
 * @method module:ApprovalQueueModule#sendEmailMakerCheckerReject
 * @param {Number} checkerId    User id of the document approver (Checker)
 * @param {Number} docId        Id of the document
 */
async function sendEmailMakerCheckerReject(checkerId, docId, rejectionMessage) {
  const getChecker = User.findOne({
    where: { id: checkerId },
    raw: true,
    attributes: ["email", "name"],
  });
  const getDoc = Document.findOne({
    where: { id: docId },
    raw: true,
  });
  let [checker, document] = await Promise.all([getChecker, getDoc]);
  User.findOne({
    where: { id: document.ownerId },
    raw: true,
  }).then((maker) => {
    sendMessage(makerCheckerReject(maker, checker, document, rejectionMessage));
  });
}

/**
 * Adds checker to the document
 *
 * @method module:ApprovalQueueModule#addChecker
 * @method
 * @param {DocumentModel} documentItem
 */
module.exports.addChecker = (documentItem, attachment) => {
  const doc = attachment ? documentItem : documentItem.dataValues;

  const checker = doc.checker;
  checker.forEach((item, index) => {
    ApprovalMaster.create({
      isActive: true,
      currentLevel: 1,
      documentId: doc.id,
      initiatorId: documentItem.ownerId,
      assignedTo: item.userId,
      type: attachment ? ATTACHMENT : DOCUMENT,
    })
      .then((approvalMaster) => {
        ApprovalQueue.create({
          approvalMasterId: approvalMaster.id,
          isActive: true,
          level: 0,
          userId: documentItem.ownerId,
          isApprover: false,
        }).catch((err) => console.log(err));
        // sendEmailMakerCheckerInit(doc.ownerId, item.userId, doc.id);
        ApprovalQueue.create({
          approvalMasterId: approvalMaster.id,
          isActive: true,
          level: index + 1,
          userId: item.userId,
          isApprover: item.isApprover,
        }).catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  });
};

/**
 * Approves the document by the checker
 *
 * @method module:ApprovalQueueModule#approveDocument
 * @method
 * @param {Number}      userId
 * @param {Number}      docId
 * @param {Function}    callback Callback function returning a response
 */

// module.exports.approveDocument = async (userId, docId, callback) => {
//   const type = await get_document_or_attachment(docId);

//   ApprovalMaster.findOne({
//     where: { documentId: docId, type },
//   })
//     .then((master) => {
//       ApprovalQueue.findAll({
//         where: { approvalMasterId: master.id },
//         raw: true,
//       })
//         .then(async (queue) => {
//           let approved = false;

//           // Approval  Queue
//           queue.forEach((item) => {
//             if (item.userId == userId && item.isApprover) {
//               Document.update({ isApproved: true, returnedByChecker: false }, { where: { id: docId } }).then(async (_) => {
//                 approved = true;
//                 // sendEmailMakerCheckerApprove(userId, docId);
//               });
//             }
//           });

//           // approval master update isActive
//           await ApprovalMaster.update({ isActive: false }, { where: { id: master.id } });

//           // find attachments and  update pending Approval to false
//           const attachments = await execSelectQuery(`
//             SELECT a.* from documents d
//             join attachments a on d.id=a.itemId
//             where a.itemId =${docId} and a.pendingApproval=1`);

//           await Promise.all(
//             attachments.map(async (row) => {
//               await Attachment.update({ pendingApproval: false }, { where: { id: row.id, isDeleted: false } });
//             })
//           );

//           callback({ success: true, type, message: "Document Approved!" });
//         })
//         .catch((err) => {
//           callback({ success: false, message: "Error!" });
//           console.log(err);
//         });
//     })
//     .catch((err) => {
//       callback({ success: false, message: "Error!" });
//       console.log(err);
//     });
// };



module.exports.approveDocument = async (userId, docId, callback) => {
  const type = await get_document_or_attachment(docId);

  ApprovalMaster.findAll({
    where: { documentId: docId, type },
  })
    .then((masters) => {
      if (!masters || masters.length === 0) {
        return callback({ success: false, message: "No ApprovalMaster found" });
      }

      const masterIds = masters.map((m) => m.id);

      ApprovalQueue.findAll({
        where: { approvalMasterId: { [Op.in]: masterIds } },
        raw: true,
      })
        .then(async (queue) => {
          let approved = false;

          // Approval  Queue
          queue.forEach((item) => {
            if (item.userId == userId && item.isApprover) {
              Document.update({ isApproved: true, returnedByChecker: false }, { where: { id: docId } }).then(async (_) => {
                approved = true;
                // sendEmailMakerCheckerApprove(userId, docId);
              });
            }
          });

          // approval master update isActive for all masters
          await ApprovalMaster.update({ isActive: false }, { where: { id: { [Op.in]: masterIds } } });

          // find attachments and update pendingApproval to false
          const attachments = await execSelectQuery(`
            SELECT a.* from documents d
            join attachments a on d.id=a.itemId
            where a.itemId =${docId} and a.pendingApproval=1`);

          await Promise.all(
            attachments.map(async (row) => {
              await Attachment.update({ pendingApproval: false }, { where: { id: row.id, isDeleted: false } });
            })
          );

          callback({ success: true, type, message: "Document Approved!" });
        })
        .catch((err) => {
          callback({ success: false, message: "Error!" });
          console.log(err);
        });
    })
    .catch((err) => {
      callback({ success: false, message: "Error!" });
      console.log(err);
    });
};

// for resubmitting document
module.exports.resubmitDocument = async (userId, docId, callback) => {
  const type = await get_document_or_attachment(docId);

  ApprovalMaster.findOne({
    where: { documentId: docId, isActive: true, type },
  })
    .then((master) => {
      ApprovalQueue.findAll({
        where: { approvalMasterId: master.id },
        raw: true,
      })
        .then((queue) => {
          queue.forEach((item) => {
            if (item.userId == userId && !item.isApprover) {
              try {
                Document.update(
                  {
                    // isApproved: false,
                    returnedByChecker: false,
                    sendToChecker: true,
                    isArchived: false,
                  },
                  { where: { id: docId } }
                )
                  .then((_) => {
                    // sendEmailMakerCheckerApprove(userId, docId);
                    callback({
                      success: true,
                      type,
                      message: "Document Resubmitted!",
                    });
                  })
                  .catch((err) => {
                    callback({ success: false, message: "Error!" });
                  });
              } catch (err) {
                next(err);
                callback({
                  success: false,
                  message: "Resubmission not allowed!",
                });
              }
            }
          });
        })
        .catch((err) => {
          callback({ success: false, message: "Error!" });
          console.log(err);
        });
    })
    .catch((err) => {
      callback({ success: false, message: "Error!" });
      console.log(err);
    });
};

// for archiving documents
module.exports.archiveDocument = async (userId, docId, rejectionMessage, callback) => {
  const type = await get_document_or_attachment(docId);
  ApprovalMaster.findOne({
    where: { documentId: docId, type },
  })
    .then((master) => {
      ApprovalQueue.findAll({
        where: { approvalMasterId: master.id },
        raw: true,
      })
        .then((queue) => {
          queue.forEach((item) => {
            if (item.userId === userId && item.isApprover) {
              Document.update(
                {
                  returnedByChecker: true,
                  sendToChecker: false,
                  returnedMessage: rejectionMessage,
                },
                { where: { id: docId } }
              )
                .then((_) => {
                  getDocument(docId).then((document) => {
                    if (document.dataValues.isApproved == false) {
                      Attachment.update({ pendingApproval: true }, { where: { itemId: docId } });
                    }
                  });
                  isArchived = true;
                  // sendEmailMakerCheckerReject(userId, docId, rejectionMessage);
                  callback({ success: true, type, message: "Document Rejected!" });
                })
                .catch((err) => {
                  callback({ success: false, message: "Error!" });
                  console.log(err);
                });
            }
          });
        })
        .catch((err) => {
          callback({ success: false, message: "Error!" });
          console.log(err);
        });
    })
    .catch((err) => {
      callback({ success: false, message: "Error!" });
      console.log(err);
    });
};

/**
 * Returns an array of documents for which a user is the checker
 *
 * @memberof ApprovalQueueModule
 * @method
 * @param {Number}      userId
 * @param {Array}       docs        Array containing the list of documents
 * @param {Function}    callback    Callback function returning an array of documents
 */
module.exports.isChecker = (userId, docs, callback) => {
  const finalDocs = [];
  ApprovalMaster.findAll({
    attributes: ["documentId", "id"],
    raw: true,
  })
    .then((masters) => {
      ApprovalQueue.findAll({
        attributes: ["userId", "isApprover", "approvalMasterId"],
        raw: true,
      })
        .then((queue) => {
          masters.forEach((master) => {
            docs.forEach((doc) => {
              if (master.documentId === doc.id) {
                queue.forEach((queueItem) => {
                  if (queueItem.userId === userId && queueItem.isApprover && master.id === queueItem.approvalMasterId) {
                    finalDocs.push(doc);
                  }
                });
              }
            });
          });
          callback(finalDocs);
        })
        .catch((err) => {
          callback(null);
          console.log(err);
        });
    })
    .catch((err) => {
      callback(null);
      console.log(err);
    });
};
