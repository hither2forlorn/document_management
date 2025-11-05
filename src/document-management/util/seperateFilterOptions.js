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
  "hasUnit",
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
  var hasAlreadIdndex = false;

  // filter search index data
  // indexSearchData(searchData);

  Object.entries(searchData).map(([key, value]) => {
    // console.log(key, value);
    // console.log("==", alias);
    // for side bar filter
    if (filterOptions.includes(key)) {
      if (value == "") return;
      switch (key) {
        case "startDate":
          return (filterText += "and d.createdAt>='" + value + "' ");
        case "endDate":
          return (filterText += "and d.createdAt<='" + value + "' ");
        case "expiryDate":
          const expiry = moment(Date.now() + 86400000 * 7 * value).format("YYYY-MM-DD"); // ONE DAY = 86400000 millis
          console.log("Exipry", expiry, moment(Date.now()).format("YYYY-MM-DD"));

          return (filterText +=
            // "and d.disposalDate>='" +
            // moment(Date.now()).format("YYYY-MM-DD") +
            " and d.disposalDate<='" + expiry + "' ");
        case "documentTypeId":
          return (filterText += "and " + alias + "." + key + "=" + value + " ");
        case "tags":
          if (!value?.length) return filterText;

          const tagFilters = value
            .map((val) => {
              const safeVal = val.replace(/'/g, "''"); 

              if (val.length < 3) {

                return `(t.value = '${safeVal}')`;
              } else {

                const prefix = safeVal.substring(0, 3);
                return `(t.value LIKE '${prefix}%')`;
              }
            })
            .join(" OR ");

          return (filterText += `AND t.label = 'tag' AND (${tagFilters}) `);

        case "simpleText":
          return (filterText +=
            "and (" +
            alias +
            "." +
            (alias == "a" ? "name" : "otherTitle") +
            " LIKE N'%" +
            value +
            "%'" +
            // fuzzy search
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
              ? // https://www.youtube.com/watch?v=z4qC7nUx2o8
                // and FREETEXT(a.attachmentDescription,value)
                "and CONTAINS(a.attachmentDescription,'" + value + "')"
              : "and a.attachmentDescription LIKE '%" + value + "%' ");
        case "isArchivedId":
          return (filterText += "and " + "d" + "." + "isArchived" + "=" + value + " ");
        case "isDeletedId":
          return (filterText += "and " + "d" + "." + "isDeleted" + "=" + value + " ");
        case "branchId":
          return (filterText += "and " + "d" + "." + "branchId" + "=" + value + " ");
        case "hasUnit":
          if (typeof value == "string" && value == "1") {
            return (filterText += "and d.hierarchy LIKE '%Unit_%' ");
          } else {
            return (filterText += "");
          }
        default:
          return (filterText += "and " + "d" + "." + key + "=" + value + " ");
      }
    } else {
      textIndexFilter += ` ${hasAlreadIdndex ? "or" : "and"} div.id in ( select div.id from document_indices di
      join  document_index_values div on div.documentIndexId =di.id
      where di.label = N'${key}' and  div.value like  N'%${value}%'  )
      `;
      hasAlreadIdndex = true;
    }
  });

  return { filterText, textIndexFilter };
}

module.exports = { seperateFilterOptions, filterOptions };
