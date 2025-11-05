import { server } from "admin/config/server";

const url = "/tags";

export const getAllTags = (callback) => {
  server
    .get(`${url}`)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => callback(err));
};

export const getSuggestTags = (callback) => {
  server
    .get(`${url}/suggest`)
    .then((res) => {
      return res.data;
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => callback(err));
};
