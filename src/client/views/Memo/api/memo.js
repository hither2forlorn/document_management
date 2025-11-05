import { server } from "client/config/server";
const url = "/client/memo";

export const submitWorkflow = ({ data, action }, callback) => {
  const memoId = data.memoId;
  server
    .post(`${url}/${action}/${memoId}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const addMemo = (data, callback) => {
  server
    .post(`${url}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getMemos = (search, callback) => {
  server
    .get(`${url}`, { params: search })
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getMemo = (id, callback) => {
  server
    .get(`${url}/${id}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const editMemo = (data, callback) => {
  server
    .put(`${url}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};
