import React, { useEffect, useState } from "react";
import { Card, CardDeck, CardHeader, CardBody } from "reactstrap";
import { getMemoReport } from "../api/memo";
import { getRandomColor, animateOption } from "../util/report";
import { Pie } from "react-chartjs-2";

const MemoDashboard = (props) => {
  const [pendingData, setPendingData] = useState([]);
  const [approvedData, setApprovedData] = useState([]);
  useEffect(() => {
    getMemoReport("status", (err, data) => {
      if (!err) {
        chartColors(data);
      }
    });
  }, []);

  function chartColors(e) {
    var colors = [];
    var approvedData = [];
    var pendingData = [];
    for (var i = 0; i < e.length; i++) {
      var color = getRandomColor();
      colors.push(color);
      if (e[i].currentStatus === "Approved") {
        approvedData.push(e[i]);
      } else {
        pendingData.push(e[i]);
      }
    }
    setPendingData({
      labels: pendingData.map(({ name }) => name),
      datasets: [
        {
          label: "Pending Memo",
          data: pendingData.map(({ count }) => count),
          backgroundColor: colors,
        },
      ],
    });
    setApprovedData({
      labels: approvedData.map(({ name }) => name),
      datasets: [
        {
          label: "Approved Memo",
          data: approvedData.map(({ count }) => count),
          backgroundColor: colors,
        },
      ],
    });
  }

  return (
    <CardDeck className="my-3">
      <Card className="shadow">
        <CardHeader>
          <h5>Pending Memo</h5>
        </CardHeader>
        <CardBody>
          <Pie data={pendingData} options={animateOption} />
        </CardBody>
      </Card>
      <Card className="shadow">
        <CardHeader>
          <h5>Approved Memo</h5>
        </CardHeader>
        <CardBody>
          <Pie data={approvedData} options={animateOption} />
        </CardBody>
      </Card>
    </CardDeck>
  );
};

export default MemoDashboard;
