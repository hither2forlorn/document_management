import { server } from "admin/config/server";
const url = "/attachment";

function getOneAttachments(id, callback) {
  server
    .get(`${url}/${id}`)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err, null);
    });
}

function postAttachment(fileData, setLoadingState, callback) {
  server
    .post(url, fileData, {
      onUploadProgress: (progressEvent) => {
        const percentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        setLoadingState(percentage);
      },
    })
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err, null);
    });
}

function updateAttachment(id, fileData, callback) {
  server
    .put(`${url}/${id}`, fileData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err, null);
    });
}

function updateParentDocumentIndex(id, fileData, callback) {
  server
    .post(`/parent-document-index/${id}`, fileData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err, null);
    });
}

function updateAttachmentIndex(fileData, callback) {
  server
    .put(url, fileData)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      callback(err, null);
    });
}

function deleteAttachment(id, callback) {
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

function downloadAttachment(id, cw, callback) {
  server
  .get(`${url}/download/${id}/${cw || 1}`)
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

function previewAttachment(id, cw, callback) {
  server
    .get(`${url}/preview/${id}/${cw || 1}`)
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
function getAttachments(callback) {
  server
    .get(`${url}`)
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}
function getAttachmentsPaginate(searchingParameters, callback, limit, page, source) {
  for (let par in searchingParameters) {
    if (searchingParameters[par] === "" || searchingParameters[par]?.length == 0) {
      delete searchingParameters[par];
    }
  }

  server
    .get(`${url}/pagination`, {
      params: { limit, page, searchingParameters },
      cancelToken: source?.token,
    })
    .then((response) => {
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export {
  updateAttachmentIndex,
  getAttachmentsPaginate,
  getOneAttachments,
  previewAttachment,
  downloadAttachment,
  deleteAttachment,
  updateParentDocumentIndex,
  getAttachments,
  postAttachment,
  updateAttachment,
};
