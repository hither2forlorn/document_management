/**
 *
 * Node js - Backend
 *
 * options bok, rbb
 */

const { PRODUCTION_ENV } = require("utils/checkNodeEnv");

const dms_features = {
  DEFAULT_MAKER_CHECKER_DOCUMENTS: "DEFAULT_MAKER_CHECKER_DOCUMENTS", // Enable maker checker for document approval
  UPLOAD_ATTACHMENT_MODAL: "UPLOAD_ATTACHMENT_MODAL", // attachment with index
  EDIT_ATTACHMENTS: "EDIT_ATTACHMENTS",
  ASSOCIATED_IDS: "ASSOCIATED_IDS", // BOK specific - other user attachments
  DocumentType_IN_HIRARCHY: "DocumentType_IN_HIRARCHY",
  DOWNLOAD_REPORT: "DOWNLOAD_REPORT", // Download report for document info and others.
  REVIEW: "REVIEW",
  INDEX_VALIDATION: "INDEX_VALIDATION", // index validation preview in add and edit index type
  // ReCAPTCHA: "ReCAPTCHA", // login recaptcha.
  DEFAULT_ENCRYPTION: "DEFAULT_ENCRYPTION", //default encryption on all docs
  REDACTION: "REDACTION",
  BASIC_WATERMARK: "BASIC_WATERMARK",
};

const banks = {
  rbb: {
    name: "rbb",
    fullName: "Rastriya Banijya Bank",
    domain: "rbb.com.np",
    logo: "watermark/rbb.png",
    defaultManual: "userManual.pdf",
    adminManual: "UserManual_Rbb_Admin.pdf",
    checkerManual: "UserManual_Rbb_Checker.pdf",
    makerManual: "UserManual_Rbb_Maker.pdf",
    scanner: "scanner.exe",
    feautres: [
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
      dms_features.DEFAULT_ENCRYPTION,
      dms_features.DocumentType_IN_HIRARCHY,
      // PRODUCTION_ENV && dms_features.ReCAPTCHA,
      PRODUCTION_ENV,
      // dms_features.BASIC_WATERMARK,
    ],
    excludedFeatures: [],
  },
  bok: {
    name: "bok",
    fullName: "Bank of Kathmandu",
    domain: "bok.com.np",
    logo: "watermark/bok.png",
    defaultManual: "userManual_bok.pdf",
    adminManual: "userManual_bok.pdf",

    feautres: [dms_features.EDIT_ATTACHMENTS, dms_features.ASSOCIATED_IDS, dms_features.UPLOAD_ATTACHMENT_MODAL],

    excludedFeatures: [],
  },
  citizen: {
    name: "citizen",
    fullName: "Citizen Bank",
    domain: "ctznbank.com",
    logo: "watermark/citizens.png",
    defaultManual: "userManual_ctzn.pdf",
    adminManual: "userManual_ctzn.pdf",

    feautres: [
      dms_features.DOWNLOAD_REPORT,
      dms_features.EDIT_ATTACHMENTS,
      dms_features.UPLOAD_ATTACHMENT_MODAL,
      dms_features.INDEX_VALIDATION,
      dms_features.REVIEW,
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
    ],

    excludedFeatures: [],
  },
  everest: {
    name: "everest",
    fullName: "Everest Bank",
    domain: "everestbank.com",
    logo: "watermark/everest.png",
    manual: "userManual.pdf",
    feautres: [
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
      dms_features.UPLOAD_ATTACHMENT_MODAL,
      dms_features.EDIT_ATTACHMENTS,
    ],

    excludedFeatures: [],
  },
  epf: {
    name: "epf",
    fullName: "Employees Provident Fund",
    domain: "epf.org.np",
    logo: "watermark/epf.png",
    defaultManual: "userManual.pdf",
    adminManual: "UserManual_Rbb_Admin.pdf",
    checkerManual: "UserManual_Rbb_Checker.pdf",
    makerManual: "UserManual_Rbb_Maker.pdf",
    adminDemoVideos:["/demo-videos/Add Document.mp4","/demo-videos/Approved Document and search.mp4","/demo-videos/Branch Setting.mp4",
      "/demo-videos/Department Setting.mp4","/demo-videos/Document Condition Setting.mp4","/demo-videos/Document Index Setting.mp4",
      "/demo-videos/Document Type Setting.mp4","/demo-videos/Language Setting.mp4","/demo-videos/Location Map Setting.mp4",
      "/demo-videos/Location Type Setting.mp4","/demo-videos/Rejected Document.mp4","/demo-videos/Role Setting.mp4",
      "/demo-videos/Send to Approver.mp4","/demo-videos/User Setting.mp4"
    ],
    scanner: "scanner.exe",
    feautres: [
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
      dms_features.DEFAULT_ENCRYPTION,
      dms_features.DocumentType_IN_HIRARCHY,
      // PRODUCTION_ENV && dms_features.ReCAPTCHA,
      dms_features.UPLOAD_ATTACHMENT_MODAL,
      // dms_features.BASIC_WATERMARK,
    ],
    excludedFeatures: [],
  },
};

// selection of vendor
let selectedVendor, vendor;
switch (process.env.vendor) {
  case banks.rbb.name:
    selectedVendor = banks.rbb.name;
  case banks.bok.name:
    selectedVendor = banks.bok.name;
  case banks.citizen.name:
    selectedVendor = banks.citizen.name;
  case banks.everest.name:
    selectedVendor = banks.everest.name;
  case banks.epf.name:
    selectedVendor = banks.epf.name
  default:
    selectedVendor = banks.epf.name;
}

// Only include feature for this vendor
function onlyForThisVendor(bank) {
  vendor = false;

  if (typeof bank == "object") {
    for (i = 0; i < bank.length; i++) {
      vendor = bank[i] == selectedVendor;
      if (vendor == true) return true;
    }
  } else vendor = selectedVendor === bank;

  return vendor;
}

/**
 *  Exclude feature for this vendor
 * @param {string , []} bank
 * @returns true if satisfied else false
 */

function excludeThisVendor(bank) {
  vendor = false;
  if (typeof bank == "object") {
    for (i = 0; i < bank.length; i++) {
      vendor = bank[i] != selectedVendor;
      if (vendor == false) return false;
    }
  } else vendor = selectedVendor !== bank;

  return vendor;
}

// get Full name of selected Bank
function getBanksFullName() {
  return banks?.[selectedVendor]?.fullName || "bank";
}
// get domain name of bank
function getBanksDomain() {
  return banks?.[selectedVendor]?.domain || "bank";
}

function includeThisFeature(feature) {
  return banks?.[selectedVendor]?.feautres?.includes(feature);
}
// get object of bank
function getBankObject() {
  return banks?.[selectedVendor] || {};
}

console.log(getBanksFullName());
module.exports = {
  selectedVendor,
  banks,
  dms_features,
  includeThisFeature,
  getBanksFullName,
  getBanksDomain,
  onlyForThisVendor,
  getBankObject,
  excludeThisVendor,
};
