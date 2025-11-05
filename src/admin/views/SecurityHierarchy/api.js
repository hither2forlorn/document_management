import { server } from "admin/config/server";

const URL = "/security-hierarchy";
const filterBranchURL = "/branchesFilter";
const filterDepartmentURL = "/departmentsFilter";
const securityHierarchyBranches = "/security-hierarchy-branches"

export const getSecurityHierarchy = (callback) => {
  server
    .get(`${URL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const getSecurityHierarchyBranches = (callback) => {
  server
    .get(`${securityHierarchyBranches}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};



export const getOneHierarchy = (id, callback) => {
  server
    .get(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const addSecurityHierarchy = (data, callback) => {
  server
    .post(`${URL}`, data)
    .then((response) => {
      console.log(response.data);
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const getFilterBranch = (callback) => {
  server
    .get(`${filterBranchURL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};
export const getFilterDepartment = (callback) => {
  server
    .get(`${filterDepartmentURL}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const editHierarchy = (body, callback) => {
  server
    .put(`${URL}`, body)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};

export const deleteHierarchy = (id, callback) => {
  server
    .delete(`${URL}/${id}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
};
