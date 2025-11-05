import React, { useState, useEffect } from "react";
import { Card, CardFooter, CardBody, CardHeader, Label, Form, Button } from "reactstrap";
import FormBuilder from "gentech-form-builder";
import { toast } from "react-toastify";
import query from "querystring";
import { getFormData } from "../../../config/form";
import HTMLFormRender from "./components/HTMLFormRender";
import { getForm } from "./api/form";
import { addMemo } from "./api/memo";
import metaRoutes from "../../meta_routes";
import { CLIENT_USER } from "../../../config/values";
import OTPForm from "../../components/OTPForm";
import { connect } from "react-redux";

const MemoNew = (props) => {
  const qs = query.parse(props.location.search);
  const formTag = qs["?i"];
  const [form, setForm] = useState({});
  const [formData, setFormData] = useState([]);
  const [isMounted, setMounted] = useState(false);
  useEffect(() => {
    if (!formTag) {
      props.history.push(metaRoutes.clientDashboard);
    } else {
      getForm(formTag).then((form) => {
        setMounted(true);
        setForm({ ...form });
        switch (form.type) {
          case "html":
            setFormData(form.formData);
            break;
          case "dynamic":
            setFormData(JSON.parse(form.formData));
            break;
          default:
            toast.warn("Error occurred!");
            break;
        }
      });
    }
  }, []); //eslint-disable-line
  const submitFormHTML = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const memoValues = Object.keys(formData).map((key) => ({
      name: key,
      value: formData[key],
    }));
    const memo = {
      formId: form.id,
      workflowId: form.workflowId,
      memoValues: memoValues,
    };
    submitForm(memo);
  };
  const submitFormBuilder = (data) => {
    const memoValues = data;
    const memo = {
      formId: form.id,
      workflowId: form.workflowId,
      memoValues: memoValues,
    };
    submitForm(memo);
  };
  const submitForm = (memo) => {
    if (!props.otpAuth.isVerified) {
      toast.info("Verify Otp before proceeding");
      return;
    }
    addMemo(memo, (err, json) => {
      if (err) toast.error("Error!");
      else {
        toast.success("Success! Request have been generated");
      }
      props.history.push(metaRoutes.clientDashboard);
    });
  };
  return !isMounted ? null : (
    <Card>
      <CardHeader>
        <Label>Name: {form.name}</Label>
        <br />
        <Label>Description:</Label>
        <p>{form.description}</p>
      </CardHeader>
      <CardBody>
        {form.type === "html" ? (
          <Form onSubmit={submitFormHTML}>
            <HTMLFormRender type={CLIENT_USER} formData={formData} />
            {props.otpAuth.isVerified ? (
              <Button type="submit" size="sm" color="info" className="text-white">
                <i className="fa fa-save" /> Save as draft
              </Button>
            ) : null}
          </Form>
        ) : null}
        {form.type === "dynamic" ? (
          <FormBuilder.ReactFormGenerator
            onSubmit={submitFormBuilder}
            answer_data={[]}
            action_name="Save as Draft"
            data={formData}
            hide_actions={!props.otpAuth.isVerified}
          />
        ) : null}
      </CardBody>
      {!props.otpAuth.isVerified ? (
        <CardFooter>
          <OTPForm />
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default connect((state) => ({
  otpAuth: state.otpAuth,
}))(MemoNew);
