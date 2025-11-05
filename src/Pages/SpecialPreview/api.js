import { server } from "admin/config/server";

const url = "/attachment/special-preview";
const url1 = "/document/hourly-access-multiple";

const previewAttachment = (id, callback) => {
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
};

const previewOneAttachment = (data, callback) => {
  server
    .get(`${url}/${data.id}?token=${data.token}&hourlyAccesId=${data.hourlyAccesId}`)
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

const getDocument = (token, callback) => {
  server
    .get(`/document/special-preview?token=${token}`)
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

const attachmentofMultipleHourlyAccess = (id, callback) => {
  server
    .get(`${url1}/${id}`)
    .then((json) => {
      callback(null, json.data);
    })
    .catch((err) => {
      callback(err);
    });
};

const attachmentofMultipleHourlyAccessQuery = async (id) => {
  const json = await server.get(`${url1}/${id}`);
  return json.data;
};

export {
  previewAttachment,
  getDocument,
  previewOneAttachment,
  attachmentofMultipleHourlyAccessQuery,
  attachmentofMultipleHourlyAccess,
};
