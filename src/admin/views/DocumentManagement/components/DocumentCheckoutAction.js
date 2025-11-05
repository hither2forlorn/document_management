import React, { useState } from "react";
import { Card, CardHeader, CardBody, Input, Form, Button, Label } from "reactstrap";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { checkoutDocument } from "../api";
import { toast } from "react-toastify";
import Required from "admin/components/Required";

const DocumentInOut = (props) => {
  const document = props.document || {};
  const documentId = document.id;
  const [userId, setUserId] = useState("");
  const [description, setDescription] = useState("");
  const onSubmit = (e) => {};

  const handleStatusId = (e) => {
    e.preventDefault();
    const data = {
      documentId,
      userId,
      description,
      statusId: 2,
    };

    if (!userId.length > 0) {
      toast.error("Please select a user!");
    } else {
      checkoutDocument(data, (err, data) => {
        if (err) {
          toast.error("Error occurred!");
        } else {
          if (data.success) {
            // console.log(data.message);
            toast.success(data.message);
          } else {
            // console.log(data.message);
            toast.warn(data.message);
          }
        }
      });
    }
  };

  return (
    <Card>
      <CardHeader>Document Checkout</CardHeader>
      <CardBody>
        <Form onSubmit={onSubmit}>
          <Label>Please select a user</Label>
          <Required />
          <Input
            className="my-2"
            required
            value={userId}
            onChange={({ target: { value } }) => setUserId(value)}
            type="select"
          >
            <option value="">---- NONE ----</option>
            {getOptions(props.users)}
          </Input>
          <Input
            type="textarea"
            className="my-2"
            required
            value={description}
            onChange={({ target: { value } }) => setDescription(value)}
          />
          <Button size="sm" color="success" onClick={(e) => handleStatusId(e)}>
            Checkout
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
  statuses: state.allFields.statuses,
}))(DocumentInOut);
