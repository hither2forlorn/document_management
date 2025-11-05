import { server } from "admin/config/server";

const getWatermark = (callback) => {
  server
    .get("/watermark")
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

const setWatermark = (data, callback) => {
  console.log(data);
  server
    .put("/watermark", data)
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

const postWatermark = (data, callback) => {
  console.log(data);
  server
    .post("/watermark", data)
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

export { getWatermark, setWatermark, postWatermark };
