import A from "redux/actions";

const docSearchData = (state = {}, action) => {
  switch (action.type) {
    case A.SET_DOCUMENT_SEARCH_DATA:
      return action.data;
    default:
      return state;
  }
};

const docPageNo = (state = 1, action) => {
  switch (action.type) {
    case A.SET_PAGINATION:
      return action.data;
    default:
      return state;
  }
};
const docTotalPages = (state = 0, action) => {
  switch (action.type) {
    case A.SET_TOTAL_PAGES:
      return action.data;
    default:
      return state;
  }
};
const docLimitDocumentNumber = (state = 10, action) => {
  switch (action.type) {
    case A.SET_LIMIT_DOCUMENT:
      return action.data;
    default:
      return state;
  }
};

export default {
  docSearchData,
  docTotalPages,
  docPageNo,
  docLimitDocumentNumber,
};
