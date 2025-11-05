import React from "react";
import { Form, FormGroup, Label, Input, Row, Col, Button, Card, CardBody, CardHeader, CardFooter } from "reactstrap";
import moment from "moment";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";

const CustomerForm = (props) => {
  const isEdit = props.isEdit;
  const user = props.user ? props.user : {};
  return (
    <>
      <Form className="col-md-9" onSubmit={props.onSubmit}>
        <Card className="shadow">
          <CardHeader>
            <i className="fa fa-user" />
            <strong>{props.name}</strong>
          </CardHeader>

          <CardBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="name">Full Name</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter Full Name"
                      required
                      onChange={props.onChange}
                      value={user.name || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter Full Name"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="identityNo">Identity Number</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="text"
                      id="identityNo"
                      required
                      placeholder="Enter Identity Number"
                      name="identityNo"
                      onChange={props.onChange}
                      value={user.identityNo || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="text"
                      id="identityNo"
                      required
                      placeholder="Enter Identity Number"
                      name="identityNo"
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="email">Email</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      required
                      onChange={props.onChange}
                      value={user.email || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="username">Username</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="username"
                      id="username"
                      name="username"
                      placeholder="Enter Username"
                      required
                      onChange={props.onChange}
                      value={user.username || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="username"
                      id="username"
                      name="username"
                      placeholder="Enter Email"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    className="rounded"
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter Password"
                    onChange={props.onChange}
                    required={!isEdit}
                  ></Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="confirmPassword">Re-enter Password</Label>
                  <Input
                    className="rounded"
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    onChange={props.onChange}
                    required={!isEdit}
                  ></Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="phoneNumber">Phone Number</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="number"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter Mobile Number"
                      required
                      onChange={props.onChange}
                      value={user.phoneNumber || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="number"
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Enter Mobile Number"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="gender">Gender</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      onChange={props.onChange}
                      value={user.gender || ""}
                      type="select"
                      id="gender"
                      name="gender"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </Input>
                  ) : (
                    <Input className="rounded" type="select" id="gender" name="gender" required>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Others</option>
                    </Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup>
                  <Label for="dateOfBirth">Date of Birth</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      required
                      onChange={props.onChange}
                      value={user.dateOfBirth ? moment(user.dateOfBirth).format("YYYY-MM-DD") : ""}
                    ></Input>
                  ) : (
                    <Input className="rounded" type="date" id="dateOfBirth" name="dateOfBirth" required></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="street">Street</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="text"
                      id="street"
                      name="street"
                      placeholder="Enter Street name"
                      required
                      onChange={props.onChange}
                      value={user.street || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="text"
                      id="street"
                      name="street"
                      placeholder="Enter Street name"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="city">City</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter City name"
                      required
                      onChange={props.onChange}
                      value={user.city || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="text"
                      id="city"
                      name="city"
                      placeholder="Enter City name"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="postalCode">Postal Code</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="number"
                      id="postalCode"
                      name="postalCode"
                      placeholder="Enter Postal Code name"
                      required
                      onChange={props.onChange}
                      value={user.postalCode || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="number"
                      id="postalCode"
                      name="postalCode"
                      placeholder="Enter Postal Code name"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label for="country">Country</Label>
                  {isEdit ? (
                    <Input
                      className="rounded"
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Enter Country name"
                      required
                      onChange={props.onChange}
                      value={user.country || ""}
                    ></Input>
                  ) : (
                    <Input
                      className="rounded"
                      type="text"
                      id="country"
                      name="country"
                      placeholder="Enter Country name"
                      required
                    ></Input>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            {props.isEdit ? (
              <>
                <Button
                  onClick={() => window.history.back()}
                  type="button"
                  size="sm"
                  color="info"
                  className="mx-2 text-white"
                >
                  Cancel
                </Button>
                <Button color="success" size="sm" className="float-right">
                  Update
                </Button>
              </>
            ) : (
              <>
                <CustomCancel onClick={() => window.history.back()} />
                <CustomSubmit />
              </>
            )}
          </CardFooter>
        </Card>
      </Form>
    </>
  );
};

export default CustomerForm;
