import { server, SERVER_URL } from "admin/config/server";
import axios from "axios";
const url = "/user";

function addUser(body, callback) {
  server
    .post(`${url}`, body)
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

function editUser(body, callback) {
  server
    .put(`${url}`, body)
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

function getUser(id, callback) {
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
}

function getUserByDeptId(id, callback) {
  server
    .get(`${url}/getByDeptId/${id}`)
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

function getUsers(body, callback) {
  server
    .get(`${url}`, {
      params: body,
    })
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

function deleteUser(id, callback) {
  if (!window.confirm("Do you want to delete the user?")) {
    return;
  }
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

function userLogout(callback) {
  server
    .get(`${url}/logout`)
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

function changePassword(body, callback) {
  server
    .put(`${url}/change-password`, body)
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

function changePasswordWithJsonToken(body, jsonToken, callback) {
  const getToken = () => ["Admin ", jsonToken].join("");
  const header = {
    "Content-Type": "application/json",
    Authorization: getToken(),
  };
  const customAxios = axios.create({
    baseURL: SERVER_URL,
    headers: header,
  });

  customAxios
    .put(`${url}/change-password`, body)
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

export {
  changePasswordWithJsonToken,
  addUser,
  editUser,
  getUser,
  getUsers,
  deleteUser,
  userLogout,
  changePassword,
  getUserByDeptId,
};
