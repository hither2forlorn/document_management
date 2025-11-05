import React, { useState, useEffect } from "react";
import { Card, CardFooter, CardBody, CardHeader, Label, Form, Button } from "reactstrap";
import FormBuilder from "gentech-form-builder";
import { getForm } from "./api/form";
import { getFormData } from "config/form";
import { ADMIN_USER } from "config/values";
import { addMemo } from "./api/memo";
import A from "config/url";
import { toast } from "react-toastify";
import query from "querystring";
import HTMLFormRender from "./components/HTMLFormRender";
import metaRoutes from "config/meta_routes";

const MemoNew = (props) => {
  const qs = query.parse(props.location.search);
  const formIdOrTag = qs.tag || A.getId(qs["?i"]);
  const [form, setForm] = useState({});
  const [formData, setFormData] = useState([]);
  const [isMounted, setMounted] = useState(false);
  useEffect(() => {
    if (!formIdOrTag) {
      props.history.push(metaRoutes.formList);
    } else {
      getForm(formIdOrTag).then((form) => {
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
    addMemo(memo, (err, json) => {
      if (err) toast.error("Error!");
      else {
        toast.success("Success! Request have been generated");
      }
      props.history.push(metaRoutes.adminDashboard);
    });
  };
  return !isMounted ? null : (
    <Card className="shadow">
      <CardHeader>
        <Label>Name: {form.name}</Label>
        <br />
        <Label>Description:</Label>
        <p>{form.description}</p>
      </CardHeader>
      <CardBody>
        {form.type === "html" ? (
          <Form onSubmit={submitFormHTML}>
            <HTMLFormRender type={ADMIN_USER} formData={formData} />
            <Button type="submit" size="sm" color="success">
              Submit
            </Button>
          </Form>
        ) : null}
        {form.type === "dynamic" ? (
          <FormBuilder.ReactFormGenerator onSubmit={submitFormBuilder} answer_data={[]} data={formData} />
        ) : null}
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default MemoNew;
