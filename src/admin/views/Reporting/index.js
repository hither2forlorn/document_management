import { Box, Tab, Tabs, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { ReportingData } from "Json";
import axios from "axios";

export default function Reporting() {
  const [value, setValue] = React.useState(0);
  const [reportData, setReportData] = React.useState([]);
  const [isTitled, setIsTitled] = React.useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let fetchReportingData = () => {
    axios.get("http://localhost:8181/api/get-reporting-iframe").then((response) => {
      let responseData = response.data.reportingFrame;
      if (responseData !== null && responseData !== undefined) {
        setReportData(responseData);
      }
    });
  };
  useEffect(() => {
    fetchReportingData();
  }, []);

  // console.log("ReportData", reportData);
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  if (reportData.length == 0) {
    return "No DB Data Found";
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          {reportData && reportData.length > 0
            ? reportData.map((tab) => (
                <Tab label={tab.name} {...a11yProps(tab.id)} /> //label changed to name
              ))
            : "No DB Data Found"}
        </Tabs>
      </Box>

      {reportData.map((tab) => (
        <TabPanel value={value + 1} index={tab.id}>
          {/* {console.log(tab.url + "#titled=" + tab.isTitled)} */}
          {<iframe src={`${tab.url}#titled=${tab.isTitled}`} style={{ width: "100%", height: "80vh" }} allowTransparency />}
        </TabPanel>
      ))}
    </Box>
  );
}
