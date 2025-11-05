import { server } from "admin/config/server";

const url = "/workflow";

export const editWorkflow = (data, callback) => {
  server
    .put(`${url}/${data.id}`, data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getWorkflow = (id, callback) => {
  server
    .get(`${url}/${id}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const getWorkflowMaster = (workflowId, callback) => {
  server
    .get(`${url}/master/${workflowId}`)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};

export const takeActionWorkflow = (options, callback) => {
  server
    .post(`${url}/submit/${options.action}`, options.data)
    .then((res) => callback(null, res.data))
    .catch((err) => callback(err));
};
