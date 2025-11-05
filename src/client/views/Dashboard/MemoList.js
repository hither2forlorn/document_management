import React, { useState, useEffect } from "react";
import { Container, Card, CardHeader, CardBody, CardFooter, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { getForms } from "../Memo/api/form";
import metaRoutes from "../../../config/meta_routes";

const MemoForm = (props) => {
  const [forms, setForms] = useState([]);
  useEffect(() => {
    getForms((err, data) => {
      if (err) return;
      else setForms(data);
    });
  }, []);
  return (
    <Container className="my-4">
      <Row>
        {forms.map((form) => (
          <Col md={4} sm={6} xs={12} key={form.id}>
            <Card>
              <CardHeader>{form.name}</CardHeader>
              <CardBody>{form.description}</CardBody>
              <CardFooter>
                <Link to={metaRoutes.clientMemoNew + "?i=" + form.tag} className="btn btn-sm btn-info text-white">
                  <strong>Request Form</strong>
                </Link>
              </CardFooter>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MemoForm;
