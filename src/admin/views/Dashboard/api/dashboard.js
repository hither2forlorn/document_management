import { server } from "admin/config/server";
const documenturl = "/document";

const documentCount = [
  {
    month: "January",
    count: 9,
  },
  {
    month: "February",
    count: 6,
  },
  {
    month: "March",
    count: 7,
  },
  {
    month: "April",
    count: 11,
  },
  {
    month: "May",
    count: 13,
  },
];

const activeDocument = [
  {
    docName: "Michelle Maldonadote",
    count: 20,
  },
  {
    docName: "Yael Zamora hataki",
    count: 16,
  },
  {
    docName: "Breanna Burkssadf",
    count: 25,
  },
  {
    docName: "INGO",
    count: 14,
  },
  {
    docName: "Gentech",
    count: 11,
  },
];

const totalDocument = [
  {
    nameOfDoc: "Scanned Documents",
    totalDoc: 20,
  },
  {
    nameOfDoc: "Active Documents",
    totalDoc: 30,
  },
  {
    nameOfDoc: "Inactive Documents",
    totalDoc: 50,
  },
];

export const getDocumentByMonth = (callback) => {
  server
    .get("/document-count")
    .then((res) => {
      callback(null, documentCount);
    })
    .catch((err) => callback(err));
};

export const getActiveDocument = (callback) => {
  server
    .get("/active-document")
    .then((res) => {
      callback(null, activeDocument);
    })
    .catch((err) => callback(err));
};

export const getTotalDocument = (callback) => {
  server
    .get("/total-document")
    .then((res) => {
      callback(null, totalDocument);
    })
    .catch((err) => callback(err));
};

export const getDocumentReport = (type, callback) => {
  server
    .get(`${documenturl}/report/${type}`)
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => callback(err));
};
