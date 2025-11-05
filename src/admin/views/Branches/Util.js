import R from "config/url";

const header = R.header;
const headerAuth = R.headerAuth;

function getFormData(event) {
  const formData = {};
  const form = event.target;
  for (let i = 0; i < form.length; i++) {
    const name = form.elements[i].name;
    const value = form.elements[i].value;
    if (value) {
      formData[name] = value;
    }
  }
  return formData;
}

export default {
  header,
  headerAuth,
  getFormData,
};
