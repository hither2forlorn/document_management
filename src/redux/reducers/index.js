import { combineReducers } from "redux";
import apiReducers from "./apiReducer";
import authReducers from "./authReducer";
import memoReducer from "./memoReducer";
import documentRe from "./documentRe";

const rootReducer = {
  ...apiReducers,
  ...authReducers,
  ...memoReducer,
  ...documentRe,
};

export default combineReducers({
  ...rootReducer,
});
