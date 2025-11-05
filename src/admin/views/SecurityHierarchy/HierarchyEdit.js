import React from "react";
import A from "config/url";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import Select from "react-select";
import { editHierarchy, getOneHierarchy, getSecurityHierarchy } from "./api";
import { ReactSelect } from "./component/reactSelect";
import { LoadingOverlay } from "@mantine/core";
import { getValue } from "config/util";

class HierarchyEdit extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = {
    hierarchy: {},
    hierarchies: this.props.allFields.hierarchy,
    childGroup: {},
    overlay: false,
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    if (!id) {
      window.location.replace(metaRoutes.adminSecurityHierarchy);
      return;
    }
    getOneHierarchy(id, (err, data) => {
      if (err) return;
      if (data.success && data.data) {
        console.log(data);
        this.setState({
          hierarchy: { ...data.data, label: data.data.name },
        });
      }
    });
  }

  handleCallback = (childData) => {
    this.setState({ childGroup: childData });
  };

  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    const hierarchiy = this.state.hierarchy;
    if (name === "parentId") {
      const parent = this.state.hierarchies.filter((item) => {
        if (item.id === Number(value)) {
          return 1;
        }
        return 0;
      })[0];
      if (parent) {
        if (parent.id === this.state.hierarchy.id) {
          toast.warn("Cannot select itself as parent!");
          return;
        }
        hierarchiy.parentId = parent.id;
        hierarchiy.level = parent.level + 1;
      } else {
        hierarchiy.parentId = null;
        hierarchiy.level = 0;
      }
    } else {
      hierarchiy[name] = value;
    }
    this.setState({
      hierarchiy: hierarchiy,
    });
  };

  handleSubmit = (e) => {
    this.setState({ overlay: true });
    e.preventDefault();
    editHierarchy({ hierarchy: this.state.hierarchy, multipleHierarchy: this.state.childGroup }, (err, data) => {
      if (err) {
        toast.error("Error!");
      }
      toast.success(data.message);
      this.setState({ overlay: false });
      this.props.history.push(metaRoutes.adminSecurityHierarchy);
      this.props.dispatch(loadAllFields());
    });
  };

  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <i className="fas fa-sitemap mr-1" />
              Edit Hierarchy
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <LoadingOverlay visible={this.state.overlay} />
          <CardBody>
            {/* <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Branch</Label>
                </Col>
                <Col md={8}>
                  <Select
                    isMulti
                    onChange={this.handleChange}
                    value={this.state.hierarchy ? this.state.hierarchy : ""}
                    name="userAccess"
                    options={this.state.branchSelect}
                    className="basic-multi-select react-select-style"
                    classNamePrefix="select"
                    isDisabled={true}
                  />
                </Col>
              </Row>
            </FormGroup> */}

            {this.state.hierarchy.type == "unit" && (
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Department</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      name="Department"
                      disabled
                      id="Department"
                      value={getValue(this.props?.allFields?.hierarchy, this.state?.hierarchy?.departmentId)}
                    />
                  </Col>
                </Row>
              </FormGroup>
            )}


            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Name</Label>
                </Col>
                <Col md={8}>
                  <Input
                    name="name"
                    id="name"
                    onChange={this.handleChange}
                    value={this.state.hierarchy.name ? this.state.hierarchy.name : ""}
                  />
                </Col>
              </Row>
            </FormGroup>

            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Parent Group</Label>
                </Col>
                <Col md={8}>
                  <Input
                    type="select"
                    onChange={this.handleChange}
                    name="parentId"
                    id="parentId"
                    value={this.state.hierarchy.parentId ? this.state.hierarchy.parentId : ""}
                  >
                    <option value="">--- NONE ---</option>
                    {this.state.hierarchies?.map((row) => {
                      let padding = "";
                      let level = row.level;
                      while (level-- > 0) {
                        padding += "---";
                      }
                      return (
                        <option key={row.id} value={row.id}>
                          {padding + " " + row.name}
                        </option>
                      );
                    })}
                  </Input>
                </Col>
              </Row>
            </FormGroup>

            {/* <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Multiple Hierarchy</Label>
                </Col>
                <Col md={8}>
                  <ReactSelect
                    props={this.props}
                    parentCallback={this.handleCallback}
                    hierarchies={this.state.hierarchies} // all hierarchies
                    hierarchy={this.state.hierarchy} // current hierarchy result
                  />
                </Col>
              </Row>
            </FormGroup> */}
            <>
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Code</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      name="code"
                      disabled
                      id="code"
                      value={this.state.hierarchy.code ? this.state.hierarchy.code : ""}
                    />
                  </Col>
                </Row>
              </FormGroup>
            </>
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

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(HierarchyEdit);
