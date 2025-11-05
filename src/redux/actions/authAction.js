import { server } from "admin/config/server";
import A from ".";

export function checkLicense() {
  return (dispatch) => {
    return server
      .get("/license/check")
      .then((res) => {
        dispatch(setLicense(res.data));
      })
      .catch((err) => {
        throw err;
      });
  };
}
export const setLicense = (data) => {
  return { type: A.SET_LICENSE, data: data };
};
export const setAuth = (data) => {
  return { type: A.SET_AUTH, data: data };
};
export const setClientAuth = (data) => {
  return { type: A.SET_CLIENT_AUTH, data: data };
};
export const setOtpAuth = (data) => {
  return { type: A.SET_OTP_AUTH, data: data };
};
