import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { Input } from "reactstrap";

const AutoComplete = (props) => {
  // console.log(props.name);
  const [value, setValue] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  let loadOptions = [{}];
  // 01606017200022

  const promiseOptions = async (inputValue) => {
    // console.log(inputValue,"ok");
    // const token = await localStorage.getItem("token");
    // const populateUrl = `https://check.ebl-zone.com/api/schm?acct=${accountNumber}`;
    if ((inputValue && inputValue.length == 14) || inputValue.length == 5) {
      const populateUrl = `http://10.1.11.48:8181/setup/external-api`;
      const data = await axios(populateUrl, {
        method: "GET",
        headers: {
          "Access-Control-Allow-Origin": "http://10.1.11.48:3000",
          "Content-Type": "application/json",
          vary: "Accept-Encoding",
        },
        params: {
          accNo: inputValue,
        },
      });

      // console.log(data.data.data);
      const output = data.data.data;
      console.log(output, "output");
      // const output = data.data.accountList;
      // loadOptions = output.map((index, key) => {
      // console.log(index, "index");
      // return index;
      //   return {
      // value: output.idNum || "",
      // label: output.acct || "",
      // accountName: output.acctName || "",
      // branch: output.branch || "",
      // schmCode: output.schmCode || "",
      // cid: output.custId || "",
      // idNum: output.idNum || "",
      //   };
      // });
      // return loadOptions;
      setValue(output.acct);
      return [
        {
          value: output.idNum || "",
          label: output.acct || "",
          accountName: output.acctName || "",
          branch: output.branch || "",
          schmCode: output.schmCode || "",
          cid: output.custId || "",
          idNum: output.idNum || "",
        },
      ];
    }
  };

  const handleInputChange = (e, { name }) => {
    setValue(e);
    if (e) {
      // console.log(null, name, null, e, "4");
      props.handleInputChange(null, name, null, e, "4");
    }
  };

  const handleChange = (e) => {
    // console.log(e, "value");
    const accNumb = e;
    let length = accNumb.length;
    if (length == 14 || length == 5) {
      promiseOptions(accNumb);
      setAccountNumber(accNumb);
    }
  };

  // console.log(accountNumber, "accountNumber");
  return (
    <AsyncSelect
      className=""
      cacheOptions
      onInputChange={handleChange}
      onChange={handleInputChange}
      name={props.name}
      // getOptionValue={() => getOption}
      //   onChange={handleChange}
      // loadedInputValue={}
      loadOptions={promiseOptions}
      value={value}
      defaultOptions
    />

    // <Input
    //         className={`rounded`}
    //         onChange={(e) => handleChange(e)}
    //         type="text"
    //         name={props.name}
    //         value={accountNumber}
    //         required="required"
    //       />
  );
};

export default AutoComplete;
