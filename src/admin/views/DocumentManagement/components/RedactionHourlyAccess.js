import metaRoutes from "config/meta_routes";
import React, { useState } from "react";
import Select from "react-select";
import { Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import { connect } from "react-redux";

const RedactionHourlyAccess = (props) => {
  const documentData = props.documentData;
  console.log(documentData);
  const [duration, setDuration] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [email, setEmail] = useState([{}]);
  const [existingUsers, setExistingUsers] = useState(false);
  const [otherUsers, setOtherUsers] = useState(false);

  const [durationTypeValue, setDurationTypeValue] = useState(60 * 1000);
  const handleSelectChange = (value, { action, removedValue }) => {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = props.users.filter((v) => v.isFixed);
        break;
      default:
        break;
    }
    setSelectedUsers(value);
    props.setSelectedUsers(value);
  };
  const emailChangeHandler = (e, index) => {
    let val = [...email];
    val[index][e.target.name] = e.target.value;
    setEmail(val);
    props.setEmails(val);
    console.log(val);
  };

  const addBtnClickHandler = (e, index) => {
    setEmail([...email, {}]);
  };
  const removeBtnClickHandler = (e, index) => {
    const someVal = [...email];
    someVal.splice(index, 1);
    setEmail(someVal);
  };
  const handleExistingUsers = (e) => {
    console.log(e.target.checked);
    if (e.target.checked) {
      setExistingUsers(true);
      setOtherUsers(false);
      setEmail([{}]);
    }
  };
  const handleOtherUsers = (e) => {
    if (e.target.checked) {
      setOtherUsers(true);
      setExistingUsers(false);
      setSelectedUsers([]);
    }
  };
  return (
    <Row>
      <Col md={3}>
        {" "}
        <FormGroup>
          <Label>Duration</Label>
          <Input
            required
            type="number"
            min="0"
            className="w-50"
            onChange={(e) => {
              setDuration(Number(e.target.value));
              props.setDurations(Number(e.target.value));
            }}
            value={duration}
          />
        </FormGroup>
      </Col>
      <Col md={3}>
        <FormGroup>
          <Label>Duration Type</Label>
          <Input
            required
            className="w-50"
            type="select"
            min="0"
            onChange={(e) => {
              setDurationTypeValue(Number(e.target.value));
              props.setDurationTypes(Number(e.target.value));
            }}
            value={durationTypeValue}
          >
            <option value="60000">Minute</option>
            <option value="360000">Hour</option>
            <option value="86400000">Day</option>
          </Input>
        </FormGroup>
      </Col>
      <Col md={3}>
        {" "}
        <FormGroup>
          <Label>Check Users</Label>
          <div>
            <FormGroup check inline>
              <Label check className="mr-3">
                <Input required type="radio" name="radio" onChange={(e) => handleExistingUsers(e)} />
                Existing Users
              </Label>
              <Label check>
                <Input required type="radio" name="radio" onChange={(e) => handleOtherUsers(e)} />
                Other Users
              </Label>
            </FormGroup>
          </div>
        </FormGroup>
        {existingUsers && (
          <Col md="12">
            <Select
              isMulti
              onChange={handleSelectChange}
              value={selectedUsers}
              name="userAccess"
              className="basic-multi-select react-select-style"
              classNamePrefix="select"
              options={
                props.users
                  ? props.users.map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))
                  : []
              }
            />
          </Col>
        )}
        {otherUsers &&
          email &&
          email.map((item, index) => (
            <>
              <Col md="12" className="mt-3 d-flex">
                <Input
                  type="email"
                  required
                  name="otherUsersEmail"
                  value={item.otherUsersEmail}
                  onChange={(e) => emailChangeHandler(e, index)}
                  placeholder="Enter email"
                />
                {email.length !== 1 && (
                  <Button size="sm" color="danger" title="Delete Email" onClick={(e) => removeBtnClickHandler(e, index)}>
                    <i className="fa fa-trash"></i>
                  </Button>
                )}
              </Col>
              <Col>
                {email.length - 1 === index && (
                  <Button
                    size="sm"
                    color="info"
                    title="Add Email"
                    className="text-white mt-1"
                    onClick={(e) => addBtnClickHandler(e, index)}
                  >
                    <i className="fa fa-plus"></i>
                  </Button>
                )}
              </Col>
            </>
          ))}
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  ...state.allFields,
}))(RedactionHourlyAccess);
