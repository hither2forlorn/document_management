import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button, CardFooter, Row, Col } from "reactstrap";
import { getForms, addForm, deleteForm } from "./api/form";
import A from "config/url";
import { getFormData } from "config/form";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import AddForm from "./components/AddForm";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";

const FormList = (props) => {
  const [forms, setForms] = useState([]);
  const [isAdd, setIsAdd] = useState(false);
  useEffect(() => {
    getData();
  }, []); //eslint-disable-line

  const getData = () => {
    getForms((err, data) => {
      if (err) toast.error("Error!");
      else setForms(data);
    });
  };

  const onDeleteForm = (formId) => {
    if (window.confirm("Do you want to remove this form?")) {
      deleteForm(formId, (err, json) => {
        if (err) toast.error("Error!");
        else toast.success("Success!");
        getData();
      });
    }
  };

  const onAddForm = (e) => {
    e.preventDefault();
    const form = getFormData(e);
    addForm(form, (err, data) => {
      if (err) toast.error("Error!");
      else toast.success("Success!");
      setIsAdd(false);
      getData();
    });
  };

  const p = props.permissions || {};
  return (
    <>
      <AddForm isOpen={isAdd} onSubmit={onAddForm} close={() => setIsAdd(false)} />
      {p.form === VIEW_EDIT || p.form === VIEW_EDIT_DELETE ? (
        <Button className="m-3" size="sm" color="success" onClick={() => setIsAdd(true)}>
          Create New Form
        </Button>
      ) : null}
      <Row>
        {forms.map((form) =>
          form.isActive || p.form === VIEW_EDIT || p.form === VIEW_EDIT_DELETE ? (
            <Col md={4} sm={6} key={form.id}>
              <Card className="shadow">
                <CardHeader>
                  {form.name} {form.isActive ? null : <span className="badge badge-warning text-white">Inactive</span>}
                </CardHeader>
                <CardBody className="pb-2" style={{ height: 100, overflow: "hidden" }}>
                  {form.description}
                </CardBody>
                <CardFooter>
                  {p.form === VIEW_EDIT_DELETE ? (
                    <Button
                      title="Delete"
                      onClick={() => onDeleteForm(form.id)}
                      className="float-right mx-1"
                      size="sm"
                      color="danger"
                    >
                      <i className="fa fa-trash text-white" />
                    </Button>
                  ) : null}
                  {p.form === VIEW_EDIT || p.form === VIEW_EDIT_DELETE ? (
                    <Link
                      title="Edit"
                      to={metaRoutes.formBuilder + "?i=" + A.getHash(form.id)}
                      className="float-right mx-1 btn btn-sm btn-primary"
                    >
                      <i className="fa fa-edit text-white" />
                    </Link>
                  ) : null}
                  {form.isActive ? (
                    <Link
                      title="View"
                      to={metaRoutes.memoNew + "?i=" + A.getHash(form.id)}
                      className="float-right mx-1 btn btn-sm btn-success"
                    >
                      <i className="fa fa-upload text-white" />
                    </Link>
                  ) : null}
                </CardFooter>
              </Card>
            </Col>
          ) : null
        )}
      </Row>
    </>
  );
};

export default FormList;
