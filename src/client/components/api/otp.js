import { server } from "../../../admin/config/server";

const receiveOtpCode = ({ TYPE, data }, callback) => {
  console.log("otp", data);
  server
    .post(`/client/send-otp/${TYPE}`, data)
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
    .post(`/client/verify-otp/${TYPE}`, { data })
    .then((res) => {
      console.log(res);
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
