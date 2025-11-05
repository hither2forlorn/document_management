import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "reactstrap";
import { Pie } from "react-chartjs-2";
import { getDocumentTypeReport } from "../api/document";
import { getRandomColor, animateOption } from "../util/report";

const DocumentTypeReport = (props) => {
  const [documentTypeData, setDocumentTypeData] = useState([]);
  useEffect(() => {
    getDocumentTypeReport((err, data) => {
      if (!err) {
        chartColors(data);
      }
    });
  }, []);

  function chartColors(data) {
    setDocumentTypeData({
      labels: data?.map(({ name }) => name),
      datasets: [
        {
          data: data?.map(({ count }) => count),
          backgroundColor: data?.map((_) => getRandomColor()),
        },
      ],
    });
  }

  return (
    <Card className="bg-default shadow-lg">
      <CardHeader>
        <p className="h5">Document Type</p>
      </CardHeader>
      <CardBody>
        <Pie data={documentTypeData} options={{ ...animateOption }} />
      </CardBody>
    </Card>
  );
};

export default DocumentTypeReport;
