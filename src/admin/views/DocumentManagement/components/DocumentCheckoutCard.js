import React from "react";
import { Card, CardHeader, CardBody, Table, CardFooter, Button } from "reactstrap";
import { connect } from "react-redux";
import { getValue } from "config/util";
import { checkoutDocument } from "../api";
import moment from "moment";
import { toast } from "react-toastify";

const DocumentCheckoutCard = (props) => {
  const checkoutInfos = props.checkoutInfos ? props.checkoutInfos.reverse() : [];
  const latestInfo = checkoutInfos[0] || {};
  const documentId = props.documentId;
  return (
    <Card className="my-3 shadow">
      <CardHeader className="bg-warning">Checkout information</CardHeader>
      <CardBody>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Checkout Date</th>
              <th>CheckIn Date</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {checkoutInfos.map((checkoutInfo, i) => (
              <tr key={i}>
                <td>{getValue(props.users, checkoutInfo.userId)}</td>
                <td>{moment(checkoutInfo.createdAt).format("YYYY-MM-DD")}</td>
                <td>{checkoutInfo.isReturned ? moment(checkoutInfo.updatedAt).format("YYYY-MM-DD") : "Not Returned"}</td>
                <td>{checkoutInfo.description}</td>
                <td>
                  {checkoutInfo.isReturned ? (
                    <span className="badge badge-pill badge-success p-1 pl-2 pr-2">Returned</span>
                  ) : (
                    <span className="badge badge-pill badge-danger p-1 pl-2 pr-2">Not Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter>
        {latestInfo.isReturned === false ? (
          <Button
            className="float-right"
            onClick={() => {
              checkoutDocument(
                {
                  isReturned: true,
                  documentId: documentId,
                  statusId: 1,
                },
                (err, json) => {
                  console.log(json);
                  if (err) {
                    toast.error("Error!");
                  } else {
                    if (json.success) {
                      toast.success(json.message);
                      props.loadDocument();
                    } else {
                      toast.warn("Oops! Something went wrong");
                    }
                  }
                }
              );
            }}
            size="sm"
            color="success"
          >
            Check in
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(DocumentCheckoutCard);
