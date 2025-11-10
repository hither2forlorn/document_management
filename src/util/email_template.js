const { consoleLog } = require(".");
const { getBanksFullName } = require("../config/selectVendor");

/**
 * @method module:Email#userAccessTemplate
 * @param {Object} user User details
 * @param {Object} document Document details
 * @returns Template for sending to the user who has the access to the document of securityLevel = 3
 */
module.exports.userAccessTemplate = (user, document) => {
  const html =
    `<p>Dear ${user.name},</p>` +
    `<br/>` +
    `<p>This is to inform that you can access to the ` +
    `${document?.name || document?.otherTitle} that has been publish in General Docs recently.</p>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${document.owner}` +
    `</p>`;
  return {
    to: user.email,
    subject: "General DMS - Document Uploaded",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#documentUpdateTemplate
 * @param {Object} owner - Owner of the document
 * @param {Object} editor - Editor of the document
 * @param {Object} document - Updated document
 * @returns Template to send to the owner of the document when the document is updated
 */
module.exports.documentUpdateTemplate = (owner, editor, document) => {
  const html =
    `<p>Dear ${owner.name},</p>` +
    `<br/>` +
    `<p>This is to inform that the document ${document?.name || document?.otherTitle} has been recently updated ` +
    `by <b>${editor.name}</b> on General Docs.</p>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${editor.name}` +
    `</p>`;
  return {
    to: owner.email,
    subject: "General DMS - Document Updated",
    text: "",
    html: document?.rejectionMessage ? rejectionMessage : html,
  };
};

/**
 * @method module:Email#makerCheckerInitiated
 * @param {Object} maker - User who created the document
 * @param {Object} checker - User to whom the document is submitted for approval
 * @param {Object} document - The document send for approval
 * @returns Template to send to the checker when s/he got the request for the approval of the document
 */
module.exports.makerCheckerInitiated = (maker, checker, document) => {
  const html =
    `<p>Dear ${checker?.name},</p>` +
    `<br/>` +
    `<p>This is to inform that new documents has been recently uploaded ` +
    `for your <b>verification</b>. Kindly verify and approve to publish on General Docs.</p>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${maker?.name}` +
    `</p>`;
  return {
    to: checker?.email,
    subject: "General DMS - Document Verification",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#makerCheckerApproved
 * @param {Object} maker - User who created the document
 * @param {Object} checker - User to whom the document is submitted for approval
 * @param {Object} document - The approved document
 * @returns Template to send to the maker when checker approved the particular document
 */
module.exports.makerCheckerApproved = (maker, checker, document) => {
  const html =
    `<p>Dear ${maker?.name},</p>` +
    `<br/>` +
    `<p>This is to inform that your document <b>${document?.name || document?.otherTitle}</b> has been recently approved ` +
    `by <b>${checker?.name}</b> and is published on General Docs.</p>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${maker?.name}` +
    `</p>`;
  return {
    to: maker?.email,
    subject: "General DMS - Document Approved",
    text: "",
    html: html,
  };
};
module.exports.documentDeleteEmail = (maker, checker, document) => {
  const html =
    `<p>Dear ${checker?.name},</p>` +
    `<br/>` +
    `<p>This is to inform that your document <b>${document?.name || document?.otherTitle}</b> has been deleted ` +
    `by <b>${maker?.name}</b> and is published on General Docs.</p>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${checker?.name}` +
    `</p>`;
  console.log(html);
  return {
    to: checker?.email,
    subject: "General DMS - Document Approved",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#makerCheckerApproved
 * @param {Object} maker - User who created the document
 * @param {Object} checker - User to whom the document is submitted for approval
 * @param {Object} document - The approved document
 * @returns Template to send to the maker when checker approved the particular document
 */
module.exports.makerCheckerReject = (maker, checker, document, rejectionMessage) => {
  const html =
    `<p>Dear ${maker?.name},</p>` +
    `<br/>` +
    `<p>This is to inform that the document ${document?.name || document?.otherTitle} has been rejected ` +
    `by <b>${checker?.name}</b> on General Docs.</p>` +
    `because of ` +
    `${rejectionMessage ? rejectionMessage : "reason Not mentioned"}` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `${checker?.name}` +
    `</p>`;
  return {
    to: maker?.email,
    subject: "General DMS - Document Rejected",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#hourlyAccessEmailTemplate
 * @param {Object} options - Options containing the payload for hourly access
 * @param {Object} options.user - User to whom the access has been provided
 * @param {Date} options.validTill - Date time of the expiry of the hourly access token
 * @param {String} options.url - URL generated by the system to provide access of the document to the user
 * @returns Template for the user who has been provided with the document access for securityLevel = 3
 */
module.exports.hourlyAccessEmailTemplate = ({ user: { name, email }, validTill, url }) => {
  const html =
    `<p>Dear ${name},</p>` +
    `<br/>` +
    `<p>This is to inform that you have given access to a secure document` +
    ` which is published on General Docs.` +
    `</br>` +
    `The link to the document is below which will be valid for </p>` +
    new Date(validTill).toString() +
    `<br/>` +
    `<strong>Link: </strong>` +
    `<a href='${url}'>Preview </a>` +
    `<br/>` +
    `Thank You!` +
    `<br/>` +
    `General Technology` +
    `</p>`;

  return {
    to: email,
    subject: "General DMS - Document Access Provided",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#hourlyAccessEmailTemplate
 * @param {Object} options - Options containing the payload for hourly access
 * @param {Object} options.user - User to whom the access has been provided
 * @param {Date} options.validTill - Date time of the expiry of the hourly access token
 * @param {String} options.url - URL generated by the system to provide access of the document to the user
 * @returns Template for the user who has been provided with the document access for securityLevel = 3
 */
module.exports.hourlyAccessUserNotifylTemplate = ({ user: { name, email }, document, otherUser }) => {
  const html =
    `<p>Dear ${name},</p>` +
    `<br/>` +
    `<p>This is to inform that your document <b>"${document?.name || document?.otherTitle}</b> " has been access by ` +
    otherUser +
    `</br>` +
    `Thank You!` +
    `<br/>` +
    `General Technology` +
    `</p>`;

  return {
    to: email,
    subject: "General DMS - Document Access Provided",
    text: "",
    html: html,
  };
};
/**
 * @method module:Email#otpEmailTemplate
 * @param {String} emailAddress - Email address of the user
 * @param {Number} otpCode - Code generated for the OTP verification
 * @returns Template for sending to the user who has request for the OTP verification
 */
module.exports.otpEmailTemplate = (emailAddress, otp) => {
  const html =
    `<p>Dear ${emailAddress},</p>` +
    `<br/>` +
    `<p>We received a request to verify client through your email Address.` +
    `</br>` +
    `Your Verification code is:  </p>` +
    `<strong> ${otp} </strong>` +
    `<br/>` +
    `If you did not request this code, please ignore this email.` +
    `<br/>` +
    `<strong>Please do not forward or give this code to anyone.</strong>` +
    `<br/>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;
  return {
    to: emailAddress,
    subject: "General DMS - Client OTP Code",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#otpEmailTemplate
 * @param {String} emailAddress - Email address of the user
 * @param {Number} otpCode - Code generated for the OTP verification
 * @returns Template for sending to the user who has request for the OTP verification
 */
module.exports.otpEmailForOwnerTemplate = (emailAddress, accessingUser, document) => {
  const html =
    `<p>Dear ${emailAddress},</p>` +
    `<br/>` +
    `<p> ${accessingUser} has requested to view ${document[0]?.name || document[0].otherTitle} document.` +
    `</br>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;

  return {
    to: emailAddress,
    subject: "General DMS - Information",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#approvalEmailTemplate
 * @param {String} emailAddress - Email address of the initiator of the memo
 * @returns Template to send to the initiator of the memo when it has been approved
 */
module.exports.approvalEmailTemplate = (emailAddress) => {
  const html =
    `<p>Dear ${emailAddress},</p>` +
    `<br/>` +
    `<p>Your memo request has been approved successfully` +
    `</br>` +
    `<p>If you did not request any memo, please ignore this email.</p>` +
    `<br/>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;
  return {
    to: emailAddress,
    subject: "General DMS - Request approval",
    text: "",
    html: html,
  };
};

/**
 * @method module:Email#memoInitiateEmailTemplate
 * @param {Object} options
 * @param {String} options.email - Email address of the initiator of the memo - client side
 * @param {String} options.requestId - Request ID of the memo which is generated after the memo is initiated in the bank's side
 * @returns Template to send to the initiator of the memo when it has been initiated within the bank - mainly for the client generated memo
 */
module.exports.memoInitiateEmailTemplate = ({ email, requestId }) => {
  const html =
    `<p>Dear ${email},</p>` +
    `<br/>` +
    `<p>Your memo request has been Initiated successfully.` +
    `</br>` +
    `<p>Your Request Id is: <strong> ${requestId}</strong>.</p>` +
    `<p>If you did not request any memo, please ignore this email.</p>` +
    `<br/>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;
  return {
    to: email,
    subject: "General DMS - Memo Initiated",
    text: "",
    html: html,
  };
};

module.exports.memoApproveEmailTemplate = ({ email, requestId }) => {
  const html =
    `<p>Dear ${email},</p>` +
    `<br/>` +
    `<p>Your memo request has been approved successfully.` +
    `</br>` +
    `<p>Your Request Id is: <strong> ${requestId}</strong>.</p>` +
    `<p>If you did not request any memo, please ignore this email.</p>` +
    `<br/>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;
  return {
    to: email,
    subject: "General DMS - Memo Approved",
    text: "",
    html: html,
  };
};

module.exports.newUserEmailTemplate = (email, password, name, userType) => {
  const html =
    `<p>Dear ${name},</p>` +
    `<br/>` +
    `<p>User has been created successfully with ${userType} privileges.` +
    `</br>` +
    `<p>Your username/email is: <strong> ${email}</strong> and password is: ${password}.</p>` +
    `<p>To login to the DMS, please use the following link: localhost:3000</p>` +
    `<br/>` +
    `Sincerely Yours,` +
    `<br/>` +
    getBanksFullName() +
    `</p>`;
  return {
    to: email,
    subject: "General DMS - New User",
    text: "",
    html: html,
  };
};
