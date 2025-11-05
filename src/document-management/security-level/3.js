const { DocumentAccessUser, User, Document } = require("../../config/database");
const { sendMessage } = require("../../util/send_email");
const { userAccessTemplate, otpEmailTemplate, otpEmailForOwnerTemplate } = require("../../util/email_template");

/**
 * Method to send email to the users who has access to the particular document
 * @method module:DocumentSecurityModule#sendToUser
 * @alias sendToUser
 * @param {Array<Object>} userList  - List of users who received the access to the particular documents
 * @param {Number} docId            - Id of the document whose access is provided to the list of users
 */
async function sendToUser(userList, docId) {
  const document = await Document.findOne({ where: { id: docId }, raw: true });
  userList.forEach((e) => {
    User.findOne({
      where: { id: e.value },
      raw: true,
      attributes: ["email", "name"],
    })
      .then((user) => {
        sendMessage(userAccessTemplate(user, document));
      })
      .catch((err) => {
        console.log(err);
      });
  });
}

/**
 * send otp to user to verify before they access the document
 * @param {*} email
 * @param {*} docId
 */
module.exports.sendOtpToUser = async function sendOtpToUser(email, otp) {
  sendMessage(otpEmailTemplate(email, otp));
};

/**
 * send otp to user to verify before they access the document
 * @param {*} email
 * @param {*} docId
 */
module.exports.sendOtpAccessInfoToOwner = async function sendOtpToUser(email, accessingUser, document) {
  sendMessage(otpEmailForOwnerTemplate(email, accessingUser, document));
};

/**
 * Adding user list to the document access list for the particular document
 * @method module:DocumentSecurityModule#addUserAcessDataDocument
 * @param {Number} docId
 * @param {Array<Object>} userList
 * @param {*} callback
 */
module.exports.addUserAcessDataDocument = (docId, userList, callback) => {
  sendToUser(userList, docId);
  userList.forEach((e) => {
    const data = { documentId: docId, userId: e.value };
    DocumentAccessUser.create(data).catch((err) => {
      console.log(err);
    });
  });
  callback(null);
};

/**
 * Updating user list to the document access list for the particular document
 * @method module:DocumentSecurityModule#updateUserAcessDataDocument
 * @param {Number} docId
 * @param {Array<Object>} userList
 * @param {*} callback
 */
module.exports.updateUserAcessDataDocument = (docId, userList, callback) => {
  sendToUser(userList, docId);
  DocumentAccessUser.destroy({
    where: { documentId: docId },
  }).then((_) => {
    userList.forEach((e) => {
      const data = { documentId: docId, userId: e.value };
      DocumentAccessUser.create(data).catch((err) => {
        console.log(err);
      });
    });
    callback(null);
  });
};
