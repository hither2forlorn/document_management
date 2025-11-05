import React from "react";
import Joi from "joi";
import "./Login.css";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";

import { server, SERVER_URL } from "admin/config/server";
import { CURRENT_USER_ID, TOKEN } from "config/values";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import metaRoutes from "config/meta_routes";
import ReCAPTCHA from "react-google-recaptcha";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";
import { toast } from "react-toastify";
import ChangePassword from "admin/views/Users/ChangePassword";
import { loadCaptchaEnginge, LoadCanvasTemplate, LoadCanvasTemplateNoReload, validateCaptcha } from "react-simple-captcha";
import axios from "axios";
import moment from "moment";
const logo = "/img/epf.png";

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    remember: false,
    forgotpassword: false,
    errors: {},
    expiryPassword: false,
    modalOpen: false,
    isCaptchaVerified: false,
    token: {},
    licenseModalOpen: false,
    licenseExpirationDate: null,
    remainingDays: null,
    isLicenseValid: false,
  };

  schema = Joi.object().keys({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().min(8).label("Password"),
  });


  checkLicense = async () => {
    const response = await axios.get("http://localhost:8181/api/license-checker");
    const { isLicenseValid, licenseExpirationDate } = response.data;
    if (isLicenseValid) {
      this.setState({ isLicenseValid });
    }
    localStorage.setItem("isLicenseValid", JSON.stringify(isLicenseValid));
    localStorage.setItem("licenseExpirationDate", licenseExpirationDate);

    const expiryDate = moment(licenseExpirationDate);
    const currentDate = moment();
    const remainingDays = expiryDate.diff(currentDate, "days");

    this.setState({ licenseExpirationDate, remainingDays, licenseModalOpen: true });
  };


  validate = () => {
    const data = { email: this.state.email, password: this.state.password };
    const { error } = this.schema.validate(data);
    if (!error) return null;
    return {
      [error.details[0].context.key]: error.details[0].message,
    };
  };

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = ({ target: input }) => {
    const state = {};
    switch (input.type) {
      case "checkbox":
        state[input.name] = input.checked;
        break;
      default:
        state[input.name] = input.value;
        break;
    }
    this.setState({
      ...state,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const error = this.validate();
    this.setState({ errors: error || {} });
    if (error) return;
    if (this.state.forgotpassword) {
      this.forgotpassword();
    } else {
      this.signin();
    }
  };

  forgotpassword = () => {
    const body = JSON.stringify({ email: this.state.email });
    fetch(SERVER_URL + "/forgotpassword", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: body,
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  signin = () => {
    const body = {
      email: this.state.email,
      password: this.state.password,
      remember: this.state.remember,
    };

      server
        .post("/signin", body)
        .then((res) => {
          const json = res.data;

          if (json.success) {
            // send data to chanage password component
            this.setState({
              token: { jsonToken: json.user.token, userId: json.user.id },
            });

            // expired password must change password
            if (json.user.isExpirePassword === true && json.user.id != 1) {
              window.alert("Your password is expired. Please change your password");
              this.setState({
                modalOpen: true,
              });
            } else {
              this.props.history.push(metaRoutes.adminDashboard);
              return window.location.reload();
            }
          } else {
            window.alert(json.message);
          }
        })
        .catch((err) => {
          if (err?.response?.data?.message) {
            toast.error(err?.response?.data?.message);
          } else toast.error("Invalid Credentials");
        });
  };
  //handling the google-reCaptcha v2
  handleCaptcha = () => {
    if (this.state.isVerified) {
      return;
    } else {
      this.setState({ isVerified: true });
    }
  };

  hanldeLoginToDashboard = () => {
    this.props.history.push(metaRoutes.adminDashboard);

    localStorage.setItem(TOKEN, this.state.token.jsonToken);
    localStorage.setItem(CURRENT_USER_ID, this.state.token.userId);
    return window.location.reload();
  };

  render() {
    const { errors, email, password } = this.state;
    if (this.state.expiryPassword == true && this.props.auth.isAuthenticated) {
      return <Redirect to={metaRoutes.adminDashboard} />;
    }

    return (
      <>
        {this.state.isLicenseValid && (
          <marquee className="license-marquee" behavior="scroll" direction="left">
            Action Needed: Your license is expiring on:
            <span
              style={{
                color: "red",
              }}
            >
              {moment(this.state.licenseExpirationDate).format("MMMM Do YYYY, h:mm:ss a")}
            </span>
            <span>. Please renew the license or contact with Gentech.</span>
          </marquee>
        )}
        <Modal isOpen={this.state.modalOpen}>
          <ModalHeader>Please reset your password.</ModalHeader>
          <ModalBody>
            <ChangePassword token={this.state.token} hanldeLoginToDashboard={this.hanldeLoginToDashboard} />
          </ModalBody>
        </Modal>
        <div className="app flex-row align-items-center">
          <Container>
            <Row className="justify-content-center">
              <Col md="8">
                <CardGroup className="shadow-lg">
                  <Card className="p-4">
                    <CardBody>
                      {!this.state.forgotpassword ? (
                        <Form id="signin-form" onSubmit={this.handleSubmit}>
                          <h1>Log In</h1>
                          <p className="text-muted">Sign In to your account</p>
                          <InputGroup className="mb-3">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="fas fa-user"></i>
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              type="text"
                              value={this.state.email}
                              onChange={this.handleChange}
                              placeholder="Username *"
                              name="email"
                            />
                          </InputGroup>
                          <InputGroup className="mb-4">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="fas fa-key"></i>
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              type="password"
                              onChange={this.handleChange}
                              value={this.state.password}
                              placeholder="Password *"
                              name="password"
                            />
                          </InputGroup>
                          {errors.password || errors.email ? (
                            <div className="w-100">
                              <div className="ml-auto text-center font-weight-bold alert alert-danger">
                                {errors.password || errors.email}
                              </div>
                            </div>
                          ) : (
                            ""
                          )}

                          <Row>
                            <Col xs="8">
                              {/* <div style={{ display: includeThisFeature(dms_features?.ReCAPTCHA) ? "block" : "none" }}>
                                <LoadCanvasTemplate /> */}
                                {/* <div className="d-flex align-items-center">
                                  <input
                                    placeholder="Enter Captcha Value"
                                    id="user_captcha_input"
                                    name="user_captcha_input"
                                    type="text"
                                    style={{
                                      border: "1px solid #edf0ee",
                                      padding: "10px",
                                      outline: "none",
                                      borderRadius: "5px",
                                      height: "30px",
                                    }}
                                  />

                                  <div className="mt-3">
                                    <div>
                                      <span
                                        className="btn btn-secondary"
                                        onClick={(e) => this.doSubmit(e)}
                                        style={{
                                          border: "1px solid #edf0ee",
                                          padding: "5px 10px",
                                          borderRadius: "5px",
                                          fontWeight: "bold",
                                          background: "lightblue",
                                          color: "darkblue",
                                          cursor: "pointer",
                                          marginBottom: "18px",
                                          fontStyle: " normal",
                                          fontSize: "14px",
                                        }}
                                      >
                                        {this.state.isCaptchaVerified ? (
                                          <i className="fa  fa-check bg-success" />
                                        ) : (
                                          <i className="fa  fa-check" />
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div> */}
                                {/* <span className="text-success text-sm ">
                                  {" "}
                                  {this.state.isCaptchaVerified ? "Captcha Verified" : null}
                                </span> */}
                              {/* </div> */}

                              <Button
                                color="primary"
                                type="submit"
                                // disabled={
                                //   (includeThisFeature(dms_features.ReCAPTCHA) && !this.state.isVerified) ||
                                //   !email ||
                                //   !password
                                // }
                                className="px-4 mt-4"
                              >
                                Login
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      ) : (
                        <Form id="forgotpassword-form" onSubmit={this.handleSubmit}>
                          <h1>Log In</h1>
                          <p className="text-muted">Sign In to your account</p>
                          <InputGroup className="mb-3">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="icon-user"></i>
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              type="email"
                              value={this.state.email}
                              onChange={this.handleChange}
                              placeholder="Username"
                              name="email"
                            />
                          </InputGroup>
                          <InputGroup className="mb-4">
                            <InputGroupAddon addonType="prepend">
                              <InputGroupText>
                                <i className="icon-lock"></i>
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input
                              type="password"
                              onChange={this.handleChange}
                              value={this.state.password}
                              placeholder="Password"
                              name="password"
                            />
                          </InputGroup>
                          {errors.password || errors.email ? (
                            <div className="w-100">
                              <div className="ml-auto text-center font-weight-bold alert alert-danger">
                                {errors.password || errors.email}
                              </div>
                            </div>
                          ) : (
                            ""
                          )}

                          <Row>
                            <Col xs="6">
                              <Button color="primary" type="submit" disabled={!email || !password} className="px-4 ">
                                Login
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      )}
                    </CardBody>
                  </Card>
                  <Card
                    className="text-white py-5 d-md-down-none"
                    style={{
                      width: "44%",
                      // backgroundColor: "#c1cbff",
                      background: "#c1cbff",
                      background: "-moz-radial-gradient(center, ellipse cover,  #c1cbff 0%, #6bb4e5 100%)",
                      background: "-webkit-radial-gradient(center, ellipse cover,  #c1cbff 0%,#6bb4e5 100%)",
                      background: "radial-gradient(ellipse at center,  #c1cbff 0%,#6bb4e5 100%)",
                      filter:
                        "progid:DXImageTransform.Microsoft.gradient( startColorstr='#c1cbff', endColorstr='#6bb4e5',GradientType=1 )",
                    }}
                  >
                    <CardBody className="text-center d-flex justify-content-center flex-wrap align-items-center">
                      <div className="">
                        <img src={logo} alt="company logo" />
                        <span className="copyright-text text-dark mt-2 d-block"> Employment Provident Fund<br/> Document Management System<br/> 2025 ©</span>
                      </div>
                    </CardBody>
                  </Card>
                </CardGroup>
              </Col>
            </Row>
          </Container>
        </div>
        {/* <div className="login-container">
          <div className="signup-form-container">
            {!this.state.forgotpassword ? (
              <form id="signin-form" onSubmit={this.handleSubmit}>
                <h3 className="heading">Sign In</h3>
                <div className="input-container">
                  <i className="fa fa-user signin-icon"></i>
                  <input
                    className="form-control input-field"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    placeholder="Username"
                    name="email"
                  />
                </div>
                <div className="input-container">
                  <i className="fa fa-key signin-icon"></i>
                  <input
                    className="form-control input-field"
                    type="password"
                    onChange={this.handleChange}
                    value={this.state.password}
                    placeholder="Password"
                    name="password"
                  />
                </div>
                {errors.password || errors.email ? (
                  <div className="w-100">
                    <div className="ml-auto text-center font-weight-bold alert alert-danger">
                      {errors.password || errors.email}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <label className="checkbox">
                                <input
                                    type="checkbox"
                                    onChange={this.handleChange}
                                    checked={this.state.remember}
                                    name="remember"
                                />{" "}
                                Remember Me
                            </label>
                <div className="submit-container">
                  <Button
                    className="login-button"
                    type="submit"
                    disabled={!email || !password}
                  >
                    LOGIN
                  </Button>
                </div>
              </form>
            ) : (
              <form id="forgotpassword-form" onSubmit={this.handleSubmit}>
                <h3 className="heading-forgot">
                  <i
                    onClick={() => {
                      this.setState({ forgotpassword: false });
                    }}
                    className="fa fa-arrow-left signin-icon-back"
                  ></i>
                  <span>Forgot Password</span>
                </h3>
                <div className="input-container">
                  <i className="fa fa-envelope signin-icon"></i>
                  <input
                    className="form-control input-field"
                    type="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    placeholder="Email"
                    name="email"
                  />
                </div>
                <div className="submit-container">
                  <Button className="login-button" type="submit">
                    RESET
                  </Button>
                </div>
              </form>
            )}
            <span className="copyright-text">2019 © General Doc System</span>
          </div>
        </div> */}
      </>
    );
  }
}

export default connect((state) => ({
  auth: state.auth,
}))(Login);
