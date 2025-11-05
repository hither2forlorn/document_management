import React from "react";
import Select from "react-select";

import { Label, Input, FormGroup, Col } from "reactstrap";
export default function ReactSelect({
  label,
  onChange,
  required,
  errors,
  object,
  options,
  isEdit,
  name,
  getFieldValue,
  ...rest
}) {
  options = options?.map((row) => {
    return { ...row, label: row?.name, value: row?.[getFieldValue] || row?.id };
  });

  options = options?.map((row) => {
    let padding = "";
    let level = row?.level ? row?.level : 0;
    while (level-- > 0) {
      padding += "---";
    }

    return { ...row, label: padding + " " + row.label };
  });

  return (
    <>
      <FormGroup>
        <Label>
          {label ? label : ""}
          {required && (
            <span className="text-danger h6 ml-1">
              <b>*</b>
            </span>
          )}
        </Label>
        <Select
          {...(isEdit
            ? {
              value: object[name] ? object[name] : "",
            }
            : {})}
          name={name}
          options={options}
          onChange={onChange}
          {...rest}
        />
        {errors ? <span className="text text-danger">{errors[0]}</span> : null}
      </FormGroup>
    </>
  );
}
