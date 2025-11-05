import React, { useState } from "react";
import makeAnimated from "react-select/animated";
import Select, { StylesConfig } from "react-select";

export const ReactSelect = (props) => {
  const [multipleHierarchies, setMultipleHierarchies] = useState(null);
  const animatedComponents = makeAnimated();

  // load department hierarchies
  const departmentOnly = props?.hierarchies?.filter((row) => row.departmentId);

  // get department from api

  const loadOptions = departmentOnly.map((row, key) => {
    return {
      label: `${
        row.level == 1
          ? `---${row.name}`
          : row.level == 2
          ? `-----${row.name}`
          : row.level == 3 || row.level == 4
          ? `--------${row.name}`
          : `-------------${row.name}`
      }`,
      id: row.id,
      value: row.code,
      hierarchy: row.code,
      modelValueId: props?.hierarchy?.id,
    };
  });
  // set selected hierarchies
  let defaultValue =
    (props?.hierarchy?.multiple_hierarchies &&
      props?.hierarchy?.multiple_hierarchies.map((row, key) => {
        return {
          label: `${
            row.level == 1
              ? `---${row.hierarchy}`
              : row.level == 2
              ? `-----${row.hierarchy}`
              : row.level == 3 || row.level == 4
              ? `--------${row.hierarchy}`
              : `-------------${row.hierarchy}`
          }`,
          hierarchy: row.hierarchy,
          value: row.id || "",
          id: row.id || "",
          modelValueId: props?.hierarchy?.id,
        };
      })) ||
    [];

  const onChange = (value, params) => {
    value = value || [];
    defaultValue = []; // if perform any action then clear default value
    props.parentCallback(value);

    if (params?.action === "remove-value") {
      setMultipleHierarchies(value);
    } else {
      setMultipleHierarchies(value);
    }
  };

  return (
    <>
      <Select
        name="department"
        closeMenuOnSelect={false}
        onChange={onChange}
        components={animatedComponents}
        value={multipleHierarchies || defaultValue}
        options={loadOptions}
        isMulti
      />
    </>
  );
};
