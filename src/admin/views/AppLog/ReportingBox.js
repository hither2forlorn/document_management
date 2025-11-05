import React, { useState } from "react";
import { useQuery } from "react-query";
import { reporting } from "./api";
import { Link } from "react-router-dom";

const ReportingBox = () => {
  const { isLoading, error, data } = useQuery("reporting", () => reporting());

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <>
      {data.data.map((row) => {
        return (
          <Link to={"/admin/log?queryId=" + row.id} className={`btn btn-primary btn-sm btn-brand text-white mr-2 mb-2 mt-1`}>
            {row.name}
          </Link>
        );
      })}
    </>
  );
};

export default ReportingBox;
