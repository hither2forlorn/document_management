import React from "react";
import { editLocationType, getLocationType } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import A from "config/url";
import { Button } from "reactstrap";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardHeader, CardBody, Form, Label, Input, FormGroup, Row, Col, CardFooter } from "reactstrap";
import titleCase from "utils/textCapital";

class EditLocationType extends React.Component {
  state = {
    locationTypeData: {},
  };

  onChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const data = this.state.locationTypeData;
    data[event.target.name] = event.target.value;
    if (name == "name") {
      value = titleCase(value);
    }
    this.setState({
      locationTypeData: { ...this.state.locationTypeData, [name]: value },
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    editLocationType(this.state.locationTypeData, (err, data) => {
      if (err) {
        toast.error(err.response.data.data.name[0]);
      }
      if (data.success) {
        toast.success("Success!");
        this.props.history.push(metaRoutes.adminLocationTypes);
        this.props.dispatch(loadAllFields());
      } else {
        toast.warn(data.message);
      }
    });
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getLocationType(id, (err, data) => {
      if (err) {
        this.props.history.push(metaRoutes.adminLocationTypes);
        return;
      }
      this.setState({
        locationTypeData: data,
      });
    });
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Location Type</p>
        </CardHeader>
        <Form onSubmit={this.onSubmit}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Name</Label>
                </Col>
                <Col md={8}>
                  {" "}
                  <Input
                    className="rounded"
                    name="name"
                    id="name"
                    value={this.state.locationTypeData.name ? this.state.locationTypeData.name : ""}
                    required
                    onChange={this.onChange}
                  />
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            {" "}
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <Button color="primary">Submit</Button>
          </CardFooter>
        </Form>
      </Card>
    );
  }
}

export default connect()(EditLocationType);
