const { consoleLog } = require("../../util");
const isObjectEmpty = require("../../util/isEmpty");
const { querySearchAndFilter, queryLoadDocuments } = require("../sqlQuery/attachmentQuery");
const { seperateFilterOptions, filterOptions } = require("./seperateFilterOptions");

const getPagination = (page, size) => {
  const limit = size ? +size : 20;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPaginatedData = (data, page, limit) => {
  const { count, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPage = Math.ceil(count / limit);
  return { count, rows, currentPage, totalPage };
};

const paginateQuery = (
  {
    page,
    limit,
    advanceText,
    departmentId,
    documentTypeId,
    locationMapId,
    statusId,
    startDate,
    endDate,
    expiryDate,
    isArchived,
    isApproved,
    identifier,
    searchingParameters,
  },
  getTotalDocument, user
) => {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;
  const searchData = JSON.parse(searchingParameters);

  // check for empy object {true or false}
  const isSearchingParameters = isObjectEmpty(searchData);

  // for searching through index type
  if (!isSearchingParameters) {
    /**
     * params(searchData, allias for database) {a for attachment table and d for document table}
     * return filterText and textIndexFilter
     */
    const { filterText, textIndexFilter } = seperateFilterOptions(searchData, "a");
    // Query for total document and search filter
    const { query, total } = querySearchAndFilter(user, offset, limit, filterText, textIndexFilter);
    // consoleLog(query);



    // Only return total query if getTotalDocuent is true
    return getTotalDocument ? total : query;
  }

  // Query to list all document.
  const { query, total } = queryLoadDocuments(user, offset, limit, isSearchingParameters);
  // consoleLog(query);

  return getTotalDocument ? total : query;
};

module.exports = {
  paginateQuery,
  getPagination,
  getPaginatedData,
};
