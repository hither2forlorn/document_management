import React from "react";
import { connect } from "react-redux";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import moment from "moment";
import { Card, CardBody } from "reactstrap";

const MemoSearch = (props) => {
  const searchData = props.memoSearchData;
  return (
    <Card className="shadow">
      <CardBody>
        <Form
          onSubmit={(e) => e.preventDefault()}
          onReset={() =>
            props.setSearchData({
              // requestedBy: props.currentUserId,
              assignedTo: props.currentUserId,
            })
          }
        >
          <FormGroup>
            <Label>Request Id</Label>
            <Input
              className="rounded"
              type="text"
              name="requestId"
              onChange={props.onChange}
              value={searchData.requestId || ""}
            />
          </FormGroup>
          <FormGroup>
            <Label>Description</Label>
            <Input
              className="rounded"
              type="text"
              name="description"
              onChange={props.onChange}
              value={searchData.description || ""}
            />
          </FormGroup>
          <FormGroup>
            <Label>Requested By</Label>
            <Input
              className="rounded"
              type="select"
              name="requestedBy"
              onChange={props.onChange}
              value={searchData.requestedBy || ""}
            >
              <option value="">--- ALL ---</option>
              {props.users.map((user) => {
                return (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                );
              })}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Assigned To</Label>
            <Input
              className="rounded"
              type="select"
              name="assignedTo"
              onChange={props.onChange}
              value={searchData.assignedTo || ""}
            >
              <option value="">--- ALL ---</option>
              {props.users.map((user) => {
                return (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                );
              })}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label>Assigned On Range</Label>
            <Input
              className="rounded"
              type="date"
              name="assignedOnStart"
              max={
                searchData.assignedOnEnd
                  ? moment(searchData.assignedOnEnd).format("YYYY-MM-DD")
                  : moment().format("YYYY-MM-DD")
              }
              onChange={props.onChange}
              value={searchData.assignedOnStart || ""}
            />
            <Input
              className="rounded"
              type="date"
              name="assignedOnEnd"
              min={searchData.assignedOnStart ? moment(searchData.assignedOnStart).format("YYYY-MM-DD") : ""}
              max={moment().format("YYYY-MM-DD")}
              onChange={props.onChange}
              value={searchData.assignedOnEnd || ""}
            />
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
            <Input className="rounded" type="select" name="status" onChange={props.onChange} value={searchData.status || ""}>
              <option value="">--- ALL ---</option>
              {props.memoStatuses.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Button type="reset" color="info" className="float-right">
              Reset <i className="fa fa-redo"></i>
            </Button>
          </FormGroup>
        </Form>
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users || [],
  memoStatuses: state.allFields.memoStatuses || [],
  permissions: state.permissions || {},
  memoSearchData: state.memoSearchData,
}))(MemoSearch);
