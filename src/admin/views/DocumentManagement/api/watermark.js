import { server } from "admin/config/server";
const URL = "http://localhost:8181/api/custom-watermark";

function addWatermark(body, callback) {
  server
    .post(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { addWatermark };
