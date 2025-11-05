import React from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import { Doughnut } from "react-chartjs-2";
import { getRandomColor, animateOption, hideLegend } from "../util/report";

const DocumentStatusReport = (props) => {
  const pieData = {
    labels: ["10/04/2018", "10/05/2018"],
    datasets: [
      {
        data: [22, 19],
        backgroundColor: [getRandomColor(), getRandomColor()],
      },
    ],
  };

  return (
    <Card className="bg-secondary shadow-lg">
      <CardHeader>
        <p className="text-white h5">Types Of Documents</p>
      </CardHeader>
      <CardBody>
        <Doughnut data={pieData} options={{ ...animateOption, ...hideLegend }} />
      </CardBody>
    </Card>
  );
};

export default DocumentStatusReport;
