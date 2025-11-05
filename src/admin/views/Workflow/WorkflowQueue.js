import React from "react";
import { connect } from "react-redux";
import { Card, Row, Col, CardBody, CardHeader } from "reactstrap";
import _ from "lodash";
import { getUser } from "./util";

const WorkflowQueue = (props) => {
  const workflowMaster = props.workflowMaster || {};
  const workflowUsers = _.orderBy(workflowMaster.workflow_users, ["level"], "asc") || [];
  return (
    <>
      <Row className="my-2">
        <Col xs={5} sm={4} md={3}>
          <Card className="shadow">
            <CardHeader>
              <span>{workflowMaster.requestId}</span>
            </CardHeader>
          </Card>
        </Col>
        <Col xs={7} sm={8} md={9} />
        <Col key={workflowMaster.initiatorId} sm={4} md={3}>
          <Card
            className={
              workflowMaster.assignedTo === workflowMaster.initiatorId ? "shadow bg-warning blink_me" : "bg-info shadow"
            }
          >
            <CardBody style={{ height: 60, alignItems: "center" }}>
              <strong>{getUser(workflowMaster.initiatorId, props.users)}</strong>
            </CardBody>
          </Card>
        </Col>
        {workflowUsers.map((workflowUser) => {
          const isAssigned = workflowMaster.assignedTo === workflowUser.userId;
          // const isApprover = workflowUser.type === "approver";
          return (
            <Col key={workflowUser.userId} sm={4} md={3}>
              <Card className={isAssigned ? "shadow bg-warning blink_me" : "shadow bg-info"}>
                <CardBody style={{ height: 60, alignItems: "center" }}>
                  <strong>{getUser(workflowUser.userId, props.users)}</strong>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(WorkflowQueue);
