import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import { getDeleteLogReport } from "../api/document";
import { getRandomColor, animateOption } from "../util/report";
import { Doughnut, Pie } from "react-chartjs-2";

const DeleteLogReport = (props) => {
  const [deleteLogData, setDeleteLogData] = useState([]);
  useEffect(() => {
    getDeleteLogReport((err, data) => {
      if (!err) {
        chartColors(data);
      }
    });
  }, []);

  function chartColors(data) {
    setDeleteLogData({
      labels: data.map(({ itemType }) => itemType),
      datasets: [
        {
          label: "Delete Logs",
          data: data.map(({ count }) => count),
          backgroundColor: data.map((_) => getRandomColor()),
        },
      ],
    });
  }

  return (
    <Card className="bg-default shadow-lg">
      <CardHeader>
        <p className="h5">Delete logs</p>
      </CardHeader>
      <CardBody>
        <Doughnut data={deleteLogData} options={{ ...animateOption }} />
      </CardBody>
    </Card>
  );
};

export default DeleteLogReport;
