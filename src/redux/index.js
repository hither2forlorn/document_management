import rootReducer from "./reducers";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";

const middleware = [thunkMiddleware];
const store = createStore(rootReducer, {}, applyMiddleware(...middleware));

export default store;
