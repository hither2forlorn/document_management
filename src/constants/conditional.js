const conditions = {
  LessThen: 1,
  GreaterThen: 2,
  Concate: 3,
  AutoFill: 4,
};

const conditionsType = [
  {
    value: null,
    name: "None",
  },
  {
    value: 1,
    name: "Is lessThen",
  },
  {
    value: 2,
    name: "Is greaterThen",
  },
  {
    value: 3,
    name: "Concate",
  },
  {
    value: 4,
    name: "AutoFill",
  },
];

const DocumentConditionsField = [
  {
    value: null,
    name: "---Please Select---",
  },
  {
    value: 1,
    name: "Document Name",
  },
];

const AutoCompleteField = [
  {
    value: null,
    name: "---Please Select---",
  },
  {
    value: 1,
    name: "Account Name",
  },
  {
    value: 2,
    name: "CIF",
  },
];

module.exports = {
  conditions,
  conditionsType,
  DocumentConditionsField,
  AutoCompleteField,
};
