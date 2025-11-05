import { server } from "admin/config/server";
const url = "/document/doc-archive";

function addArchive(body, callback) {
  // console.log(body,"body");
  server
    .post(url, body)
    .then((res) => {
      return res.data;
    })
    .then((data) => callback(null, data))
    .catch((err) => {
      console.log(err);
    });
}

function getArchive(docId, callback) {
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

export { addArchive, getArchive };
