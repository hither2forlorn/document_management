import React from "react";
import { getDocumentType, editDocumentType } from "./api";
import A from "config/url";
import { connect } from "react-redux";
import { loadAllFields } from "redux/actions/apiAction";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import query from "querystring";
import metaRoutes from "config/meta_routes";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Input, Label, Form, FormGroup } from "reactstrap";
import { banks, onlyForThisVendor } from "config/bank";
import { CustomSelect } from "admin/components";
import titleCase from "utils/textCapital";
import Required from "admin/components/Required";
import { filter_hierarchies } from "utils/arrayManipulation";
import AdminComponent from "../AdminComponent";

class EditDocumentType extends React.Component {
  state = {
    documentType: {},
    documentTypes: [],
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    this.setState(this.props.allFields);
    getDocumentType(id, (err, data) => {
      if (err) return;
      if (data.success) {
        this.setState({
          documentType: data.data,
        });
        // console.log(data.data);
      }
    });
  }

  handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const doc = this.state.documentType;
    if (event.target.name === "parentId" && Number(event.target.value) === this.state.documentType.id) {
      toast.warn("Cannot select itself as parent!");
    } else {
      value = titleCase(value);
      doc[event.target.name] = event.target.value ? event.target.value : null;
      this.setState({
        documentType: { ...this.state.documentType, [name]: value },
      });
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (window.confirm("Do you want to update the document?")) {
      const documentType = this.state.documentType;
      const parent = this.state.documentTypes?.filter((item) => {
        if (item.id === Number(documentType.parentId)) {
          return 1;
        }
        return 0;
      })[0];
      if (parent) {
        documentType.level = parent.level + 1;
      } else {
        documentType.level = 0;
      }
      editDocumentType(documentType, (err, data) => {
        if (err) {
          return toast.error(err.response.data.data.name[0]);
        }
        if (!data.success) {
          toast.warn(data.message);
        }
        if (data.success) {
          toast.success(data.message);
          this.props.history.push(metaRoutes.adminDocumentTypes);
          this.props.dispatch(loadAllFields());
        }
      });
    }
  };

  handleAssociateIdChange = (e) => {
    this.setState({
      documentType: {
        ...this.state.documentType,
        isAssociatedIDReq: e.currentTarget.value,
      },
    });
  };

  render() {
    const hierarchies = this.props.allFields.hierarchy;
    const filteredHierarchies = hierarchies?.filter((h) => h.name !== "Branch");

    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Document Type</p>
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <FormGroup>
              <Row>
                <Col md={4}>
                  <Label>Name:</Label>
                  <Required />
                </Col>
                <Col md={8}>
                  <Input
                    className="rounded"
                    onChange={this.handleChange}
                    value={this.state.documentType.name ? this.state.documentType.name : ""}
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
                  <Label>Parent Category</Label>
                </Col>
                <Col md={8}>
                  <Input
                    className="rounded"
                    type="select"
                    onChange={this.handleChange}
                    value={this.state.documentType.parentId ? this.state.documentType.parentId : ""}
                    name="parentId"
                    id="parentId"
                  >
                    <option value="">--- NONE ---</option>
                    {this.state.documentTypes?.map((row) => {
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
            {/* {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
              <CustomSelect
                required
                onChange={this.handleChange}
                defaultValueOnlyForCombobox={
                  this.state.documentType.hierarchy
                    ? this.state.documentType.hierarchy
                    : ""
                }
                label="Security Hierarchy"
                name="hierarchy"
                options={this.props.allFields.hierarchy}
              />
            )} */}
            {onlyForThisVendor(banks.bok.name) && (
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Associate ID</Label>
                  </Col>
                  <Col md={8}>
                    <Input
                      className="rounded"
                      type="select"
                      onChange={this.handleAssociateIdChange}
                      value={
                        this.state.documentType.isAssociatedIDReq != null ? this.state.documentType.isAssociatedIDReq : ""
                      }
                      name="associateId"
                      id="associateId"
                    >
                      <option value="">--- NONE ---</option>
                      <option value={true}>Required</option>
                      <option value={false}>Optional</option>
                    </Input>
                  </Col>
                </Row>
              </FormGroup>
            )}

            {/* Admin component */}
            <AdminComponent>
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Hierarchy</Label>
                    {/* <Required /> */}
                  </Col>
                  <Col md={8}>
                    <CustomSelect
                      // required
                      onChange={this.handleChange}
                      defaultValueOnlyForCombobox={
                        this.state.documentType.hierarchy ? this.state.documentType.hierarchy : ""
                      }
                      // label="Security Hierarchy"
                      name="hierarchy"
                      options={filteredHierarchies}
                    />
                  </Col>
                </Row>
              </FormGroup>
            </AdminComponent>
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

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(EditDocumentType);
