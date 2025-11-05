import React from "react";
import moment from "moment";
import { Label, Input, FormGroup, Col } from "reactstrap";
import Required from "./Required";

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
  minLength,
  errors,
  children,
  bokIdBata,
  disabled,
  checked,
  className,
  onInput,
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

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Email validation logic
  const isEmailValid = name === "mailId" ? emailRegex.test(value) : true;

  return (
    <>
      <FormGroup style={{ width: bokIdBata ? "95%" : "100%" }}>
        {type !== "checkbox" ? (
          <Label>
            {label ? label : ""}
            {required && <Required />}
          </Label>
        ) : null}
        <Input
          onInput={onInput}
          className={`rounded ${className}`}
          style={{ left: type !== "checkbox" ? 37 : null }}
          placeholder={label}
          name={name}
          checked={checked}
          id={name}
          disabled={disabled}
          type={type}
          required={required}
          {...(maxLength
            ? {
              maxLength: maxLength,
            }
            : {})}
          {...(minLength
            ? {
              minLength: minLength,
            }
            : {})}
          onChange={onChange}
          readOnly={readOnly}
          {...(isEdit
            ? type == "checkbox" && value === true
              ? { checked: value }
              : { value: value }
            : {
              defaultValue: defaultValue || "",
            })}
        />
        {children}

        {/* Error message for email validation */}
        {!isEmailValid && name === "mailId" && (
          <span className="text text-danger">Please enter a valid email address.</span>
        )}

        {errors ? (
          <span className="text text-danger">
            {errors?.map((err) => {
              return err;
            })}
          </span>
        ) : null}
      </FormGroup>
    </>
  );
};

export default CustomInput;