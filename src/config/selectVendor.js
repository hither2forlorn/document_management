/**
 *
 * Node js - Backend
 *
 * options bok, rbb
 */

const { VENDOR_ENV } = require("../config/credentials");

const dms_features = {
  DEFAULT_MAKER_CHECKER_DOCUMENTS: "DEFAULT_MAKER_CHECKER_DOCUMENTS",
  UPLOAD_ATTACHMENT_MODAL: "UPLOAD_ATTACHMENT_MODAL",
  EDIT_ATTACHMENTS: "EDIT_ATTACHMENTS",
  ASSOCIATED_IDS: "ASSOCIATED_IDS",
  DocumentType_IN_HIRARCHY: "DocumentType_IN_HIRARCHY",
  EMPTY_TEMP_ON_DOWNLOAD: "EMPTY_TEMP_ON_DOWNLOAD",
  DOCUMENT_NAME_DUPLICATION: "DOCUMENT_NAME_DUPLICATION",
  BASIC_WATERMARK: "BASIC_WATERMARK",
};

const banks = {
  rbb: {
    name: "rbb",
    fullName: "Rastriya Banijya Bank",
    domain: "rbb.com.np",
    logo: "watermark/rbb.png",
    feautres: [
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
      dms_features.EDIT_ATTACHMENTS,
      dms_features.EMPTY_TEMP_ON_DOWNLOAD,
      dms_features.DocumentType_IN_HIRARCHY,
      dms_features.DOCUMENT_NAME_DUPLICATION,
      // dms_features.BASIC_WATERMARK,
    ],
    excludedFeatures: [],
  },
  bok: {
    name: "bok",
    logo: "watermark/bok.png",
    fullName: "Bank of Kathmandu",
    domain: "bok.com.np",
    feautres: [
      dms_features.DOCUMENT_NAME_DUPLICATION,
      dms_features.EDIT_ATTACHMENTS,
      dms_features.ASSOCIATED_IDS,
      dms_features.UPLOAD_ATTACHMENT_MODAL,
    ],

    excludedFeatures: [],
  },
  citizen: {
    name: "citizen",
    logo: "watermark/citizens.png",
    fullName: "Citizen Bank",
    domain: "ctznbank.com",
    feautres: [dms_features.EDIT_ATTACHMENTS, dms_features.UPLOAD_ATTACHMENT_MODAL],

    excludedFeatures: [],
  },
  everest: {
    name: "everest",
    logo: "watermark/everest.png",
    fullName: "Everest Bank",
    domain: "everestbank.com",
    feautres: [dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS, dms_features.EDIT_ATTACHMENTS],
    excludedFeatures: [],
  },
  epf: {
    name: "epf",
    fullName: "Employees Provident Fund",
    domain: "epf.org.np",
    logo: "watermark/epf.png",
    feautres: [
      dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS,
      dms_features.EDIT_ATTACHMENTS,
      dms_features.EMPTY_TEMP_ON_DOWNLOAD,
      dms_features.DocumentType_IN_HIRARCHY,
      dms_features.DOCUMENT_NAME_DUPLICATION,
      dms_features.UPLOAD_ATTACHMENT_MODAL,
      // dms_features.BASIC_WATERMARK,
    ],
    excludedFeatures: [],
  },
};

// selection of vendor
let selectedVendor, vendor;
switch (VENDOR_ENV.vendor) {
  case banks.rbb.name:
    selectedVendor = banks.rbb.name;
  case banks.bok.name:
    selectedVendor = banks.bok.name;
  case banks.citizen.name:
    selectedVendor = banks.citizen.name;
  case banks.everest.name:
    selectedVendor = banks.everest.name;
  case banks.epf.name:
    selectedVendor = banks.epf.name;
  default:
    selectedVendor = banks.epf.name;
}

// Only include feature for this vendor
function onlyForThisVendor(bank) {
  vendor = false;
  // Check if type of parameter is object
  if (typeof bank == "object") {
    // Loop to check if bank is equal or not, if the bank is equal then it returns true.
    for (i = 0; i < bank.length; i++) {
      vendor = bank[i] == selectedVendor; // vendor is same then allow this feature
      if (vendor == true) return true;
    }
  } else vendor = selectedVendor === bank;

  return vendor;
}

// Exclude feature for this vendor
function excludeThisVendor(bank) {
  vendor = false;

  if (typeof bank == "object") {
    for (i = 0; i < bank.length; i++) {
      vendor = bank[i] != selectedVendor; // vendor is same then allow this feature
      if (vendor == true) return true;
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
// get object of bank
function getBankObject() {
  return banks?.[selectedVendor] || {};
}

function includeThisFeature(feature) {
  return banks?.[selectedVendor]?.feautres?.includes(feature);
}

console.log(getBanksFullName());
module.exports = {
  selectedVendor,
  banks,
  getBanksFullName,
  getBanksDomain,
  dms_features,
  getBankObject,
  onlyForThisVendor,
  excludeThisVendor,
  includeThisFeature,
};
