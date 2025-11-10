const { consoleLog } = require("../../util");
const isObjectEmpty = require("../../util/isEmpty");
const {
  querySearchAndFilter,
  queryLoadDocuments,
  queryArchivedDocuments,
  queryFavouriteDocuments,
  queryPendingDocuments,
  queryRejectedDocuments,
  querySavedDocuments,
} = require("../sqlQuery/documentQuery");
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
/**
 *
 * @param {*} param  -send from frontend search field
 * @param {true, false} getTotalDocument  to get total document
 * @param {*} user contains user details
 * @returns
 */
const paginateQuery = ({ page, limit, searchingParameters }, getTotalDocument, user) => {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  // validate for no searching paramas
  const searchData = searchingParameters ? JSON.parse(searchingParameters) : {};
  const isSearchingParameters = isObjectEmpty(searchData);

  // for searching through index type
  if (!isSearchingParameters) {
    /**
     * params(searchData, allias for database) -d for document and a for attahmnet
     * return filterText and textIndexFilter
     */

    const { filterText, textIndexFilter } = seperateFilterOptions(searchData, "d");
    let showSaved = true;
    // Query for total document and search filter
    const { query, total } = querySearchAndFilter(user, offset, limit, filterText, textIndexFilter, (onLoad = false));
    // consoleLog("search and filter: ", query);
    // Only return total query if getTotalDocuent is true
    return getTotalDocument ? total : query;
  }

  // Query to list all document.
  const { query, total } = queryLoadDocuments(user, offset, limit, isSearchingParameters, (onLoad = true));
  // consoleLog("Load documents: ", query);
  return getTotalDocument ? total : query;
};

// query to get archived docuemnt
function getArchivedDocumnet({ page, limit }, getTotalDocument, user) {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  const { query, total } = queryArchivedDocuments(user, offset, limit);
  return getTotalDocument ? total : query;
}

// query to get archived docuemnt
function getFavouriteDocument({ page, limit }, getTotalDocument, user) {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  const { query, total } = queryFavouriteDocuments(user, offset, limit);
  return getTotalDocument ? total : query;
}
// query to get pending docuemnt
function getPendingDocument({ page, limit }, getTotalDocument, user) {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  const { query, total } = queryPendingDocuments(user, offset, limit);
  return getTotalDocument ? total : query;
}
// query to get Rejected docuemnt
function getRejectedDocument({ page, limit }, getTotalDocument, user) {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  const { query, total } = queryRejectedDocuments(user, offset, limit);
  return getTotalDocument ? total : query;
}
// query to get Saved docuemnt
function getSavedDocument({ page, limit }, getTotalDocument, user) {
  limit = limit ? limit : 5;
  offset = page ? (page - 1) * limit : 0;

  const { query, total } = querySavedDocuments(user, offset, limit);
  return getTotalDocument ? total : query;
}

module.exports = {
  paginateQuery,
  getPagination,
  getPaginatedData,
  getArchivedDocumnet,
  getFavouriteDocument,
  getRejectedDocument,
  getPendingDocument,
  getSavedDocument,
};
