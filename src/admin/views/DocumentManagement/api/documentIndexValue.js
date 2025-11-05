import { server } from "admin/config/server";
const url = "/document-index-value";

function addDocumentIndexValue(body, callback) {
  console.log("body details", body);
  server
    .post(url, body)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err);
    });
}

function getDocumentIndexValue(id, callback) {
  if (id) {
    server
      .get(`${url}/${id}`)
      .then((res) => {
        return res.data;
      })
      .then((json) => {
        callback(null, json);
      })
      .catch((err) => {
        callback(err);
      });
  } else {
    callback("Error!");
  }
}

function editDocumentIndexValue(id, callback) {
  if (id) {
    server
      .put(`${url}/${id}`)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export { addDocumentIndexValue, getDocumentIndexValue, editDocumentIndexValue };
