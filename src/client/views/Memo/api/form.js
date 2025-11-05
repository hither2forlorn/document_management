import { server } from "client/config/server";
const url = "/client/forms";

export const getForm = (id) => {
  return server.get(`${url}/${id}`).then((res) => res.data);
};

export const getForms = (callback) => {
  server
    .get(`${url}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      callback(err);
    });
};
