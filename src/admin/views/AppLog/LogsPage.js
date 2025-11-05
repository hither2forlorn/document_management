import React, { useState, useRef, useEffect } from "react";

import ReportingBox from "./ReportingBox";
import { Route, useLocation } from "react-router-dom";
import PaginationTable from "./PaginationTable";
import axios from "axios";

export default function LogsPage(props) {
  const queryId = useLocation().search.split("=")[1];
  const [data, setData] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8181/api/metalink").then((response) => {
      console.log(response.data.iframeUrl);
      setData(response.data.iframeUrl);
    });
  }, []);

  return (
    <>
      <iframe src={data} frameborder="0" width="100%" height="600" allowtransparency></iframe>
    </>
  );
}
