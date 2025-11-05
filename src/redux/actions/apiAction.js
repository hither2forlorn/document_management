import A from ".";
import { server } from "admin/config/server";

export function loadAllFields() {
  return (dispatch) => {
    return server
      .get("/all")
      .then((res) => {
        dispatch(setAllFields(res.data));
      })
      .catch((err) => {
        throw err;
      });
  };
}
export function loadUserProfile() {
  return (dispatch) => {
    return server
      .get("/user-profile")
      .then((res) => {
        dispatch(setUserProfile(res.data));
      })
      .catch((err) => {
        throw err;
      });
  };
}
export const setAllFields = (data) => {
  return { type: A.SET_ALL_FIELDS, data: data };
};
export const setUserProfile = (data) => {
  return { type: A.SET_USER_PROFILE, data: data };
};
