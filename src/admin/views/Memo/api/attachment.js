import { server } from "admin/config/server";
const url = "/attachment";

function deleteAttachment(id, callback) {
  server
    .delete(`${url}/${id}`)
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

function downloadAttachment(id, callback) {
  server
    .get(`${url}/download/${id}`)
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

function previewAttachment(id, callback) {
  server
    .get(`${url}/preview/${id}`)
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

export { previewAttachment, downloadAttachment, deleteAttachment };
