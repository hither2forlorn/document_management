import React from "react";
import { getFormData } from "config/form";
import { addLanguage } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardHeader, CardBody, Form, Label, Input, FormGroup, Row, Col, CardFooter } from "reactstrap";
import titleCase from "utils/textCapital";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";

class AddLanguage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      capitalName: "",
      validationErrors: null,
      isDisabled: false,
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    addLanguage(formData, (err, data) => {
      if (err) {
        this.setState({
          validationErrors: err.response.data.data,
        });
        console.log(this.state.validationErrors);
        toast.error(err.response.data.message);
        return;
      }
      if (data.success) {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminLanguages);
        this.props.dispatch(loadAllFields());
        this.setState({ isDisabled: true });
      }
    });
  };

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Add Language</p>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Name:</Label>
                </Col>
                <Col md={8}>
                  <Input
                    className="rounded"
                    name="name"
                    onInput={(e) => preventWhitespaceAtFirst(e.target)}
                    id="name"
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
                  />
                  {
                    (console.log("what", this.state.validationErrors),
                    this.state.validationErrors ? (
                      <span className="text text-danger">{this.state?.validationErrors?.name[0]}</span>
                    ) : null)
                  }
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Code: </Label>
                </Col>
                <Col md={8}>
                  <Input className="rounded" name="code" id="code" />
                  {
                    (console.log("what", this.state.validationErrors),
                    this.state.validationErrors ? (
                      <span className="text text-danger">{this.state?.validationErrors?.name[0]}</span>
                    ) : null)
                  }
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

export default connect()(AddLanguage);
