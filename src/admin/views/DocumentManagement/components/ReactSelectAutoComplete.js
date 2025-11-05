import axios from "axios";
import React, { useState } from "react";
import isJsonObj from "../../Util/isJsonObj";
import Select from "react-select";

import { useSelector } from "react-redux";
export default function ReactSelectAutoComplete({
  url,
  name,
  validation,
  handleChange,
  listValues,
  getValueOfIndex,
  api_label,
  api_value,
  row,
  one,
}) {
  let constants = useSelector((state) => state.allFields.constants);

  constants = constants.map((row) => {
    row.label = row.name;
    row.value = row.id;
    return row;
  });
  const promiseOptions = () => {
    let valueData;
    if (validation) {
      valueData = JSON.parse(validation);
      const parse = valueData && valueData?.options && valueData?.options.length > 0 ? valueData?.options : "";
      return parse;
    }
  };

  const options = promiseOptions();
  const id = getValueOfIndex(listValues, row.id);

  const obj = constants.find((row) => row.id == id);
  return (
    <Select
      className="mt-2"
      name={name}
      onChange={(value) => {
        handleChange([], name, value?.value, row?.condition, value);
      }}
      // value={listValues}
      value={obj}
      options={options}
      defaultOptions
    />
  );
}
