import React, { Component } from "react";
// import { Link } from 'react-router-dom';
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
  Row,
} from "reactstrap";
import metaRoutes from "config/meta_routes";
import { login } from "./api";
import { Redirect } from "react-router";
import { connect } from "react-redux";

class Login extends Component {
  state = {
    username: "",
    password: "",
  };

  handleSubmit = (e) => {
    e.preventDefault();
    login({
      username: this.state.username,
      password: this.state.password,
    });
  };

  handleChange = (e) => {
    switch (e.target.name) {
      case "username":
        this.setState({ username: e.target.value });
        break;
      case "password":
        this.setState({ password: e.target.value });
        break;
      default:
        break;
    }
  };

  render() {
    if (this.props.clientAuth.isAuthenticated) return <Redirect to={metaRoutes.clientDashboard} />;
    // console.log(errors);
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={this.handleSubmit}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          //   type="username"
                          onChange={this.handleChange}
                          value={this.state.username}
                          name="username"
                          placeholder="Username"
                          required
                          autoComplete="current-username"
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
                          name="password"
                          placeholder="Password"
                          required
                          autoComplete="current-password"
                        />
                      </InputGroup>
                      <Button type="button" color="default" size="sm" className="">
                        Forgot Password
                      </Button>
                      <Button color="primary" className="float-right">
                        Login
                      </Button>
                    </Form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default connect((state) => ({
  clientAuth: state.clientAuth,
}))(Login);
