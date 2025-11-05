import React, { useState } from "react";
import { editDepartment, getDepartment, getDepartments } from "./api";
import A from "config/url";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import titleCase from "utils/textCapital";
import DepartmentBranchSelect from "./Component/DepartmentBranchSelect";
import { getSecurityHierarchy, getSecurityHierarchyBranches } from "../SecurityHierarchy/api";
import { getFormData } from "config/form";

class EditDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.branches = this.branches.bind(this);
    this.handleSelectedBranchesChange = this.handleSelectedBranchesChange.bind(this);
  }

  state = {
    department: {},
    departments: [],
    securityHierarchyBranches: [],
    selectedBranches: [],
    parentList: [],
    selectedBranchesList: [],
    hierarchy: []
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    if (!id) {
      window.location.replace(metaRoutes.adminDepartments);
      return;
    }
    getDepartment(id, (err, data) => {
      if (err) return;
      if (data.success && data.data) {
        this.setState({
          department: data.data,
          selectedBranchesList: data.data.branches.map(branch => ({
            id: branch.branchId,
            name: branch.branchName,
          })),
        });
      }
    });
    getSecurityHierarchy((err, hierarchy) => {
      const securityHierarchy = hierarchy?.filter((h) => !h.code.includes("Branch"))
      if (err) return;
      this.setState({
        hierarchy: securityHierarchy
      })
    })
    getSecurityHierarchyBranches((err, data) => {
      const branches = data?.branches?.filter((d) => d.code.includes("Branch"));
      if (err) {
        console.log(err);
        return;
      }
      if (data.success && data.branches) {
        this.setState(
          {
            securityHierarchyBranches: branches
          }
        );
      }
    });
    getDepartments((err, departments) => {
      if (err) return;
      this.setState(
        {
          parentList: departments
        }
      );
    });
    this.setState({
      ...this.props.allFields,
    });
  }
  handleSelectedBranchesChange = (selectedOption) => {
    this.setState({ selectedBranchesList: selectedOption });
  };

  handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const department = this.state.department;

    if (name === "name") {
      this.setState({
        department: { ...department, [name]: value },
      });
      return;
    }
    if (name === "parentId") {
      const hierarchy = this.state.hierarchy;
      const parent = hierarchy.find((item) => item.id === Number(value));
      if (parent) {
        if (parent.id === hierarchy.id) {
          toast.warn("Cannot select itself as parent!");
          return;
        }
        department.securityHierarchyId = parent.id;
        department.level = parent.level + 1;
      } else {
        department.securityHierarchyId = null;
        department.level = 0;
      }
    }
    this.setState({
      department: { ...department, [name]: value },
    });
  };


  handleDepartmentParentChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const department = this.state.department;
    const parent = this.state.parentList.find((item) => item.id === Number(value));

    if (parent) {
      if (parent.id === department.id) {
        toast.warn("Cannot select itself as parent!");
        return;
      } else {
        department.parentId = parent.id;
        department.level = parent.level + 1;
      }
    } else {
      department.parentId = null;
      department.level = 0;
    }
    this.setState({
      department: { ...department, [name]: value },
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    const updateData = { hierarchyId: this.state.selectedBranchesList?.map((branch) => branch.id) || [], ...formData, id: this.state.department.id }
    const parent = this.state.hierarchy.filter((item) => {
      if (item.id === Number(updateData.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      // updateData.level = parent.level + 1;
      updateData.level = parent.level;
    } else {
      updateData.level = 0;
    }
    editDepartment(updateData, (err, data) => {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.success("Edited Sucessfully.");
      }

      if (data) {
        if (data.message) {
          toast.success(data.message);
        } else {
          toast.error("Unexpected response structure.");
        }
      }

      this.props.history.push(metaRoutes.adminDepartments);
      this.props.dispatch(loadAllFields());
    });
  };
  renderItems() {
    if (!Array.isArray(this.state.departments) || (this.state.departments.success === false)) {
      return null; // Render nothing if no departments or unsuccessful fetch
    }
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              {" "}
              <i className="fas fa-sitemap mr-1" />
              Edit Department
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Name</Label>
              </Col>
              <Col md={8}>
                <Input
                  onChange={this.handleChange}
                  value={this.state.department.name ? this.state.department.name : ""}
                  required
                  name="name"
                  id="name"
                />
              </Col>
            </FormGroup>

            <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Security Hierarchy Parent Category</Label>
              </Col>
              <Col md={8}>
                {" "}
                <Input
                  type="select"
                  onChange={this.handleChange}
                  name="parentId"
                  id="parentId"
                  value={this.state.department.securityHierarchyId ? this.state.department.securityHierarchyId : ""}
                >
                  <option value="">--- NONE ---</option>
                  {this.state.hierarchy.map((row) => {
                    let padding = "";
                    let parentHierarchy = row.id;
                    let level = row.level;
                    while (level-- > 0) {
                      padding += "---";
                    }
                    return (
                      <option key={parentHierarchy} value={parentHierarchy}>
                        {padding + " " + row.name}
                      </option>
                    );
                  })}
                </Input>
              </Col>
            </FormGroup>

            {/* <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Department Parent Category</Label>
              </Col>
              <Col md={8}>
                {" "}
                <Input
                  type="select"
                  name="departmentParentId"
                  id="departmentParentId"
                  onChange={this.handleDepartmentParentChange}
                  value={this.state.department.parentId || ""}
                >
                  <option value="">--- NONE ---</option>
                  {this.state.parentList.map((row) => {
                    let padding = "";
                    let parentDepartment = row.id;
                    let level = row.level;
                    while (level-- > 0) {
                      padding += "---";
                    }
                    return (
                      <option key={parentDepartment} value={parentDepartment}>
                        {padding + " " + row.name}
                      </option>
                    );
                  })}
                </Input>
              </Col>
            </FormGroup> */}

            <FormGroup className="d-flex align-items-center">
              <Col md={4}>
                <Label>Branches</Label>
              </Col>
              <Col md={8}>
                <DepartmentBranchSelect branches={this.state.securityHierarchyBranches ? this.state.securityHierarchyBranches : []}
                  setSelectedValues={this.handleSelectedBranchesChange} selectedBranches={this.state.selectedBranchesList} />
              </Col>
            </FormGroup>
            {/* <FormGroup className="d-flex">
              <Col md={4}>
                <Label>Color</Label>
              </Col>
              <Col md={8}>
                <Label>
                  <div
                    style={{
                      alignItems: "center",
                      display: "inline-block",
                      borderRadius: "50%",
                      border: "1px solid",
                      width: 50,
                      height: 50,
                      background: this.state.department.colorCode ? this.state.department.colorCode : "",
                    }}
                  />
                  <Input
                    onChange={this.handleChange}
                    style={{ display: "none" }}
                    type="color"
                    name="colorCode"
                    id="colorCode"
                    value={this.state.department.colorCode ? this.state.department.colorCode : ""}
                  />
                </Label>
              </Col>
            </FormGroup> */}
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

export default connect((state) => ({ allFields: state.allFields }))(EditDepartment);
