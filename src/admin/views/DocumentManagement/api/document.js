import { server } from "admin/config/server";
import Axios from "axios";
const url = "/document";
function addDocument(body, callback) {
  server
    .post(url, body)
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

function getDocument(type, id, callback) {
  if (id) {
    server
      .get(`${url}/${id}`, {
        params: { type },
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
  } else {
    callback("Error!");
  }
}

// list all archived document
/**
 *
 * @param {*} callback
 * @param {*} query
 */
function getArchivedDocuments(callback, query) {
  server
    .get("/document/archived", {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
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
/**
 *
 * @param {*} callback
 * @param {*} query
 */
function getFavouriteDocuments(callback, query) {
  server
    .get("/favourite/list", {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
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

function getDocumentIndex(id, callback) {
  if (id) {
    server
      .get(`/document-index-doc/${id}`)
      .then((res) => {
        return res.data;
      })
      .then((json) => {
        callback(null, json);
      })
      .catch((err) => {
        callback(err);
      });
  } else {
    callback("Error!");
  }
}

function previewDocument(token, type, callback) {
  if (token) {
    server
      .get(`${url}/preview?token=${token}`, {
        params: { type },
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
  } else {
    callback("Error!");
  }
}

function editDocument(body, callback) {
  server
    .put(url, body)
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

function searchDocuments(searchParams, callback) {
  let searchingParameters = searchParams;
  for (let par in searchingParameters) {
    if (searchingParameters[par] === "") {
      delete searchingParameters[par];
    }
  }
  server
    .get(`${url}`, {
      params: searchingParameters,
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
function searchDocumentsPagination(searchParams, callback, query, source) {
  let searchingParameters = searchParams;
  for (let par in searchingParameters) {
    if (searchingParameters[par] === "" || searchingParameters[par]?.length == 0) {
      delete searchingParameters[par];
    }
  }
  server
    .get(`/document/pagination`, {
      params: {
        searchingParameters,
        page: query?.page,
        limit: query?.limit,
      },
      cancelToken: source?.token,
    })
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch(function (thrown) {
      if (Axios.isCancel(thrown)) {
        console.log("Request canceled", thrown.message);
      } else {
        // handle error
        callback(thrown);
      }
    });
}
function deleteDocument(id, callback) {
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

function restoreDocument(id, callback) {
  server
    .get(`${url}/restore/${id}`)
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

function getPendingDocuments(callback, query) {
  server
    .get(`${url}/pending-pagination`, {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
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
function getRejectedDocuments(callback, query) {
  server
    .get(`${url}/rejected-pagination`, {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
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

// saved documents
function getSavedDocuments(callback, query) {
  server
    .get(`${url}/saved-pagination`, {
      params: {
        page: query?.page,
        limit: query?.limit,
      },
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

function approveDocument(id,userInput, callback) {
  server
    .post(`${url}/approve`, {id,userInput})
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}
function sendToChecker(data, callback) {
  server
    .post(`${url}/send-to-checker`, data)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}

function sendAttachmentToChecker(data, callback) {
  server
    .post(`${url}/send-attachment-to-checker`, data)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}
function sendToApprover(data, callback) {
  server
    .post(`${url}/send-to-approver`, data)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}

function sendAttachmentToApprover(data, callback) {
  server
    .post(`${url}/send-attachment-to-approver`, data)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}

function getApprovers(data, callback) {
  server
    .get(`/document/users/approvers`, { params: data })
    .then((res) => {
      callback(null, res.data);
    })
    .catch((err) => {
      console.log("Error fetching approvers:", err);
      callback(err);
    });
}

function resubmitDocument(id, callback) {
  server
    .post(`${url}/resubmit`, { id })
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}
// reject documents
function archiveDocument(data, callback) {
  server
    .post(`${url}/archive`, data)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log("error", err);
      callback(err);
    });
}

function provideTimelyAccess(data, callback) {
  server
    .post(`${url}/hourly-access-multiple`, data)
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

function checkoutDocument(data, callback) {
  server
    .post(`${url}/checkout`, data)
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

function sendOtp(callback) {
  server
    .post(`${url}/otp-send`)
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

function handleScanOcr(callback) {
  Axios.get("http://localhost:9999")
    // .post(`${url}/ocr-scan`)
    .then((res) => {
      // return res.data;
      return { data: { message: "succes !" } };
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err);
    });
}

// Fetch document versions using API
async function fetchAttachmentVersions(attachmentId, attachmentName) {
  try {
    // Make a GET request to the server with attachmentId and name as query parameters
    const response = await server.get(`/document/attachment-versioning-by-id`, {
      params: {
        documentId: attachmentId,
        name: attachmentName,
      },
    });
    return response?.data;
  } catch (error) {
    console.error("Error fetching attachment versions:", error);
    throw error;
  }
}

export {
  addDocument,
  getDocument,
  getArchivedDocuments,
  previewDocument,
  editDocument,
  searchDocuments,
  deleteDocument,
  getRejectedDocuments,
  approveDocument,
  resubmitDocument,
  getSavedDocuments,
  getPendingDocuments,
  provideTimelyAccess,
  sendAttachmentToChecker,
  sendToChecker,
  checkoutDocument,
  getDocumentIndex,
  searchDocumentsPagination,
  sendOtp,
  archiveDocument,
  getFavouriteDocuments,
  handleScanOcr,
  restoreDocument,
  sendAttachmentToApprover,
  sendToApprover,
  getApprovers,
  fetchAttachmentVersions
};
