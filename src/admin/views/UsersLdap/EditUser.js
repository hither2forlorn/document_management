import React, { Component } from "react";
import { Card, CardBody, CardHeader, CardFooter, Form, Button, Col, Row, FormGroup, Input, Label } from "reactstrap";
import { editUser, getUser, loadAllFields } from "./api";
import A from "config/url";
import query from "querystring";
import Select from "react-select";
import metaRoutes from "config/meta_routes";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { CustomSelect } from "admin/components";
import { getBranches } from "../Branches/api";
class EditUser extends Component {
  state = {
    user: {},
    roles: [],
    selectedBranch: null,
    security_hierarchy: [],
    branches: [],
    departments: [],
    departmentId: null
  };

  handleBranchChange = (selectedBranch) => {
    const branchId = selectedBranch.value;
    if (branchId) {
      this.setState({ selectedBranch });
    }
  };


  // handleChange = (event) => {
  //   let { user } = this.state;
  //   const { name, value, type } = event.target;

  //   switch (name) {
  //     case "hierarchy":
  //       let departmentId = null;
  //       let branchId = null;

  //       if (value.startsWith("Dept_")) {
  //         // Extract departmentId from the hierarchy
  //         const match = value.match(/\d+$/);
  //         if (match) departmentId = match[0];

  //         // Reset branch when department changes
  //         this.setState({
  //           departmentId,   // Set departmentId from hierarchy
  //           branchId: null, // Reset branchId
  //           selectedBranch: null, // Reset selected branch
  //         });

  //         user["departmentId"] = departmentId;
  //         user["branchId"] = null; // Ensure branchId is reset when switching to Dept_
  //       } else if (value.startsWith("Branch_")) {
  //         // Extract branchId from the hierarchy
  //         const match = value.match(/\d+$/);
  //         if (match) branchId = match[0];

  //         // Reset department when branch changes
  //         this.setState({
  //           branchId, // Set branchId from hierarchy
  //           departmentId: null, // Reset departmentId
  //         });

  //         user["branchId"] = branchId;
  //         user["departmentId"] = null; // Ensure departmentId is reset when switching to Branch_
  //       }

  //       this.setState({ security_hierarchy: value });
  //       break;

  //     case "departmentId": // Selecting a department branch
  //       if (this.state.security_hierarchy.startsWith("Dept_")) {
  //         // Only update the branchId if the hierarchy is Dept_
  //         this.setState({
  //           branchId: value, // Update branchId
  //         });
  //         user["branchId"] = value;
  //       }
  //       break;
  //   }

  //   switch (type) {
  //     case "checkbox":
  //       user[name] = event.checked;
  //       break;
  //     case "textarea":
  //       user.notes = value;
  //       break;
  //     default:
  //       user[name] = value;
  //       break;
  //   }
  //   this.setState({ user });
  // };

  // handleSubmit = (e) => {
  //   e.preventDefault();
  //   const formData = { ...this.state.user };

  //   if (this.state.departmentId) {
  //     formData.departmentId = this.state.departmentId; // Keep departmentId extracted from hierarchy
  //   }

  //   if (this.state.branchId) {
  //     formData.branchId = this.state.branchId; // Update branchId
  //   }

  //   // Ensure departmentId and branchId are set correctly before submitting
  //   if (formData.hierarchy.startsWith("Dept_")) {
  //     const match = formData.hierarchy.match(/\d+$/);
  //     if (match) {
  //       formData.departmentId = match[0]; // Extract departmentId if hierarchy is Dept_
  //     }
  //   }

  //   if (formData.hierarchy.startsWith("Branch_")) {
  //     const match = formData.hierarchy.match(/\d+$/);
  //     if (match) {
  //       formData.branchId = match[0]; // Extract branchId if hierarchy is Branch_
  //     }
  //   }

  //   editUser(formData, (err, json) => {
  //     if (err) return;
  //     if (json) {
  //       this.props.history.push(metaRoutes.adminLdapUsers);
  //       toast.success("Successfully edited user details");
  //     }
  //   });
  // }; 

