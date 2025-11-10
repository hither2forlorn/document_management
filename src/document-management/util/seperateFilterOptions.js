const moment = require("moment");

const filterOptions = [
  "departmentId",
  "locationMapId",
  "statusId",
  "startDate",
  "endDate",
  "documentTypeId",
  "advanceText",
  "simpleText",
  "tags",
  "expiryDate",
  "isArchivedId",
  "isDeletedId",
  "branchId",
];

// const indexSearchData = (searchData) => {
//   const data = Object.entries(searchData).map(([key, value], index) => {
//     return filterOptions.map((option) => option != key);
//   });
//   console.log(data);
//   return data;
// };

function seperateFilterOptions(searchData, alias) {
  var filterText = "";
  var textIndexFilter = "";
  var hasAlreadyIndexed = false;

  Object.entries(searchData).map(([key, value]) => {
    if (filterOptions.includes(key)) {
      if (value == "") return;
      switch (key) {
        case "startDate":
          return (filterText += "and d.createdAt>='" + value + "' ");
        case "endDate":
          return (filterText += "and d.createdAt<='" + value + "' ");
        case "expiryDate":
          const expiry = moment(Date.now() + 86400000 * 7 * value).format("YYYY-MM-DD");
          console.log("Expiry", expiry, moment(Date.now()).format("YYYY-MM-DD"));
          return (filterText += " and d.disposalDate<='" + expiry + "' ");
        case "documentTypeId":
          return (filterText += "and " + alias + "." + key + "=" + value + " ");
        case "tags":
          return (filterText += "and t.label='tag' and t.value in(" + value.map((val) => `'${val}'`) + ") ");
        case "simpleText":
          return (filterText +=
            "and (" +
            alias +
            "." +
            (alias == "a" ? "name" : "otherTitle") +
            " = N'" +
            value +
            "'" +
            " or " +
            (alias == "a" ? "SOUNDEX(a.name)" : "SOUNDEX(d.otherTitle)") +
            " = SOUNDEX('" +
            value +
            "') " +
            " or d." +
            (alias == "a" ? "otherTitle" : "name") +
            " LIKE '[" +
            value +
            "]%'   or  d." +
            (alias == "a" ? "otherTitle" : "name") +
            " LIKE '%" +
            value +
            "%')");
        case "advanceText":
          return (filterText +=
            process.env.FULLTEXTSEARCH == "true"
              ? "and CONTAINS(a.attachmentDescription,'" + value + "')"
              : "and a.attachmentDescription LIKE '%" + value + "%' ");
        case "isArchivedId":
          return (filterText += "and " + "d" + "." + "isArchived" + "=" + value + " ");
        case "isDeletedId":
          return (filterText += "and " + "d" + "." + "isDeleted" + "=" + value + " ");
        case "branchId":
          return (filterText += "and " + "d" + "." + "branchId" + "=" + value + " ");
        default:
          return (filterText += "and " + "d" + "." + key + "=" + value + " ");
      }
    } else {
      textIndexFilter += `${hasAlreadyIndexed ? " OR" : " AND"} (
        (di.label = N'${key}' AND div.value = N'${value}')
      )`;
      hasAlreadyIndexed = true;
    }
  });

  return { filterText, textIndexFilter };
}

module.exports = { seperateFilterOptions, filterOptions };
