import { server } from "admin/config/server";
import { toast } from "react-toastify";

const url = "/document-index";

function addIndexType(body, callback) {
  // console.log("api", body);
  server
    .post(`${url}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
}

function getIndexTypes(callback) {
  server
    .get(`${url}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function editIndexTypes(body, callback) {
  server
    .put(`${url}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function getIndexType(id, callback) {
  server
    .get(`${url}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

function deleteIndexType(id, callback) {
  server
    .delete(`${url}/${id}`)
    .then((response) => {
      callback(null, response.data);
      toast.success("Index Deleted");
    })
    .catch((err) => {
      callback(err);
    });
}

export { addIndexType, getIndexTypes, editIndexTypes, getIndexType, deleteIndexType };
