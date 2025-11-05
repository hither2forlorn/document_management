import axios from "axios";
import React, { useState } from "react";

import AsyncSelect from "react-select/async";
export default function AutoCompleteURL({
    url,
    name,
    handleChange,
    api_label,
    api_value, row,
    one,
}) {
    const [value, setValue] = useState("");
    let loadOptions = [{}];
    url = "http://localhost:8181/setup/account-list";

    const promiseOptions = async (
        url,
        inputValue
    ) => {
        const { data } = await axios.get(`${url}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        loadOptions = data.data.map((client) => {
            return { ...client, label: client?.[api_label], value: client.id };
        });

        return loadOptions;
    };

    const handleInputChange = (newValue) => {
        const inputValue = newValue.replace(/\W/g, "");
        setValue(inputValue);
        return inputValue;
    };

    return (
        <AsyncSelect
            className=""
            cacheOptions
            name={name}
            onChange={(value) => handleChange([], name, value?.[api_value], row.condition, value)}
            // [] to add 3 parms in listvalues,
            //  name to add index id in key,
            //  3 parm is to select the value(in onchange function there is nepaliDate),
            // last params is object to auto fill according to requirements.
            loadOptions={() => promiseOptions(url)}
            defaultOptions
            onInputChange={handleInputChange}
        />
    );
}
