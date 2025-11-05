import React from "react";
import { getDocumentCondition, editDocumentCondition } from "./api";
import { loadAllFields } from "redux/actions/apiAction";
import A from "config/url";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardBody, CardHeader, Row, Col, Form, FormGroup, Label, Input, CardFooter } from "reactstrap";
import { connect } from "react-redux";
import titleCase from "utils/textCapital";

class EditDocumentCondition extends React.Component {
  state = {
    documentCondition: {},
  };

  onChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const data = this.state.documentCondition;
    data[event.target.name] = event.target.value;
    if (name == "name") {
      value = titleCase(value);
    }
    this.setState({
      documentCondition: { ...this.state.documentCondition, [name]: value },
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    editDocumentCondition(this.state.documentCondition, (err, data) => {
      if (err) {
        toast.error(err.response.data.data.name[0]);
        return;
      }
      toast.success(data.message);
      this.props.history.push(metaRoutes.adminDocumentConditions);
      this.props.dispatch(loadAllFields());
    });
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getDocumentCondition(id, (err, data) => {
      if (err) {
        this.props.history.push(metaRoutes.adminDocumentConditions);
      } else {
        if (data.success) {
          this.setState({
            documentCondition: data.data,
          });
        }
      }
    });
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Document Condition</p>
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
                    value={this.state.documentCondition.name ? this.state.documentCondition.name : ""}
                    required
                    onChange={this.onChange}
                  />
                </Col>
              </Row>
            </FormGroup>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Update
            </Button>
          </CardFooter>
        </Form>
      </Card>
    );
  }
}

export default connect()(EditDocumentCondition);
