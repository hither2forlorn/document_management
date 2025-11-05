import React, { useEffect } from "react";
import { ADMIN_USER, CLIENT_USER } from "config/values";

const HTMLFormRender = (props) => {
  const type = props.type || null;
  const isEdit = props.isEdit || false;
  const bankUserEdit = props.isEditBank || false;
  const memoValues = props.memoValues || [];
  const formData = props.formData || "";
  useEffect(() => {
    switch (type) {
      case ADMIN_USER:
        break;
      case CLIENT_USER:
        const el = document.getElementById("bank-segment");
        if (el) el.parentNode.removeChild(el);
        break;
      default:
        break;
    }
    memoValues.forEach(({ name, value }) => {
      const elements = document.getElementsByName(name);
      if (elements.length !== 0) {
        elements.forEach((element) => {
          console.log(isEdit, bankUserEdit);
          if (isEdit || (bankUserEdit && element.parentNode.id === "bank-segment")) {
            element.setAttribute("name", name);
          } else {
            element.setAttribute("readonly", "readonly");
            element.removeAttribute("name");
          }
          switch (element.type) {
            case "checkbox":
              if (value === "true") {
                element.setAttribute("checked", true);
              } else {
                element.removeAttribute("checked");
              }
              break;
            case "radio":
              if (JSON.stringify(element.value) === value) {
                element.setAttribute("checked", true);
              }
              break;
            default:
              const formValue = value.slice(1, -1);
              element.setAttribute("value", formValue);
              element.value = JSON.parse(value);
          }
        });
      }
    });
  }, [memoValues, isEdit, type]); //eslint-disable-line
  return (
    <div
      id="html-form-segment"
      className="my-2"
      dangerouslySetInnerHTML={{
        __html: formData,
      }}
    />
  );
};

export default HTMLFormRender;
