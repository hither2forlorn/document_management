import { server } from "admin/config/server";

export const getMemoReport = (type, callback) => {
  server
    .get(`memo/report/${type}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};
