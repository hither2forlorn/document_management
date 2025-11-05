import React from "react";
import { conditions } from "../../../../../constants/conditional";

export const conditional = (params, params1, param2, params4) => {
  console.log(params1, "params1");
  console.log(param2, "param2");
  const data = params;
  const parse = JSON.parse(data);
  let finalData;
  parse?.map((data, index) => {
    switch (parseInt(data.condition)) {
      case conditions.LessThen:
        // return "Issue Date";
        console.log("LessThen.");
        finalData = param4;
        return finalData;
        // return true
        break;
      case conditions.GreaterThen:
        console.log("GreaterThen...");
        finalData = params1 === params1 ? param2 : null;
        return finalData;
        break;
      case conditions.Concate:
        console.log("Concate");
        break;
      default:
        console.log("Sorry, we are out.");
    }
  });
  // params.map
  return <div>conditional</div>;
};
