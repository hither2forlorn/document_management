import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Label, Modal, Button, Col, Row, Form } from "reactstrap";
import query from "querystring";
import A from "config/url";
import FormBuilder from "gentech-form-builder";
import { getMemo, editMemo, startWorkflow } from "./api/memo";
import { getWorkflowMaster } from "../Workflow/api";
import WorkflowQueue from "../Workflow/WorkflowQueue";
import WorkflowAction from "../Workflow/WorkflowAction";
import { toast } from "react-toastify";
import WorkflowLog from "../Workflow/WorkflowLog";
import { CURRENT_USER_ID } from "config/values";
import AttachmentListTable from "./components/AttachmentListTable";
import PreviewAttachments from "./components/PreviewAttachments";
import HTMLFormRender from "./components/HTMLFormRender";
import { getFormData } from "config/form";
import { printDiv, getValue } from "config/util";
import metaRoutes from "config/meta_routes";
import moment from "moment";
import _ from "lodash";
import { connect } from "react-redux";

const MemoView = (props) => {
  const qs = query.parse(props.location.search);
  const memoId = A.getId(qs["?i"]);
  const [memo, setMemo] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [workflowMaster, setWorkflowMaster] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [canEditMemo, setCanEditMemo] = useState(false);
  const [canEditBankDetail, setCanEditBankDetail] = useState(false);
  const currentUserId = Number(localStorage.getItem(CURRENT_USER_ID));
  useEffect(() => {
    if (!memoId) {
      props.history.push(metaRoutes.memoList);
    } else {
      getData();
    }
  }, []); //eslint-disable-line
  const getData = () => {
    getMemo(memoId, (err, data) => {
      if (err) props.history.push(metaRoutes.memoList);
      else {
        if (data.memo.workflowMasterId) {
          getWorkflowMaster(data.memo.workflowMasterId, (err, master) => {
            if (err) toast.error("Error!");
            else {
              setWorkflowMaster(master);
              const canEdit = master.initiatorId === currentUserId && master.assignedTo === currentUserId;
              setCanEditBankDetail(master.assignedTo === currentUserId && master.currentLevel === 1);
              setCanEditMemo(canEdit);
              setIsLoaded(true);
            }
          });
        } else {
          setCanEditMemo(true);
        }
        setMemo(data.memo);
        // setMemoDetails(data.memoDetails);
      }
    });
  };

  const printReport = () => {
    let divContent = "";
    const links = document.getElementsByTagName("link");
    const styles = document.getElementsByTagName("style");
    const formDiv = document.getElementById("form").innerHTML;
    divContent += formDiv;
    if (workflowMaster.id) {
      divContent += "<h3>Action Logs</h3>";
      const actionTable = _.join(
        workflowMaster.workflow_logs.map(
          (log) =>
            `<tr>
                    <td>${getValue(props.users, log.userId)}</td>
                    <td>${log.action}</td>
                    <td>${log.comment}</td>
                    <td>${log.assignedOn ? moment(log.assignedOn).format("YYYY-MM-DD") : ""}</td>
                    <td>${moment(log.createdAt).format("YYYY-MM-DD")}</td>
                </tr>`
        ),
        ""
      );
      divContent += `<table><thead><tr>
            <th>User</th>
            <th>Action</th>
            <th>Comment</th>
            <th>Assigned On</th>
            <th>Task Completed On</th>
            </tr>
            </thead>
            <tbody>${actionTable}</tbody>
            </table>
            `;
    }
    if (memo.attachments.length > 0) {
      divContent += "<h3>Attachments</h3>";
      const attachmentsTable = _.join(
        memo.attachments.map(
          (att) =>
            `<tr>
                    <td>${att.name}</td>
                    <td>${att.size}</td>
                    <td>${moment(att.createdAt).format("YYYY-MM-DD")}</td>
                    <td>${getValue(props.users, att.createdBy)}</td>
                </tr>`
        ),
        ""
      );
      divContent += `<table><thead><tr>
                <th>Name</th>
                <th>Size (in KB)</th>
                <th>Uploaded At</th>
                <th>Uploaded By</th> 
                </tr></thead><tbody>${attachmentsTable}</tbody></table>`;
    }
    workflowMaster.workflow_users.forEach((user) => {
      divContent += `
      <div className="form-group float-right mt-5 mx-3">
      <div className="mt-2" ><input style="height:100px"/></div>
      <div className="mt-1 text-center">Authorized Signature</div>
      <div className="mt-1 text-center">${getValue(props.users, user.userId)}</div>
      </div>
      `;
    });
    printDiv({
      links,
      styles,
      title: workflowMaster.requestId || memo.form.name,
      content: divContent,
    });
  };

  const onSubmitHTML = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const memoValues = Object.keys(formData).map((key) => ({
      name: key,
      value: formData[key],
    }));
    if (canEditMemo || canEditBankDetail) {
      onEditMemo(memoValues);
    } else {
      toast.warn("You cannot edit the form!");
    }
  };
  const onEditMemo = (memoValues) => {
    editMemo(
      {
        id: memo.id,
        formId: memo.form.id,
        memoValues,
      },
      (err, data) => {
        if (err) toast.error("Error!");
        else toast.success("Success!");
      }
    );
  };
  const p = props.permissions || {};
  return !isLoaded ? null : (
    <>
      {workflowMaster.id ? <WorkflowQueue workflowMaster={workflowMaster} /> : null}
      {/* <MemoTableInformation memoDetails={memoDetails} /> */}
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <Label>Name: {memo.form.name}</Label>
              <br />
              <Label>Description:</Label>
              <p>{memo.form.description}</p>
            </Col>
            <Col>
              <Button
                title="Print Report"
                onClick={() => printReport()}
                className="float-right mx-1"
                size="sm"
                color="primary"
              >
                <i className="fa fa-print text-white" />
              </Button>
              <Button
                title="View Attachments"
                onClick={() => setIsOpen(true)}
                className="float-right mx-1"
                size="sm"
                color="info"
              >
                <i className="fa fa-eye text-white" />
              </Button>
            </Col>
          </Row>
        </CardHeader>
        <CardBody id="form">
          {memo.form.type === "html" ? (
            <Form onSubmit={onSubmitHTML}>
              <HTMLFormRender
                memoValues={memo.memo_values}
                isEdit={canEditMemo}
                isEditBank={canEditBankDetail}
                formData={memo.form ? memo.form.formData : []}
              />
              {canEditMemo || canEditBankDetail ? (
                <Button size="sm" color="success">
                  Submit
                </Button>
              ) : null}
            </Form>
          ) : null}
          {memo.form.type === "dynamic" ? (
            <FormBuilder.ReactFormGenerator
              onSubmit={onEditMemo}
              answer_data={
                memo.memo_values
                  ? memo.memo_values.map((memVal) => ({
                      id: memVal.id,
                      name: memVal.name,
                      value: JSON.parse(memVal.value),
                    }))
                  : []
              }
              data={JSON.parse(memo.form.formData || "{}")}
              read_only={!(canEditMemo || canEditBankDetail)}
              hide_actions={!(canEditMemo || canEditBankDetail)}
            />
          ) : null}
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <PreviewAttachments attachments={memo.attachments || []} permissions={p} />
      </Modal>
      <AttachmentListTable
        isPrimary
        attachments={memo.attachments || []}
        permissions={p}
        memoId={memo.id}
        loadMemo={getData}
      />
      {workflowMaster.id ? (
        <>
          <WorkflowLog workflowLogs={workflowMaster.workflow_logs} />
          <WorkflowAction workflowMaster={workflowMaster} getData={getData} />
        </>
      ) : (
        <Button
          size="lg"
          color="success"
          onClick={() => {
            const data = { memoId };
            startWorkflow(data, (err, json) => {
              if (err) {
                toast.warn("Oops! Something went wrong");
              } else {
                toast.success("Successful");
                getData();
              }
            });
          }}
        >
          Start Workflow
        </Button>
      )}
    </>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(MemoView);
