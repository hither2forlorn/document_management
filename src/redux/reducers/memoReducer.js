import A from "../actions";
import { CURRENT_USER_ID } from "../../config/values";

const memoSearchData = (state = { assignedTo: localStorage.getItem(CURRENT_USER_ID) }, { type, data }) => {
  switch (type) {
    case A.SET_MEMO_SEARCH_DATA:
      return data;
    default:
      return state;
  }
};

export default {
  memoSearchData,
};
