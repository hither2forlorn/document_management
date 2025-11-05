import React from "react";
import { Button, Label, Input, Form, FormGroup } from "reactstrap";
import { getFormData } from "../../config/form";
import Joi from "joi";
import { server } from "../../client/config/server";
import metaRoutes from "../../config/meta_routes";
import { toast } from "react-toastify";
import { CLIENT_TOKEN } from "../../config/values";

class ClientLogin extends React.Component {
  state = {
    email: "",
    password: "",
    remember: false,
    forgotpassword: false,
    errors: {},
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const form = getFormData(e);
    this.setState({ email: form.email, password: form.password });
    const error = this.validate();
    this.setState({ errors: error || {} });
    if (!error) {
      this.signIn();
    }
  };

  schema = Joi.object().keys({
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });

  validate = () => {
    const data = { email: this.state.email, password: this.state.password };
    const { error } = this.schema.validate(data);
    if (!error) return null;
  };

  signIn = () => {
    const body = {
      email: this.state.email,
      password: this.state.password,
    };
    server
      .post("/client/signin", body)
      .then((res) => {
        return res.data;
      })
      .then((json) => {
        if (json.success) {
          localStorage.setItem(CLIENT_TOKEN, json.client.token);
          this.props.history.push(metaRoutes.clientDashboard);
        } else {
          toast.info(json.message);
        }
      })
      .catch((err) => {
        toast.error("Error!!");
      });
  };

  render() {
    return (
      <Form className="border border-dark p-5 w-25 h-100 m-auto" onSubmit={this.handleSubmit}>
        <p className="h4 mb-4 text-center">Client Login</p>
        <FormGroup>
          <Label for="username">Username</Label>
          <Input type="email" name="email" id="username" placeholder="Enter username" required />
        </FormGroup>
        <FormGroup>
          <Label for="password">Password</Label>
          <Input type="password" id="password" name="password" placeholder="Enter Password" required />
        </FormGroup>

        <Button size="lg" color="primary">
          Sign in
        </Button>
      </Form>
    );
  }
}

export default ClientLogin;
