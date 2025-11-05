import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, Input, Table, FormGroup, Label, Row, Col } from "reactstrap";
import { getWorkflow, editWorkflow } from "./api";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { getUser } from "./util";
import _ from "lodash";

const WorkflowBuilder = (props) => {
  const [workflow, setWorkflow] = useState({});
  const [selectedUser, setSelectedUser] = useState({});
  const users = props.users;
  const setHasUser = (workflow) => {
    if (props.setHasUser) {
      const users = workflow.workflow_users || [];
      const lastUser = _.last(users);
      if (lastUser) {
        props.setHasUser(lastUser.type === "approver");
      }
    }
  };
  useEffect(() => {
    if (props.workflowId) {
      getWorkflow(props.workflowId, (err, data) => {
        if (err) toast.error("Error!");
        else setWorkflow(data);
        setHasUser(data);
      });
    }
  }, [props.workflowId]); //eslint-disable-line
  const editUsers = (action, payload) => {
    let workflowUsers = workflow.workflow_users || [];
    const lastUser = _.findLast(workflowUsers);
    const workflowUser = {
      workflowId: workflow.id,
      userId: payload.userId,
      type: payload.type,
      level: lastUser ? lastUser.level + 1 : 1,
    };
    switch (action) {
      case "add":
        const hasApprover = _.find(workflowUsers, { type: "approver" });
        switch (workflowUser.type) {
          case "approver":
            if (!hasApprover) {
              workflowUsers.push(workflowUser);
            } else {
              toast.warn("Cannot add two approvers");
            }
            break;
          case "recommender":
            if (!hasApprover) {
              workflowUsers.push(workflowUser);
            } else {
              toast.warn("Cannot add recommender after approver");
            }
            break;
          default:
            break;
        }
        break;
      case "delete":
        workflowUsers = workflowUsers
          .filter((w, i) => {
            return i === payload.index ? 0 : 1;
          })
          .map((u, idx) => ({ ...u, level: idx + 1 }));
        break;
      default:
        break;
    }
    workflow.workflow_users = workflowUsers;
    setWorkflow({ ...workflow });
    setSelectedUser({});
  };
  const onSubmit = () => {
    const hasApprover = _.find(workflow.workflow_users || [], {
      type: "approver",
    });
    if (!hasApprover) {
      toast.warn("Could not submit without selecting an approver");
    } else {
      setHasUser(workflow);
      editWorkflow(workflow, (err, json) => {
        if (err) toast.error("Error!");
        else toast.success("Success!");
      });
    }
  };
  return !props.workflowId ? null : (
    <Card className="shadow">
      <CardHeader>Workflow creator</CardHeader>
      <CardBody>
        <Row style={{ alignItems: "center" }}>
          <Col>
            <FormGroup>
              <Label>User</Label>
              <Input
                className="rounded"
                type="select"
                onChange={(e) => setSelectedUser({ ...selectedUser, id: e.target.value })}
                value={selectedUser.id || ""}
              >
                <option value="">---- NONE ----</option>
                {users.map((user) => {
                  let isSelected = false;
                  if (workflow.workflow_users) {
                    workflow.workflow_users.forEach((w) => {
                      if (w.userId === user.id) {
                        isSelected = true;
                      }
                    });
                  }
                  return isSelected ? null : (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  );
                })}
              </Input>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Type</Label>
              <Input
                className="rounded"
                type="select"
                onChange={(e) => setSelectedUser({ ...selectedUser, type: e.target.value })}
                value={selectedUser.type || ""}
              >
                <option value="">---- NONE ----</option>
                <option value="recommender">Recommender</option>
                <option value="approver">Approver</option>
              </Input>
            </FormGroup>
          </Col>
          <Col>
            <Button
              size="sm"
              color="info"
              onClick={() => {
                if (selectedUser.id && selectedUser.type) {
                  editUsers("add", {
                    userId: Number(selectedUser.id),
                    type: selectedUser.type,
                  });
                } else {
                  toast.warn("Both user & type should be selected!");
                }
              }}
            >
              <i className="fa fa-plus text-white" />
            </Button>
          </Col>
        </Row>
        <Table responsive bordered hover className="mt-2">
          <thead>
            <tr>
              <td>Level</td>
              <td>Name</td>
              <td>Type</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {!workflow.workflow_users
              ? null
              : workflow.workflow_users.map((workflowUser, idx) => (
                  <tr key={idx}>
                    <td>{workflowUser.level}</td>
                    <td>{getUser(workflowUser.userId, users)}</td>
                    <td>{workflowUser.type.toUpperCase()}</td>
                    <td>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => {
                          editUsers("delete", {
                            index: idx,
                          });
                        }}
                      >
                        <i className="fa fa-trash text-white" />
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter>
        <Button onClick={onSubmit} color="success" size="sm" className="float-right">
          Submit
        </Button>
      </CardFooter>
    </Card>
  );
};

WorkflowBuilder.propTypes = {
  users: PropTypes.array,
  workflowId: PropTypes.number,
};

export default WorkflowBuilder;
