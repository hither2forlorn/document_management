import { server } from "admin/config/server";
const url = "addLicense";

function addLicense(body, callback) {
  server
    .post(`${url}`, body)
    .then((response) => {
      console.log(response);
      callback(null, response.data);
    })
    .catch((err) => {
      callback(err);
    });
}

export { addLicense };
