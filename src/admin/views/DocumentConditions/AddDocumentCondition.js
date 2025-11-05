import React from "react";
import { addDocumentCondition } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { getFormData } from "config/form";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import CustomSubmit from "admin/components/CustomSubmit";
import CustomCancel from "admin/components/CustomCancel";
import { Card, CardBody, CardHeader, Row, Col, Form, FormGroup, Label, Input, CardFooter } from "reactstrap";
import titleCase from "utils/textCapital";

class AddDocumentCondition extends React.Component {
  state = {
    capitalName: "",
    isDisabled: false,
  };

  onSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    addDocumentCondition(formData, (err, data) => {
      if (err) {
        toast.error(err.response.data.message);
        return;
      }
      toast.success(data.message);
      this.props.history.push(metaRoutes.adminDocumentConditions);
      this.props.dispatch(loadAllFields());
      this.setState({ isDisabled: true });
    });
  };

  throwError = () => {};

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Add Document Condition</p>
        </CardHeader>
        <Form onSubmit={this.onSubmit}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Name</Label>
                </Col>
                <Col md={8}>
                  <Input
                    className="rounded"
                    name="name"
                    id="name"
                    required
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
                  />
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={this.state.isDisabled} />
          </CardFooter>
        </Form>
      </Card>
    );
  }
}

export default connect()(AddDocumentCondition);
