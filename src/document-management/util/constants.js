const DOCUMENT_INDICES = [
  {
    id: 1,
    name: "Retail Customer",
  },
  {
    id: 2,
    name: "Corporate Customer",
  },
  {
    id: 3,
    name: "Account Number ",
  },
  {
    id: 4,
    name: "Document Type",
  },
  {
    id: 5,
    name: "Account Opening Form",
    key: "AOF",
  },
  {
    id: 6,
    name: "Customer Information Form",
    key: "CIF",
  },
  {
    id: 7,
    name: "Power of Attorney",
    key: "POAR",
  },
  {
    id: 8,
    name: "Citizenship",
    key: "CTZN",
  },
  {
    id: 9,
    name: "Passports",
    key: "PP",
  },
  {
    id: 10,
    name: "Driving License",
    key: "DL",
  },
  {
    id: 11,
    name: "Voter ID",
    key: "VI",
  },
  {
    id: 12,
    name: "Indian Government Issued Card",
    key: "IGIC",
  },
  {
    id: 13,
    name: "Institution ID",
    key: "I id",
  },
  {
    id: 14,
    name: "Birth Certificate",
    key: "BC",
  },
  {
    id: 15,
    name: "University Employee Card",
    key: "UEC",
  },
  {
    id: 16,
    name: "Government Issued Other Card",
    key: "GIOC",
  },
  {
    id: 17,
    name: "Indian Embassy Registration Card",
    key: "IERC",
  },
  {
    id: 18,
    name: "Government Issued Teacher Card ",
    key: "GITC",
  },
  {
    id: 19,
    name: "Account Opening Form",
    key: "AOF",
  },
  {
    id: 20,
    name: "Customer Information Form ",
    key: "CIF",
  },
  {
    id: 21,
    name: "POA Holder/Authorised Signatory/Board of Directors/10% and above shareholders etc.CIF",
    key: "POAC",
  },
  {
    id: 22,
    name: "Citizenship",
    key: "CTZN",
  },
  {
    id: 23,
    name: "Passports",
    key: "PP",
  },
  {
    id: 24,
    name: "Driving License",
    key: "DL",
  },
  {
    id: 25,
    name: "Voter ID",
    key: "VI",
  },
  {
    id: 26,
    name: "Indian Government Issued Card",
    key: "IGIC",
  },
  {
    id: 27,
    name: "Institution ID",
    key: "I id",
  },
  {
    id: 28,
    name: "Birth Certificate",
    key: "BC",
  },
  {
    id: 29,
    name: "Government Issued Other Card",
    key: "GIOC",
  },
  {
    id: 30,
    name: "Indian Embassy Registration Card",
    key: "IERC",
  },
  {
    id: 31,
    name: "Registration Document",
    key: "REGISTRATION",
  },
  {
    id: 32,
    name: "PAN OR VAT",
    key: "PAN OR VAT",
  },
  {
    id: 33,
    name: "Article of Association",
    key: "AOA",
  },
  {
    id: 34,
    name: "Memorandum of Association",
    key: "MOA",
  },
  {
    id: 35,
    name: "Tax Clearance Certificate",
    key: "TC",
  },
  {
    id: 36,
    name: "Shareholding Structure & BO Details",
    key: "SHAREHOLDING STRUCTURE AND BO DETAILS",
  },
  {
    id: 37,
    name: "Miscellaneous",
    key: "Miscellaneous",
  },
  {
    id: 38,
    name: "Address Verifying Document",
    key: "AVD",
  },
  {
    id: 39,
    name: "Miscellaneous ",
    key: "Miscellaneous",
  },
  {
    id: 40,
    name: "Signature Specimen Card",
    key: "S Card",
  },
  {
    id: 41,
    name: "Location Map",
    key: "LM",
  },
  {
    id: 42,
    name: "PAN PERSONAL",
    key: "PC",
  },
  {
    id: 43,
    name: "Address Verifying Documents",
    key: "AVD",
  },
  {
    id: 44,
    name: "Audit Report",
    key: "AR",
  },
  {
    id: 45,
    name: "Signature Speciment Card",
    key: "S Card",
  },
  {
    id: 46,
    name: "Board Minute",
    key: "BM",
  },
  {
    id: 47,
    name: "Regulatory Approval",
    key: "RA",
  },
  {
    id: 48,
    name: "Bidhan",
    key: "BIDHAN Or Bylaws",
  },
  {
    id: 49,
    name: "Location Map",
    key: "LM",
  },
  {
    id: 50,
    name: "Pension Patta",
    key: "PENSIONPATTA",
  },
  {
    id: 62,
    name: "Video KYC",
    key: "VKYC",
  },
  {
    id: 68,
    name: "NID",
    key: "NID",
  },
  {
    id: 67,
    name: "National Identity Card (NID)",
    key: "NID",
  },
  {
    id: 66,
    name: "Phone Verifications",
    key: "PHV",
  },
  {
    id: 69,
    name: "Phone Verification",
    key: "PHV",
  },
  {
    id: 103,
    name: "Locker Closing Form",
    key: "LCF",
  },
  {
    id: 104,
    name: "Locker Closing Form",
    key: "LCF",
  },
  {
    id: 105,
    name: "Locker Opening Form",
    key: "LOF",
  },
  {
    id: 106,
    name: "Locker Opening Form",
    key: "LOF",
  },
    {
    id: 107,
    name: "Locker Access Slip",
    key: "LAS",
  },
  {
    id: 108,
    name: "Locker Access Slip",
    key: "LAS",
  },
  {
    id: 109,
    name: "Locker Nominee",
    key: "LN",
  },
  {
    id: 110,
    name: "Locker Nominee",
    key: "LN",
  },
];
const documentIndices = [
  "AOF",
  "CIF",
  "POWER OF ATTORNEY",
  "CTZN",
  // "CIFCTZN",
  "VI",
  "IGIC",
  "I id",
  "BC",
  "UEC",
  "GIOC",
  "IERC",
  // "IERC (2)",
  "GITC", // not found
  "AVD",
  "Miscellaneous",
  "S Card",
  "LM",
  "PC",
  "PP",
  "DL",
  "RD",
  "REGISTRATION",
  // "PAN/VAT", -- not used
  "PAN OR VAT",
  "AOA",
  "MOA",
  "TC",
  "SHAREHOLDING STRUCTURE AND BO DETAILS",
  "AR",
  "BM",
  "RA",
  // "Bidhan", -- not used
  "BIDHAN Or Bylaws",
  // "LM (2)",
  "NID",
  "PHV",
  "LCF",
  "LOF",
  "LAS",
  "LN",
];

module.exports = { DOCUMENT_INDICES };
