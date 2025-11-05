import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { getUser } from "./util";
import moment from "moment";
import _ from "lodash";

const WorkflowLog = (props) => {
  const [timeline, setTimeline] = useState([]);
  const getColorIcon = (action) => {
    switch (action) {
      case "Initiate":
        return {
          color: "bg-default",
          icon: "fas fa-hourglass-start bg-default",
        };
      case "Comment":
        return {
          color: "bg-secondary",
          icon: "fas fa-comment-dots bg-secondary",
        };
      case "Return":
        return { color: "bg-warning", icon: "fas fa-fast-backward bg-warning" };
      case "Submit":
        return { color: "bg-info", icon: "fas fa-dot-circle-o bg-info" };
      case "Approved":
        return { color: "bg-success", icon: "fas fa-check bg-success" };
      default:
        return { color: "", icon: "" };
    }
  };
  useEffect(() => {
    // Create Timeline Schema
    const logs = props.workflowLogs || [];
    const timelineLogs = [];
    logs.forEach((log) => {
      const date = moment(log.createdAt).format("YYYY-MM-DD");
      const index = _.findIndex(timelineLogs, { date: date });
      if (index >= 0) {
        timelineLogs[index] = {
          date: timelineLogs[index].date,
          logs: [...timelineLogs[index].logs, log],
        };
        log.date = date;
      } else {
        timelineLogs.push({
          date,
          logs: [log],
        });
      }
      return log;
    });
    setTimeline(timelineLogs);
  }, [props.workflowLogs]);
  return (
    <section className="mt-3">
      <div className="container-fluid">
        {timeline.map((timeline, index) => {
          return (
            <div key={index} className="timeline mb-0 mt-0 pb-4">
              {/*  TIMELINE LABEL */}
              {timeline.date ? (
                <div className="time-label">
                  <span className={getColorIcon(timeline.action).color}>{timeline.date}</span>
                </div>
              ) : null}
              {/*  TIMELINE ITEM */}
              {timeline.logs.map((log) => (
                <div key={log.id}>
                  {/* ICON */}
                  <i className={getColorIcon(log.action).icon}></i>
                  <div className="timeline-item">
                    <span className="timeline-header float-right text-white ">Action: {log.action}</span>
                    <h3 className={"timeline-header " + getColorIcon(log.action).color}>
                      User: {getUser(log.userId, props.users)}
                    </h3>
                    <div className="timeline-header py-4">
                      <span dangerouslySetInnerHTML={{ __html: log.comment }}></span>
                    </div>
                    <div className="timeline-header">
                      <span>{log.assignedOn ? "Assigned On: " + moment(log.assignedOn).format("YYYY-MM-DD") : ""}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
    //   </CardBody>
    // </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(WorkflowLog);
