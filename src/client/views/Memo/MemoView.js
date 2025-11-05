import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Label, Modal, Button, Col, Row, Form } from "reactstrap";
import query from "querystring";
import A from "../../../config/url";
import FormBuilder from "gentech-form-builder";
import { getMemo, editMemo, submitWorkflow } from "./api/memo";
import { toast } from "react-toastify";
import AttachmentListTable from "./components/AttachmentListTable";
import PreviewAttachments from "./components/PreviewAttachments";
import HTMLFormRender from "./components/HTMLFormRender";
import metaRoutes from "../../meta_routes";
import { getFormData } from "../../../config/form";
import { connect } from "react-redux";
import { CLIENT_USER } from "../../../config/values";

const MemoView = (props) => {
  const qs = query.parse(props.location.search);
  const memoId = A.getId(qs["?i"]);
  const [memo, setMemo] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [canEditMemo, setCanEditMemo] = useState(false);
  useEffect(() => {
    if (!memoId) {
      props.history.push(metaRoutes.clientMemoList);
    } else {
      getData();
    }
  }, []); //eslint-disable-line
  const getData = () => {
    getMemo(memoId, (err, data) => {
      if (err) props.history.push(metaRoutes.clientMemoList);
      else {
        setMemo(data.memo);
        // setMemoDetails(data.memoDetails);
        if (data.memo.workflowMasterId) {
          setCanEditMemo(data.memo.workflow_master.assignedTo === data.memo.workflow_master.initiatorId);
        } else {
          setCanEditMemo(true);
        }
        setIsLoaded(true);
      }
    });
  };

  const onSubmitHTML = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const memoValues = Object.keys(formData).map((key) => ({
      name: key,
      value: formData[key],
    }));
    if (canEditMemo) {
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
      <Card>
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
                type={CLIENT_USER}
                memoValues={memo.memo_values}
                isEdit={canEditMemo}
                formData={memo.form ? memo.form.formData : []}
              />
              {canEditMemo ? (
                <Button type="submit" size="sm" className="text-white mt-2" color="info">
                  <i className="fa fa-save" /> Save as draft
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
              action_name="Save as Draft"
              read_only={!canEditMemo}
              hide_actions={!canEditMemo}
            />
          ) : null}
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <PreviewAttachments attachments={memo.attachments || []} permissions={p} isPrimary={false} />
      </Modal>
      <AttachmentListTable
        isPrimary
        attachments={memo.attachments || []}
        permissions={p}
        memoId={memo.id}
        loadMemo={getData}
      />
      {memo.workflowMasterId ? null : (
        <Button
          size="lg"
          color="success"
          onClick={() => {
            const data = { memoId };
            submitWorkflow({ data, action: "start" }, (err, json) => {
              if (err) {
                toast.warn("Oops! Something went wrong");
              } else {
                toast.success("Successful");
                getData();
              }
            });
          }}
        >
          Proceed
        </Button>
      )}
      {memo.workflow_master && memo.workflow_master.assignedTo === memo.createdBy ? (
        <Button
          size="lg"
          color="success"
          onClick={() => {
            const data = { memoId, workflowMasterId: memo.workflowMasterId };
            submitWorkflow({ data, action: "submit" }, (err, json) => {
              if (err) {
                toast.warn("Oops! Something went wrong");
              } else {
                toast.success("Successful");
                getData();
              }
            });
          }}
        >
          Proceed
        </Button>
      ) : null}
    </>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(MemoView);
