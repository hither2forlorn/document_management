import React from "react";
import moment from "moment";

const CustomInput = ({
  label,
  name,
  onChange,
  object,
  isEdit,
  readOnly,
  defaultValue,
  type,
  required,
  maxLength,
  noLabel,
}) => {
  const rawValue = object ? (object[name] ? object[name] : "") : "";
  let value = "";
  switch (type) {
    case "date":
      value = moment(rawValue).format("YYYY-MM-DD");
      break;
    default:
      value = rawValue;
      break;
  }

  return (
    <>
      {!noLabel && <label className="col-sm-4">{label ? label : ""}</label>}
      <input
        className="col-sm-8"
        placeholder={label}
        name={name}
        id={name}
        type={type}
        required={required}
        {...(maxLength
          ? {
              maxLength: maxLength,
            }
          : {})}
        onChange={onChange}
        readOnly={readOnly}
        {...(isEdit
          ? {
              value: value,
            }
          : {
              defaultValue: defaultValue || "",
            })}
      />
    </>
  );
};

export default CustomInput;
