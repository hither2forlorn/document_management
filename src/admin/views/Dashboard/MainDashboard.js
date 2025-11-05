import axios from "axios";
import React, { useState, useEffect } from "react";
// import PendingMemo from "./components/PendingMemo";
// import MemoDashboard from "./components/MemoDashboard";
import DocumentGraph from "./components/DocumentGraph";
import DocumentInfo from "./components/DocumentInfo";

const MainDashboard = (props) => {
  return (
    <div>
      {/* <PendingMemo />
      <MemoDashboard /> */}
      <DocumentInfo />
      <div className="my-2">
        <DocumentGraph />
      </div>
    </div>
  );
};
export default MainDashboard;
