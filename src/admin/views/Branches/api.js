import { responsiveProperty } from "@mui/material/styles/cssUtils";
import { server } from "admin/config/server";
const url = "/branches";
const urlDis = "/district";

function addBranch(body, callback) {
  server
    .post(`${url}`, body)
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

function getBranches(callback) {
  server
    .get(`${url}`)
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




function editBranch(body, callback) {
  server
    .put(`${url}`, body)
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

function getBranch(id, callback) {
  server
    .get(`${url}/${id}`)
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


function getBranchLogo(id, callback) {
  server
    .get(`${url}/logo/${id}`)
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

function deleteBranch(id, callback) {
  server
    .delete(`${url}/${id}`)
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

function getDistricts(callback) {
  server
    .get(`${urlDis}`)
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

export { addBranch, getBranches, editBranch, getBranch, deleteBranch, getBranchLogo, getDistricts };
