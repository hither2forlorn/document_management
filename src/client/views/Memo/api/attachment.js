import { server } from "client/config/server";
const url = "/client/attachment";

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

export { previewAttachment, downloadAttachment };
