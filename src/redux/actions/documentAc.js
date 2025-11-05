import A from ".";

export const setDocumentSearchData = (data) => ({
  type: A.SET_DOCUMENT_SEARCH_DATA,
  data,
});

export const setDocPageNo = (data) => ({
  type: A.SET_PAGINATION,
  data,
});

export const setTotalPages = (data) => ({
  type: A.SET_TOTAL_PAGES,
  data,
});

export const setDocLimitDocumentNumber = (data) => ({
  type: A.SET_LIMIT_DOCUMENT,
  data,
});
