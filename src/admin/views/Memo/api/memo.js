import { server } from "admin/config/server";

const url = "/memo";

export const startWorkflow = (data, callback) => {
  const memoId = data.memoId;
  server
    .post(`${url}/start/${memoId}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const addMemo = (data, callback) => {
  server
    .post(`${url}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getMemoList = (formData, callback) => {
  server
    .get(`${url}`, { params: formData })
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getMemo = (id, callback) => {
  server
    .get(`${url}/${id}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};

export const deleteMemo = (id, callback) => {
  server
    .delete(`${url}/${id}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const editMemo = (data, callback) => {
  server
    .put(`${url}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};
