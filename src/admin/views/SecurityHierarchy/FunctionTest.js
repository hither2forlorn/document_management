import React, { useState, useEffect } from "react";
import { addSecurityHierarchy, getFilterBranch } from "./api";
import { getFormData } from "config/form";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Label, Input, FormGroup, Form } from "reactstrap";
import Select from "react-select";

function AddHierarchy(props) {
  const [state, setState] = useState({
    branches: [],
    hierarchy: [],
    branchSelect: [],
    branchSelectedOptions: [],
    filterBranch: [],
    provinceUnit: "",
    hierarchyName: "",
    departmentAndNameToggle: false,
    departments: [],
    departmentvalue: "",
  });

  useEffect(() => {
    setState(props.allFields);
    const select = [];
    const data = getFilterBranch((err, data) => {
      if (!err) {
        data.forEach((item) => {
          const value = { value: item.id, label: item.name };
          select.push(value);
        });
      }
    });
    setState(props.allFields, () => {});

    setState({ ...state, filterBranch: data, branchSelect: select });
  }, []);

  const MultiSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case "remove-value":
        break;
      case "pop-value":
        if (removedValue && removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = state.branchSelect.filter((v) => v.isFixed);
        break;
      default:
        break;
    }
    setState({ branchSelectedOptions: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let formData = getFormData(event);
    const parent = state.hierarchy.filter((item) => {
      if (item.id === Number(formData.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      formData.level = parent.level + 1;
    } else {
      formData.level = 0;
    }
    if (state.branchSelectedOptions && state.branchSelectedOptions.length > 0) {
      formData = {
        branchData: state.branchSelectedOptions,
        level: formData.level,
        parentId: formData.parentId,
      };
    }
    addSecurityHierarchy(formData, (err, data) => {
      if (err || !data.success) {
        toast.error(data?.message || "Error");
      } else {
        toast.success(data?.message || "Successful");
        props.history.push(metaRoutes.adminSecurityHierarchy);
        props.dispatch(loadAllFields());
      }
    });
  };

  const handleProvinceunitChange = (e) => {
    console.log(e.target.value);
    setState({
      ...state,
      provinceUnit: e.target.value,
      departmentAndNameToggle: false,
    });

    // checked Department then departmentAndNameToggle is true
    if (e.target.value == "Dept_") {
      setState({
        ...state,
        departmentAndNameToggle: true,
      });
    }
  };

  const handleNameChange = (e) => {
    setState({
      ...state,

      hierarchyName: e.target.value,
    });
  };

  const handleDepartmentChange = (e) => {
    setState({
      ...state,

      departmentvalue: e.target.value,
    });
  };
  return (
    <Card className="shadow">
      <CardHeader>
        <Row>
          <Col>
            <i className="fas fa-sitemap mr-1" />
            Add Security Hierarchy
          </Col>
        </Row>
      </CardHeader>
      <Form onSubmit={handleSubmit}>
        <CardBody>
          <Row>
            <Col>
              <>
                {!state?.provinceUnit || !state?.hierarchyName || !state.departmentAndNameToggle ? (
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label>Branch</Label>
                      </Col>
                      <Col md={8}>
                        <Select
                          isMulti
                          onChange={MultiSelectChange}
                          value={state.branchSelectedOptions}
                          name="userAccess"
                          options={state.branchSelect}
                          className="basic-multi-select react-select-style"
                          classNamePrefix="select"
                          // isDisabled={disabled}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                ) : null}
                <FormGroup>
                  <Row>
                    <Col md={4}>
                      <Label>Parent Group</Label>
                    </Col>
                    <Col md={8}>
                      <Input type="select" name="parentId" id="parentId">
                        <option value="">--- NONE ---</option>
                        {state.hierarchy.map((row) => {
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
                <div className="alert alert-dark" role="alert">
                  Note: While creating <b> Province or Unit </b>, Branch is not required.
                </div>{" "}
              </>
            </Col>
            <Col>
              {!state?.branchSelectedOptions?.length > 0 && (
                <>
                  <FormGroup>
                    <Row>
                      <Col md={4}>
                        <Label>Province/Unit</Label>
                      </Col>
                      <Col md={8}>
                        <Input
                          type="select"
                          name="provinceUnit"
                          required
                          id="provinceUnit"
                          onChange={handleProvinceunitChange}
                        >
                          <option value="">--- NONE ---</option>
                          <option value="Province_">Province</option>
                          <option value="Unit_">Unit</option>
                          <option value="Dept_">Department</option>
                        </Input>
                      </Col>
                    </Row>
                  </FormGroup>
                  {!state.departmentAndNameToggle ? (
                    <>
                      <FormGroup>
                        <Row>
                          <Col md={4}>
                            <Label>Name</Label>
                          </Col>
                          <Col md={8}>
                            <Input name="name" id="name" onChange={handleNameChange} />
                          </Col>
                        </Row>
                      </FormGroup>
                    </>
                  ) : null}
                </>
              )}
              {state.departmentAndNameToggle ? (
                <FormGroup>
                  <Row>
                    <Col md={4}>
                      <Label>Departments</Label>
                    </Col>
                    <Col md={8}>
                      <Input type="select" name="parentId" id="parentId" onChange={handleDepartmentChange}>
                        <option value="">--- NONE ---</option>
                        {state.departments.map((row) => {
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
              ) : null}
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Hierarchy Code</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      name="code"
                      id="code"
                      disabled
                      defaultValue={
                        state.provinceUnit + state.departmentAndNameToggle ? state.departmentvalue : state.hierarchyName
                      }
                    />
                  </Col>
                </Row>
              </FormGroup>
            </Col>
          </Row>{" "}
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          <CustomCancel onClick={() => window.history.back()} />
          <CustomSubmit />
        </CardFooter>
      </Form>
    </Card>
  );
}

export default connect((state) => ({ allFields: state.allFields }))(AddHierarchy);
