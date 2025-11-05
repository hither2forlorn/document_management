import React from "react";

export default function Required({ required = true }) {
  if (required)
    return (
      <span className="text-danger h6 ml-1">
        <b>*</b>
      </span>
    );
  else return "";
}
