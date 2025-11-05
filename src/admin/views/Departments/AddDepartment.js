import React from "react";
import { addDepartment, getDepartments } from "./api";
import { getFormData } from "config/form";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import CustomLoading from "admin/components/CustomLoading";
import titleCase from "utils/textCapital";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";
import DepartmentBranchSelect from "./Component/DepartmentBranchSelect";
import { getSecurityHierarchy, getSecurityHierarchyBranches } from "../SecurityHierarchy/api";

class AddDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectedBranchesChange = this.handleSelectedBranchesChange.bind(this);
  }

  state = {
    departments: [],
    color: "#ffffff",
    isDisabled: false,
    capitalName: "",
    securityHierarchyBranches: [],
    selectedBranches: [],
    parentList: [],
    hierarchy: []
  };

  componentDidMount() {
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
    getSecurityHierarchy((err, hierarchy) => {
      const securityHierarchy = hierarchy?.filter((h) => !h.code.includes("Branch"))
      if (err) return;
      this.setState({
        hierarchy: securityHierarchy
      })
    })
  }

  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "colorCode") {
      this.setState({
        color: value,
      });
    }
  };

  // Update selected branches when changed in DepartmentBranchSelect
  handleSelectedBranchesChange = (selectedOption) => {
    this.state.selectedBranches = selectedOption // Update state with selected options
  };
  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    // if (this.state.selectedBranches.length === 0) return toast.error("Branches should be selected for department");
    const formDataWithBranchId = { hierarchyId: this?.state?.selectedBranches?.map((branch) => branch.id || []), ...formData };
    const parent = this.state.hierarchy.filter((item) => {
      if (item.id === Number(formDataWithBranchId.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      formDataWithBranchId.level = parent.level;
    } else {
      formDataWithBranchId.level = 0;
    }
    addDepartment(formDataWithBranchId, (err, data) => {
      if (err) {
        console.log(err.data, data);
        toast.error(err.response.data.message);
      } else {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminDepartments);
        this.props.dispatch(loadAllFields());
        this.setState({ isDisabled: true });
      }
    });
  };



  renderItems() {

    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              {" "}
              <i className="fa fa-cogs mr-1" />
              Add Department
            </Col>
          </Row>
        </CardHeader>
        <Form onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  {" "}
                  <Label>Name</Label>
                </Col>
                <Col md={8}>
                  <Input
                    onInput={(e) => preventWhitespaceAtFirst(e.target)}
                    required
                    name="name"
                    id="name"
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Security Hierarchy Parent Category</Label>
                </Col>
                <Col md={8}>
                  <Input type="select" name="parentId" id="parentId">
                    <option value="">--- NONE ---</option>
                    {this.state.hierarchy.map((row) => {
                      let padding = "";
                      // let parentDepartment = row.type === "department" ? row.parentId : row.id;
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
              </Row>
            </FormGroup>
            {/* <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Department Parent Category</Label>
                </Col>
                <Col md={8}>
                  <Input type="select" name="departmentParentId" id="departmentParentId">
                    <option value="">--- NONE ---</option>
                    {this.state.parentList && this.state.parentList.length > 0 ? (
                      this.state.parentList.map((row) => {
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
                      })
                    ) : (
                      <option value="">---NONE---</option>
                    )}
                  </Input>
                </Col>
              </Row>
            </FormGroup> */}
            <FormGroup>
              <Row className="align-items-center">
                <Col md={4}>
                  <Label>Branches</Label>
                </Col>
                <Col md={8}>
                  <DepartmentBranchSelect branches={this.state.securityHierarchyBranches}
                    setSelectedValues={this.handleSelectedBranchesChange} />
                </Col>
              </Row>
            </FormGroup>
            {/* <FormGroup>
              <Row>
                <Col md={4}>
                  {" "}
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
                        background: this.state.color,
                      }}
                    />
                    <Input
                      style={{ display: "none" }}
                      type="color"
                      name="colorCode"
                      value={this.state.color}
                      id="colorCode"
                    />
                  </Label>
                </Col>
              </Row>
            </FormGroup> */}
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            {" "}
            {/* <button className="btn btn-sm btn-success" type="submit">
                Submit
              </button> */}
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={this.state.isDisabled} />
          </CardFooter>
        </Form>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(AddDepartment);
