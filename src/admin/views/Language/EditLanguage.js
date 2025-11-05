import React from "react";
import { getLanguage, editLanguage } from "./api";
import { toast } from "react-toastify";
import { loadAllFields } from "redux/actions/apiAction";
import { Button } from "reactstrap";
import A from "config/url";
import { connect } from "react-redux";
import query from "querystring";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, CardBody, Form, Label, Input, FormGroup, Row, Col, CardFooter } from "reactstrap";
import titleCase from "utils/textCapital";

class EditLanguage extends React.Component {
  state = {
    language: {},
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getLanguage(id, (err, data) => {
      if (err) return;
      if (data.success) {
        this.setState({
          language: data.data,
        });
      }
    });
  }

  handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;

    if (name == "name") {
      value = titleCase(value);
    }
    this.setState({
      language: { ...this.state.language, [name]: value },
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    editLanguage(this.state.language, (err, data) => {
      if (err) {
        toast.success("Error");
        return;
      }
      if (data.success) {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminLanguages);
        this.props.dispatch(loadAllFields());
      }
    });
  };

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Language</p>
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
                    onChange={this.handleChange}
                    value={this.state.language.name ? this.state.language.name : ""}
                    className="rounded"
                    name="name"
                    id="name"
                    required
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Code:</Label>
                </Col>
                <Col md={8}>
                  <Input
                    onChange={this.handleChange}
                    value={this.state.language.code ? this.state.language.code : ""}
                    className="rounded"
                    name="code"
                    id="code"
                  />
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <Button color="primary">Update</Button>
          </CardFooter>
        </Form>
      </Card>
    );
  }
}

export default connect()(EditLanguage);
