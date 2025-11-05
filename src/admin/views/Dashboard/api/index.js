import R from "config/url";
import { SERVER_URL } from "admin/config/server";

import { getPendingDocuments } from "./document";

const header = R.header;

function getTagCloud(callback) {
  fetch(SERVER_URL + "/get-tag-cloud", {
    headers: {
      ...header,
    },
    method: "POST",
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callback(null, json);
    })
    .catch((err) => {
      console.log(err);
      callback(err);
    });
}

export default {
  getTagCloud,
  getPendingDocuments,
};