  handleChange = (event) => {
    let { user } = this.state;
    const { name, value, type } = event.target;

    switch (name) {
      case "hierarchy":
        let departmentId = null;
        let branchId = null;

        if (value.startsWith("Dept_")) {
          // Extract departmentId from hierarchy and reset branchId
          const match = value.match(/\d+$/);
          if (match) {
            departmentId = match[0]; // Extract departmentId
          }

          this.setState({
            departmentId,  // Set departmentId based on hierarchy
            branchId: null, // Reset branchId when Dept_ is selected
          });

          user["departmentId"] = departmentId;
          user["branchId"] = null; // Ensure branchId is null when Dept_ is selected
        } else if (value.startsWith("Branch_")) {
          // Extract branchId from hierarchy and reset departmentId
          const match = value.match(/\d+$/);
          if (match) {
            branchId = match[0]; // Extract branchId
          }

          this.setState({
            branchId,        // Set branchId based on hierarchy
            departmentId: null, // Reset departmentId when Branch_ is selected
          });

          user["branchId"] = branchId;
          user["departmentId"] = null; // Ensure departmentId is null when Branch_ is selected
        }

        this.setState({ security_hierarchy: value });
        break;

      // Other case handling if needed
    }

    switch (type) {
      case "checkbox":
        user[name] = event.checked;
        break;
      case "textarea":
        user.notes = value;
        break;
      default:
        user[name] = value;
        break;
    }

    this.setState({ user });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const formData = { ...this.state.user };
    if (formData.hierarchy.startsWith("Dept_")) {
      const match = formData.hierarchy.match(/\d+$/);
      if (match) {
        formData.departmentId = match[0];
      }
      formData.branchId = null;
    }

    if (formData.hierarchy.startsWith("Branch_")) {
      const match = formData.hierarchy.match(/\d+$/);
      if (match) {
        formData.branchId = match[0];
      }
      formData.departmentId = null;
    }
    editUser(formData, (err, json) => {
      if (err) return;
      if (json) {
        this.props.history.push(metaRoutes.adminLdapUsers);
        toast.success("Successfully edited user details");
      }
    });
  };
  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    if (!Number(id)) {
      this.props.history.push(metaRoutes.adminLdapUsers);
      return;
    }
    getBranches((err, branches) => {
      if (err) return;
      this.setState(
        {
          branches: branches.data
        }
      )
    })
    getUser(id, (err, user) => {
      if (err) return;
      const userBranch = this.state.branches?.find((b) => (b.value === user.branchId)) || null;
      const selectedHierarchy = this.props.allFields?.hierarchy?.find((h) => h.code === user.hierarchy);
      this.setState({ user: user, selectedBranch: userBranch, hierarchy: selectedHierarchy?.code || "" });
    });
  }
  render() {
    const isDepartment = this.state.user.hierarchy?.startsWith("Dept_") ? true : false;
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={12}>
            <Form onSubmit={this.handleSubmit} onChange={this.handleChange}>
              <Card className="shadow">
                <CardHeader>
                  <p className="h5">AD Users</p>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="isActive">
                          <strong>Status</strong>
                        </Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="isActive"
                          name="isActive"
                          onChange={this.handleChange}
                          placeholder="Active"
                          value={this.state.user.isActive ? this.state.user.isActive : false}
                        >
                          <option value={true}>Active</option>
                          <option value={false}>Inactive</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="email"
                          name="email"
                          placeholder="Email"
                          value={this.state.user.email ? this.state.user.email : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="Phone Number"
                          value={this.state.user.phoneNumber ? this.state.user.phoneNumber : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="username"
                          name="username"
                          placeholder="User Name"
                          value={this.state.user.username ? this.state.user.username : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          className="rounded"
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Name"
                          value={this.state.user.name ? this.state.user.name : ""}
                          readOnly
                        />
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="roleId">Role</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="roleId"
                          name="roleId"
                          required
                          value={this.state.user.roleId}
                        >
                          <option value="">Select Role for the user</option>
                          {this.props.roles?.map((role, index) => (
                            <option key={index} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col xs="4">
                      <CustomSelect
                        required
                        label="Security Hierarchy"
                        name="hierarchy"
                        options={this.props.allFields.hierarchy}
                        onChange={this.handleChange}
                        object={this.state.user}
                        value={this.state.hierarchy}
                        isEdit={true}
                      />
                    </Col>
                    {/* {isDepartment &&
                      <Col xs="4">
                        <CustomSelect
                          onChange={this.handleChange}
                          label="Department Branches"
                          name="departmentId"
                          object={this.state.user}
                          options={this.state?.branches}
                          isEdit={true}
                          value={this.state?.selectedBranch}
                        />
                      </Col>} */}
                    {/* <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="departmentId">Department</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="departmentId"
                          name="departmentId"
                          value={this.state.user.departmentId}
                        >
                          <option value="">Select Department</option>
                          {this.props.departments?.map((department, index) => {
                            let padding = "- ";
                            let level = department.level;
                            while (level-- > 0) {
                              padding += "--> ";
                            }
                            return (
                              <option key={index} value={department.id}>
                                {padding + department.name}
                              </option>
                            );
                          })}
                        </Input>
                      </FormGroup>
                    </Col> */}
                    <Col xs="4">
                      <FormGroup>
                        <Label htmlFor="loginAttempts">Login Attempts</Label>
                        <Input
                          className="rounded"
                          type="select"
                          id="loginAttempts"
                          name="loginAttempts"
                          required
                          value={this.state.user.loginAttempts}
                        >
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter className="d-flex justify-content-end">
                  <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary">
                    Update
                  </Button>
                </CardFooter>
              </Card>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default connect((state) => ({
  users: state.allFields.users,
  roles: state.allFields.roles,
  branches: state.allFields.branches,
  departments: state.allFields.departments,
  allFields: state.allFields,
}))(EditUser);
