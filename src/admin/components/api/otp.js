import { server } from "admin/config/server";

const receiveOtpCode = ({ TYPE, data }, callback) => {
  server
    .post(`/send-otp/${TYPE}`, data)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      callback(err);
    });
};

const verifyOtpCode = ({ TYPE, data }, callback) => {
  server
    .post(`/verify-otp/${TYPE}`, data)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      callback(err);
    });
};

export { receiveOtpCode, verifyOtpCode };
