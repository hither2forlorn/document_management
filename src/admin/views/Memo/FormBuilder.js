import React, { useState, useEffect } from "react";
import { Card, CardFooter, CardBody, Button, CardHeader, Input, FormGroup, Label, Row, Col } from "reactstrap";
import FormBuilder from "gentech-form-builder";
import { editForm, getForm } from "./api/form";
import toolbarItems from "./components/toolbarItems";
import A from "config/url";
import { toast } from "react-toastify";
import query from "querystring";
import { WorkflowBuilder } from "../Workflow";
import { connect } from "react-redux";
import HTMLFormRender from "./components/HTMLFormRender";
import metaRoutes from "config/meta_routes";

const MyFormBuilder = (props) => {
  const qs = query.parse(props.location.search);
  const formId = A.getId(qs["?i"]);
  const [loading, setLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [form, setForm] = useState({});
  const [formData, setFormData] = useState([]);
  useEffect(() => {
    getForm(formId).then((form) => {
      setForm({ ...form });
      setFormData(form.formData);
      setLoading(false);
    });
  }, []); //eslint-disable-line
  const onLoad = async () => {
    setFormData(JSON.parse(formData));
    return JSON.parse(formData);
  };
  const onPost = (data) => {
    setFormData(data.task_data);
  };
  const submitForm = () => {
    const finalForm = () => {
      switch (form.type) {
        case "html":
          return {
            ...form,
            formData,
          };
        case "dynamic":
          return {
            ...form,
            formData: JSON.stringify(formData),
          };
        default:
          return form;
      }
    };
    editForm(finalForm(), (err, json) => {
      if (err) toast.error("Error!");
      else toast.success("Success");
    });
  };
  if (!formId) {
    props.history.push(metaRoutes.formList);
    return null;
  } else {
    return (
      <>
        <Card className="shadow">
          <CardHeader>
            <FormGroup>
              <Label>Name</Label>
              <Input
                className="rounded"
                onChange={({ target: { value } }) => {
                  setForm({
                    ...form,
                    name: value,
                  });
                }}
                value={form.name || ""}
                type="text"
                name="name"
                placeholder="Name"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                className="rounded"
                onChange={({ target: { value } }) => {
                  setForm({
                    ...form,
                    description: value,
                  });
                }}
                value={form.description || ""}
                type="textarea"
                name="description"
                placeholder="Description"
                required
              />
            </FormGroup>
            {hasUser ? (
              <>
                <FormGroup check>
                  <Label check>
                    <Input
                      className="rounded"
                      onChange={({ target: { checked } }) => {
                        setForm({
                          ...form,
                          isActive: checked,
                        });
                      }}
                      checked={form.isActive || false}
                      type="checkbox"
                      name="isActive"
                      required
                    />
                    Active
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      className="rounded"
                      onChange={({ target: { checked } }) => {
                        setForm({
                          ...form,
                          form_detail: {
                            ...form.form_detail,
                            isForCustomer: checked,
                          },
                        });
                      }}
                      checked={(form.form_detail && form.form_detail.isForCustomer) || false}
                      type="checkbox"
                      required
                    />
                    <span>
                      Check the box to make this form available to the customer. (<strong> WARNING </strong>)
                    </span>
                  </Label>
                </FormGroup>
              </>
            ) : (
              <span className="alert alert-warning">You cannot activate the form without adding users to the workflow</span>
            )}
          </CardHeader>
          {loading ? (
            <CardBody>
              <h1 className="blink_me">Loading ...</h1>
            </CardBody>
          ) : (
            <CardBody>
              {form.type === "html" ? (
                <Row>
                  <Col>
                    <Input
                      style={{ minHeight: 400 }}
                      type="textarea"
                      value={formData}
                      onChange={({ target: { value } }) => {
                        setFormData(value);
                      }}
                    />
                  </Col>
                  <Col>
                    <HTMLFormRender formData={formData} />
                  </Col>
                </Row>
              ) : null}
              {form.type === "dynamic" ? (
                <FormBuilder.ReactFormBuilder toolbarItems={toolbarItems} onLoad={onLoad} onPost={onPost} />
              ) : null}
            </CardBody>
          )}
          <CardFooter className="d-flex justify-content-end">
            <Button onClick={() => window.history.back()} type="button" size="sm" color="info" className="mx-2 text-white">
              Cancel
            </Button>
            <Button onClick={submitForm} size="sm" color="success">
              Submit
            </Button>
          </CardFooter>
        </Card>
        <WorkflowBuilder setHasUser={setHasUser} workflowId={form.workflowId} users={props.users} />
      </>
    );
  }
};

export default connect((state) => ({
  users: state.allFields.users,
}))(MyFormBuilder);
