import moment from "moment";

const getFormData = (event) => {
  let formData = {};
  const form = event.target;
  for (let i = 0; i < form.length; i++) {
    const element = form.elements[i];
    const name = element.name;
    const value = element.value;
    const type = element.type;
    if (value) {
      switch (type) {
        case "checkbox":
          formData[name] = element.checked ? element.checked : false;
          break;
        case "radio":
          const els = document.getElementsByName(name);
          els.forEach((e) => {
            if (e.checked) {
              formData[name] = e.value;
            }
          });
          break;
        default:
          formData[name] = value;
          break;
      }
    }
  }
  return formData;
};
const getMultipleFormData = (event) => {
  let formData = {};
  let arrayData = [];
  const form = event.target;
  for (let i = 0; i < form.length; i++) {
    const element = form.elements[i];
    const name = element.name;
    // console.log(name);
    const value = element.value;
    const type = element.type;
    // const elementId = element.getAttribute("elementId");
    // const selectId = element.getAttribute("selectId");
    if (value) {
      switch (type) {
        case "checkbox":
          formData[name] = element.checked ? element.checked : false;
          break;
        case "radio":
          const els = document.getElementsByName(name);
          els.forEach((e) => {
            if (e.checked) {
              formData[name] = e.value;
            }
          });
          break;
        default:
          formData[name] = value;
          // console.log(value);
          // if (name && elementId && selectId) {
          //   arrayData.push({
          //     [name]: value,
          //     docId: elementId,
          //   });
          // }
          if (name === "docId") {
            arrayData.push({
              label: formData["label"],
              id: formData["id"],
              docId: formData["docId"],
              dataType: formData["dataType"],
              validation: formData["validation"],
              condition: formData["condition"],
              type: formData["type"],
              isRequired: formData["isRequired"],
              isShownInAttachment: formData["isShownInAttachment"],
            });
          }
          break;
      }
    }
  }

  return arrayData;
};

const getIdentifier = (tag = "GDMS") => {
  return tag + "-" + moment().format("YYYY-MM-DD") + "-" + Date.now();
};

export { getFormData, getIdentifier, getMultipleFormData };
