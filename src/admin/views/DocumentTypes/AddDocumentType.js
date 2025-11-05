import React from "react";
import { addDocumentType } from "./api";
import { getFormData } from "config/form";
import { connect } from "react-redux";
import { loadAllFields } from "redux/actions/apiAction";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Card, CardBody, CardHeader, Row, Col, CardFooter, Input, Label, Form, FormGroup } from "reactstrap";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import { CustomSelect } from "admin/components";
import titleCase from "utils/textCapital";
import Required from "admin/components/Required";
import { filter_hierarchies } from "utils/arrayManipulation";
import AdminComponent from "../AdminComponent";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";

class AddDocumentType extends React.Component {
  state = {
    documentTypes: [],
    isDisabled: false,
    capitalName: "",
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const formData = getFormData(event);
    const parent = this?.state?.documentTypes?.filter((item) => {
      if (item.id === Number(formData.parentId)) {
        return 1;
      }
      return 0;
    })[0];
    if (parent) {
      formData["level"] = parent.level + 1;
    } else {
      formData["level"] = 0;
    }
    addDocumentType(formData, (err, data) => {
      if (err) {
        return toast.error(err.response.data.data.name[0]);
      }

      if (data.success) {
        toast.success(data.message);
        this.props.history.push(metaRoutes.adminDocumentTypes);
        this.props.dispatch(loadAllFields());
        this.setState({ isDisabled: true });
      } else {
        toast.warn(data.message);
      }
    });
  };

  componentDidMount() {
    this.setState(this.props.allFields);
  }

  render() {
    const hierarchies = this.props.allFields.hierarchy;
    const filteredHierarchies = hierarchies?.filter((h) => h.name !== "Branch");

    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <Col>
              <i className="fa fa-file mr-1" /> Add Document Type
            </Col>
          </Row>
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
                    className="rounded "
                    name="name"
                    onInput={(e) => preventWhitespaceAtFirst(e.target)}
                    id="name"
                    required
                    value={this.state.capitalName}
                    onChange={(e) => this.setState({ capitalName: titleCase(e.target.value) })}
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
                  <Input className="rounded" type="select" name="parentId" id="parentId">
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
            {includeThisFeature(dms_features.ASSOCIATED_IDS) && (
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Associate ID</Label>
                  </Col>
                  <Col md={8}>
                    <Input className="rounded" type="select" name="isAssociatedIDReq" id="isAssociatedIDReq">
                      <option value="">--- NONE ---</option>
                      <option value={true}>Required</option>
                      <option value={false}>Optional</option>
                    </Input>
                  </Col>
                </Row>
              </FormGroup>
            )}

            {/* hierarchies admin */}
            <AdminComponent>
              <FormGroup>
                <Row>
                  <Col md={4}>
                    <Label>Hierarchy</Label>
                    {/* <Required /> */}
                  </Col>
                  <Col md={8}>
                    <CustomSelect
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
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={this.state.isDisabled} />
          </CardFooter>
        </Form>
      </Card>
    );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(AddDocumentType);
