import React, { useState } from "react";
import { connect } from "react-redux";
import { Card, Input, CardHeader, CardBody, Label, Button, Row, Col, FormGroup } from "reactstrap";
import { EditorState, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { toast } from "react-toastify";
import { takeActionWorkflow } from "./api";
import { CURRENT_USER_ID } from "config/values";
import PropTypes from "prop-types";
import _ from "lodash";
import { getUser } from "./util";

const WorkflowAction = (props) => {
  const workflowMaster = props.workflowMaster || {};
  const workflowUsers = workflowMaster.workflow_users || [];
  const currentUserId = Number(localStorage.getItem(CURRENT_USER_ID));
  const currentUser = _.find(workflowUsers, { userId: currentUserId }) || {};
  const [userId, setUserId] = useState("");
  const [editorValue, setEditorValue] = useState(EditorState.createEmpty());
  const [comment, setComment] = useState("");

  const onSubmit = (e) => {
    const action = e.target.name;
    if (action === "return") {
      if (!userId) {
        toast.warn("An user must be selected");
        return;
      }
      if (!comment) {
        toast.warn("Comment must not be empty");
        return;
      }
    }
    if (action === "comment" && !comment) {
      toast.warn("Comment must not be empty");
      return;
    }
    takeActionWorkflow(
      {
        action,
        data: {
          comment,
          workflowMasterId: workflowMaster.id,
          userId,
        },
      },
      (err, json) => {
        if (err) toast.error("Error!");
        else {
          toast.success("Success!");
          props.getData();
        }
      }
    );
  };

  const onEditorStateChange = (editorValue) => {
    setEditorValue(editorValue);
    const editorHTML = draftToHtml(convertToRaw(editorValue.getCurrentContent()));
    setComment(editorHTML);
  };
  return workflowMaster.currentStatus === "Approved" || workflowMaster.assignedTo !== currentUserId ? null : (
    <>
      <Card className="my-2 shadow">
        <CardHeader>Comment</CardHeader>
        <CardBody>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Editor
                  editorState={editorValue}
                  wrapperClassName="border border-dark"
                  placeholder="Enter comment (optional)"
                  onEditorStateChange={onEditorStateChange}
                  toolbar={{
                    options: [
                      "inline",
                      "blockType",
                      "fontSize",
                      "fontFamily",
                      "list",
                      "textAlign",
                      "colorPicker",
                      "link",
                      "history",
                    ],
                  }}
                />
              </FormGroup>
            </Col>
            <Col md={5} className="mt-3">
              {currentUserId !== workflowMaster.assignedTo ? null : (
                <>
                  {!currentUser.userId ? null : (
                    <FormGroup>
                      <Label for="returnTo">
                        <strong>Return to</strong>
                      </Label>
                      <Input
                        className="rounded"
                        id="returnTo"
                        type="select"
                        value={userId}
                        onChange={({ target: { value } }) => setUserId(value)}
                      >
                        <option value="">__ NONE __</option>
                        <option value={workflowMaster.initiatorId}>
                          {getUser(workflowMaster.initiatorId, props.users)}
                        </option>
                        {workflowUsers.map((user) =>
                          user.level < currentUser.level ? (
                            <option key={user.id} value={user.userId}>
                              {getUser(user.userId, props.users)}
                            </option>
                          ) : null
                        )}
                      </Input>
                    </FormGroup>
                  )}
                  {currentUser.userId ? (
                    <Button className="text-white mx-1" name="return" onClick={onSubmit} color="warning" size="sm">
                      Return
                    </Button>
                  ) : null}
                  {!userId && currentUser.type === "approver" ? (
                    <Button className="text-white mx-1" name="complete" onClick={onSubmit} color="success" size="sm">
                      Approve
                    </Button>
                  ) : null}
                  {!userId && currentUser.type !== "approver" ? (
                    <Button className="text-white mx-1" name="submit" onClick={onSubmit} color="success" size="sm">
                      Submit
                    </Button>
                  ) : null}
                </>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

WorkflowAction.propTypes = {
  workflowMaster: PropTypes.object.isRequired,
  getData: PropTypes.func.isRequired,
};

export default connect((state) => ({
  users: state.allFields.users,
}))(WorkflowAction);
