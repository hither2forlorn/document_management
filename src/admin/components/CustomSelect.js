import React, { useEffect, useState } from "react";
import { Label, Input, FormGroup, Col } from "reactstrap";
import { sortArrayOfObject } from "utils/arrayManipulation";
import Required from "./Required";

const CustomSelect = ({
  label,
  name,
  onChange,
  object,
  isEdit,
  required,
  options,
  defaultValue,
  errors,
  defaultValueOnlyForCombobox, // donot use this
  hasDefaultValue,
  doNotSort,
  filterParentId,
  disabled,
}) => {
  // donot sort if it is hierarchy
  let level;
  options?.map((opt) => {
    if (opt?.level) {
      level = true;
    }
  });

  const [disableParentId, setDisableParentId] = useState([]);
  // sort data
  if (options && !level && !hasDefaultValue) {
    if (!doNotSort) options = sortArrayOfObject(options, "name");
  }

  const checkParentId = () => {
    if (filterParentId) {
      if (filterParentId?.length > 0) {
        setDisableParentId(filterParentId);
      }
    }
  };

  useEffect(() => {
    checkParentId();
  }, [filterParentId]);

  return (
    <>
      <FormGroup>
        {label && (
          <Label>
            {label}
            {required && label && <Required />}
          </Label>
        )}
        <Input
          className="rounded"
          type="select"
          name={name}
          id={name}
          onChange={onChange}
          {...(isEdit
            ? {
                value: object[name] ? object[name] : "",
              }
            : {})}
          {...(defaultValueOnlyForCombobox
            ? {
                value: defaultValueOnlyForCombobox,
              }
            : {})}
          required={required}
        >
          {!defaultValue && (
            <option value="" key="0">
              -----NONE----
            </option>
          )}
          {options && options.length >= 1 ? (
            options?.map((row, i) => {
              let padding = "";
              let level = row?.level ? row?.level : 0;
              while (level-- > 0) {
                padding += "---";
              }
              return (
                <option
                  key={i}
                  title={row?.hierarchy}
                  value={name == "hierarchy" ? row?.code : row?.id}
                  // check if locationMap list includes that parentid and disable it
                  disabled={name == "locationMapId" && disableParentId?.includes(row?.id)} //&& row.level === 0
                >
                  {padding + " " + row?.name}
                </option>
              );
            })
          ) : !hasDefaultValue ? null : (
            <option value="" key="0">
              --NONE--
            </option>
          )}
        </Input>
        {errors ? <span className="text text-danger">{errors[0]}</span> : null}
      </FormGroup>
    </>
  );
};

export default CustomSelect;
