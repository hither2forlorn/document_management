import { server } from "admin/config/server";

const url = "/attachment/special-preview";

const previewAttachment = (id, callback) => {
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
};

const getDocument = (token, callback) => {
  server
    .get(`/document/special-preview?token=${token}`)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err);
    });
};

export { previewAttachment, getDocument };
