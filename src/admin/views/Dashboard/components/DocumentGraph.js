import React, { useEffect, useState } from "react";
import { getDocumentReport } from "../api/dashboard";
import { Card, CardHeader, CardBody } from "reactstrap";
import moment from "moment";
import Chart from "chart.js";
import { getRandomColor } from "../util/report";

const DocumentGraph = (props) => {
  const [showMonthSpan] = useState(6);
  const [totalDocumentsData, setTotalDocumentsData] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    getDocumentReport("all", (err, data) => {
      if (!err) {
        drawChart(data);
      }
    });
  }, []); //eslint-disable-line
  const labels = totalDocumentsData.map(({ year, month }) => {
    const monthValue = moment(year + "-" + (String(month).length === 1 ? `0${month}` : month)).format("YYYY-MMMM");
    return monthValue;
  });
  const totalValues = totalDocumentsData.map(({ count }) => count);

  function drawChart(data) {
    const length = data.length;
    const { year, month } = data[length - 1];
    var allDocuments = [];
    var colors = [];
    for (var i = 0; i < showMonthSpan; i++) {
      var color = getRandomColor();
      colors.push(color);
      if (data[i]) {
        allDocuments.push(data[i]);
      } else {
        const date = moment(year + "-" + (String(month).length === 1 ? `0${month}` : month)).subtract(i, "months");
        allDocuments = [
          {
            count: 0,
            year: Number(date.format("YYYY")),
            month: Number(date.format("MM")),
          },
        ].concat(allDocuments);
      }
    }
    setTotalDocumentsData(allDocuments);
    setColors(colors);
  }

  new Chart("documentsChart", {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "total documents",
          data: totalValues,
          backgroundColor: colors,
          fill: false,
        },
      ],
    },
    options: {
      aspectRatio: 4,
      legend: { display: false },
      scales: {
        yAxes: [{ ticks: { beginAtZero: true } }],
        xAxes: [
          {
            barPercentage: 0.4,
          },
        ],
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <p className="h5">
          <i className="fa fa-doc" /> Total Documents
        </p>
      </CardHeader>
      <CardBody>
        <canvas id="documentsChart" />
        <div className="text-center mt-2">
          <h5>
            <strong>Total Documents Vs. Time</strong>
          </h5>
        </div>
      </CardBody>
    </Card>
  );
};
export default DocumentGraph;
