import { server } from "admin/config/server";
const url = "/favourite";

function addFavourite(body, callback) {
  // console.log(body,"body");
  server
    .post(url, body)
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function getFavourite(docId, callback) {
  server
    .get(`${url}`, { params: { docId } })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      callback(null, data);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
}
function getFavouriteList(body, callback) {
  console.log(body);
  server
    .get("/favourite/list", body)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err);
    });
}

export { addFavourite, getFavourite, getFavouriteList };
