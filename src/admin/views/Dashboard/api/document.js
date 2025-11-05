import { server } from "admin/config/server";

const url = "/document";

export const getTrackDocument = (callback) => {
  server
    .get("/document-count")
    .then((res) => {
      callback(null, res.data);
    })
    .then((data) => console.log(data))
    .catch((err) => {
      callback(err);
    });
};

export const getDeleteLogReport = (callback) => {
  server
    .get(`report/delete-log`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};

export const getDocumentTypeReport = (callback) => {
  server
    .get(`report/document-type`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};
export const getPendingDocuments = (callback) => {
  server
    .get(`${url}/pending-pagination`)
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
export const getNotificationDocuments = async() => {
    const result=await  server
    .get(`${url}/notification`)
    return result.data;
  
};
