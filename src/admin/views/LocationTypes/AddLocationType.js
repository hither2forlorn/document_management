import React from "react";
import { addLocationType } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardHeader, CardBody, Form, Label, Input, FormGroup, Row, Col, CardFooter } from "reactstrap";
import titleCase from "utils/textCapital";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";

class AddLocationType extends React.Component {
  state = {
    capitalName: "",
    isDisabled: false,
  };

  onSubmit = (event) => {
    event.preventDefault();
    const element = event.target[0];
    const formData = {};
    formData[element.name] = element.value;
    addLocationType(formData, (err, data) => {
      if (err) {
        toast.error(err.response.data.data.name[0]);
      }

      if (data.success) {
        toast.success(data.message);
        this.setState({ isDisabled: true });
        this.props.history.push(metaRoutes.adminLocationTypes);
        this.props.dispatch(loadAllFields());
      } else {
        toast.warn(data.message);
      }
    });
  };

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <i className="fa fa-map-marker mr-1" />
          Add Location Type
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
                   onInput={(e) => preventWhitespaceAtFirst(e.target)}
                    className="rounded"
                    value={this.state.capitalName}
                    name="name"
                    id="name"
                    required
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

export default connect()(AddLocationType);
