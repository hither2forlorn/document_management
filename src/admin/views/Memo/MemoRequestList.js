import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Row, Col } from "reactstrap";
import { getForms } from "./api/form";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const MemoRequestList = (props) => {
  const [forms, setForms] = useState([]);
  useEffect(() => {
    getData();
  }, []); //eslint-disable-line

  const getData = () => {
    getForms((err, data) => {
      if (err) toast.error("Error!");
      else setForms(data);
    });
  };
  return (
    <Row>
      {forms.map((form) =>
        form.isActive ? (
          <Col md={4} sm={6} key={form.id}>
            <Card className="shadow">
              <CardHeader>{form.name}</CardHeader>
              <CardBody className="pb-2" style={{ height: 100, overflow: "hidden" }}>
                {form.description}
              </CardBody>
              <CardFooter>
                {form.isActive ? (
                  <Link
                    title="View"
                    to={metaRoutes.memoNew + "?i=" + A.getHash(form.id)}
                    className="float-right mx-1 btn btn-sm btn-success"
                  >
                    Request Form <i className="fa fa-upload text-white" />
                  </Link>
                ) : null}
              </CardFooter>
            </Card>
          </Col>
        ) : null
      )}
    </Row>
  );
};

export default MemoRequestList;
