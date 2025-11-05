import React, { useEffect } from "react";
import { ADMIN_USER, CLIENT_USER } from "../../../../config/values";

const HTMLFormRender = (props) => {
  const type = props.type || null;
  const isEdit = props.isEdit || false;
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
          element.value = JSON.parse(value);
          element.checked = JSON.parse(value);
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
              } else {
                // element.setAttribute('checked', false);
              }
              break;
            default:
              element.value = JSON.parse(value);
          }
        });
      }
    });
  }, [memoValues, isEdit, type]);
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: formData,
      }}
    />
  );
};

export default HTMLFormRender;
