import React from "react";
import { changePassword, changePasswordWithJsonToken } from "./api";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, CardFooter, CardBody, Form, Label, FormGroup, Input } from "reactstrap";
import { toast } from "react-toastify";
import { CURRENT_USER_ID, TOKEN } from "config/values";
import { CustomInput } from "admin/components";

export default class ChangePassword extends React.Component {
  state = {
    oldPassword: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    errors: null,
  };

  handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    // const strongRegex = new RegExp(
    //   "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
    // );
    // if (strongRegex.test(e.target.value)) {
    //   this.setState({ strongPassword: true });
    // }

    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.password === this.state.confirmPassword) {
      if (this.props.token) {
        changePasswordWithJsonToken(this.state, this.props.token.jsonToken, (err, json) => {
          if (err) {
            toast.error("Failed to validate");
            console.log(err.response.data);
            this.setState({ errors: err?.response?.data?.data });
          }
          if (json?.success) {
            this.props.hanldeLoginToDashboard();
          }

          if (json?.status == "Failed") {
            this.setState({ errors: json?.data });
            toast.error(json?.message);
          }
        });
      } else {
        changePassword(this.state, (err, json) => {
          if (err) {
            toast.error("Failed to validate");
            console.log(err.response.data);
            this.setState({ errors: err?.response?.data?.data });
          }
          if (json.success) {
            this.props.history.push(metaRoutes.adminDashboard);
          } else {
            window.alert(json.message);
          }
        });
      }
    } else {
      window.alert("Password does not match!");
    }
  };
  handleShowPassword = (e) => {
    const showPassword = this.state.showPassword;
    this.setState({ showPassword: !showPassword });
  };
  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <i className="fa fa-cog mr-1"></i> Change Password
        </CardHeader>
        <Form onSubmit={this.handleSubmit}>
          <CardBody>
            <CustomInput
              label="Old Password"
              type={this.state.showPassword ? "text" : "password"}
              required
              className="form-control rounded"
              name="oldPassword"
              value={this.state.oldPassword}
              onChange={this.handleChange}
              placeholder="Old Password"
              errors={this.state.errors?.oldPassword}
            />
            <CustomInput
              type={this.state.showPassword ? "text" : "password"}
              required
              className="form-control rounded"
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
              placeholder="New Password"
              label="New Password"
              errors={this.state.errors?.password}
            />
            <CustomInput
              type={this.state.showPassword ? "text" : "password"}
              required
              className="form-control rounded"
              name="confirmPassword"
              value={this.state.confirmPassword}
              onChange={this.handleChange}
              errors={this.state.errors?.confirmPassword}
              placeholder="Confirm Password"
              label="Confirm Password"
            />
            <br></br>
            {/* <Row>
              <div className="form-check">
                <Input
                  className="form-check-Input rounded"
                  type="checkbox"
                  style={{ transform: " scale(1.5)", width: "20px" }}
                  onClick={this.handleShowPassword}
                />
                <Label className="form-check-Label mt-0 ml-3">
                  <strong>Show Password</strong>
                </Label>
              </div>
            </Row> */}
            <FormGroup check>
              <Label check>
                <Input type="checkbox" onClick={this.handleShowPassword} />
                <h6 className="mt-1">
                  <strong>Show Password</strong>
                </h6>
              </Label>
            </FormGroup>
          </CardBody>

          {this.state.error && (
            <div className="div" style={{ color: "red" }}>
              {this.state.error.password.map((message) => (
                <p>{message}</p>
              ))}
            </div>
          )}
          <CardFooter className="d-flex justify-content-end">
            {" "}
            <button type="button" onClick={() => window.history.back()} className="mt-3 mx-2 btn btn-info btn-sm text-white">
              Cancel
            </button>
            <button type="submit" className="mt-3 btn btn-success btn-sm">
              Submit
            </button>
          </CardFooter>
        </Form>
      </Card>
    );
  }
}
