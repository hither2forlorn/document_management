import React from "react";
import { getBranch, editBranch, getDistricts } from "./api";
import A from "config/url";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import { Card, CardHeader, CardBody, CardFooter, Row, Col, Label, Input } from "reactstrap";
import { CustomInput, CustomSelect } from "admin/components";
import { banks, excludeThisVendor, onlyForThisVendor } from "config/bank";
import { connect } from "react-redux";
import titleCase from "utils/textCapital";

class EditBranch extends React.Component {
  state = {
    branch: {},
    districts: [],
  };

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    A.getId(this.props.match.params.id);
    getBranch(id, (err, data) => {
      if (err) return;
      if (data.success) {
        this.setState(
          {
            branch: data.data,
          },
          () => {
            console.log("edit branch details: ", this.state.hierarchy);
          }
        );
      }
    });
    this.updateData();
  }

  handleChange = (event) => {
    const name = event.target.name;
    let value = event.target.value;
    const doc = this.state.branch;
    doc[event.target.name] = event.target.value;
    if (name == "name") {
      value = titleCase(value);
    }
    this.setState({
      branch: { ...this.state.branch, [name]: value },
    });
    if (value.length >= 3 && onlyForThisVendor(banks.citizen.name)) {
      return toast.error("Branch Code can only be 3 digits");
    }
  };

  parseBranchLogo(callback) {
    var filesSelected = document.getElementById("branchLogo").files;
    if (filesSelected.length > 0) {
      var fileToLoad = filesSelected[0];
      var fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        var srcData = fileLoadedEvent.target.result;
        callback(srcData);
      };
      fileReader.readAsDataURL(fileToLoad);
    } else {
      callback("NULL");
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }
    const emailInput = form.mailId;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@epf\.org\.np$/;
    if (!emailPattern.test(emailInput.value)) {
      toast.error("Please enter a valid email address with @epf.org.np domain");
      return;
    }
    if (window.confirm("Do you want to update the branch?")) {
      this.parseBranchLogo((logo) => {
        if (logo) {
          const branch = this.state.branch;
          branch.branchLogo = logo;
          this.setState({
            branch: branch,
          });
        }
        editBranch(this.state.branch, (err, data) => {
          if (err) {
            toast.error(err.response.data.message);
            return;
          }
          if (data.success) {
            toast.success(data.message);
          }
          this.props.history.push(metaRoutes.adminBranches);
        });
      });
    }
  };

  updateData() {
    getDistricts((err, data) => {
      if (err) return;
      if (data.success) {
        this.setState({
          districts: data.data,
        });
      }
    });
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Edit Branch</p>
        </CardHeader>
        <form onSubmit={this.handleSubmit}>
          <CardBody>
            {/* <label className="col-sm-4">Name:</label>
            <input
              value={this.state.branch.name ? this.state.branch.name : ""}
              onChange={this.handleChange}
              className="col-sm-8"
              name="name"
              id="name"
              required
            /> */}
            <Row>
              <Col md={3}>
                <CustomInput
                  required
                  object={this.state.branch}
                  isEdit={true}
                  label="Name:"
                  name="name"
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <CustomInput
                  required
                  object={this.state.branch}
                  isEdit={true}
                  label="Address:"
                  name="street"
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <CustomSelect
                  object={this.state.branch}
                  isEdit={true}
                  label="District:"
                  options={this.props.districts}
                  name="city"
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <CustomInput
                  required
                  object={this.state.branch}
                  isEdit={true}
                  label="Branch Code:"
                  name="branchCode"
                  maxLength={onlyForThisVendor(banks.citizen.name) ? 3 : null}
                  onChange={this.handleChange}
                />
              </Col>
              {excludeThisVendor([banks.rbb.name, banks.citizen.name, banks.epf.name]) && (
                <Col md={3}>
                  <CustomInput
                    required
                    object={this.state.branch}
                    isEdit={true}
                    label="SOL branch id:"
                    name="branchNumber"
                    onChange={this.handleChange}
                  />
                </Col>
              )}
              {/* <Col md={3}>
                <CustomInput
                  required
                  object={this.state.branch}
                  isEdit={true}
                  label="Province:"
                  name="province"
                  onChange={this.handleChange}
                />
              </Col> */}
              <Col md={3}>
                <CustomSelect
                  object={this.state.branch}
                  isEdit={true}
                  label="Province:"
                  name="province"
                  options={this.props.provinces}
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <CustomInput
                  required
                  disabled
                  object={this.state.branch}
                  isEdit={true}
                  label="Country:"
                  name="country"
                  onChange={this.handleChange}
                />
              </Col>
              {/* <Col md={3}>
                <CustomInput
                  object={this.state.branch}
                  isEdit={true}
                  label="Postal Code:"
                  name="postalCode"
                  onChange={this.handleChange}
                />
              </Col> */}
              <Col md={3}>
                <CustomInput
                  object={this.state.branch}
                  isEdit={true}
                  label="Contact:"
                  name="phoneNumber"
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <CustomInput
                  object={this.state.branch}
                  isEdit={true}
                  label="Mail Id:"
                  name="mailId"
                  onChange={this.handleChange}
                />
              </Col>
              <Col md={3}>
                <Label>Branch Logo: </Label>
                <Input type="file" name="branchLogo" id="branchLogo" />
              </Col>
              {/* {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
                <Col md={3}>
                  <CustomSelect
                    required
                    object={this.state.hierarchy}
                    isEdit={true}
                    label="Security Hierarchy"
                    name="hierarchy"
                    options={this.props.hierarchy}
                  />
                </Col>
              )} */}
            </Row>

            {/* <label className="col-sm-4">Street: </label>
            <input
              value={this.state.branch.street ? this.state.branch.street : ""}
              onChange={this.handleChange}
              className="col-sm-8"
              name="street"
              id="street"
            />

            <label className="col-sm-4">City: </label>
            <input
              value={this.state.branch.city ? this.state.branch.city : ""}
              onChange={this.handleChange}
              className="col-sm-8"
              name="city"
              id="city"
            />

            <label className="col-sm-4">Country: </label>
            <input
              value={this.state.branch.country ? this.state.branch.country : ""}
              onChange={this.handleChange}
              className="col-sm-8"
              name="country"
              id="country"
            />

            <label className="col-sm-4">Postal Code: </label>
            <input
              value={
                this.state.branch.postalCode ? this.state.branch.postalCode : ""
              }
              onChange={this.handleChange}
              className="col-sm-8"
              name="postalCode"
              id="postalCode"
            />

            <label className="col-sm-4">Phone: </label>
            <input
              value={
                this.state.branch.phoneNumber
                  ? this.state.branch.phoneNumber
                  : ""
              }
              onChange={this.handleChange}
              className="col-sm-8"
              name="phoneNumber"
              id="phoneNumber"
            />

            <label className="col-sm-4">Website: </label>
            <input
              value={this.state.branch.website ? this.state.branch.website : ""}
              onChange={this.handleChange}
              className="col-sm-8"
              name="website"
              id="website"
            /> */}
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Update
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }
}

export default connect((state) => ({ ...state.allFields }))(EditBranch);
