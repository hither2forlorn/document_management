import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  // Button,
  Table,
  Row,
  Col,
} from "reactstrap";
import { getMemos } from "./api/memo";
// import { getValue } from "../../../config/util";
import metaRoutes from "../../meta_routes";
import A from "../../../config/url";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { CLIENT_USER_ID } from "../../../config/values";

const MemoList = (props) => {
  const [memos, setMemos] = useState([]);
  const [searchData, setSearchData] = useState({}); //eslint-disable-line
  const currentUserId = Number(localStorage.getItem(CLIENT_USER_ID)); //eslint-disable-line
  useEffect(() => {
    getData();
  }, []); //eslint-disable-line

  const getData = () => {
    getMemos(searchData, (err, data) => {
      if (err) toast.error("Error!");
      else setMemos(data);
    });
  };

  return (
    <>
      <Row>
        <Col md={12}>
          <Card className="my-3">
            <CardHeader>
              <h5>Memo List</h5>
            </CardHeader>
            <CardBody>
              <Table responsive>
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Memo Type</th>
                    <th>Description</th>
                    {/* <th>Requested by</th> */}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {memos.map((memo, idx) => (
                    <tr key={memo.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <Link
                          // className="text-decoration-none"
                          to={metaRoutes.clientMemoView + "?i=" + A.getHash(memo.id)}
                        >
                          {memo.form.name}
                        </Link>
                        {memo.workflow_master && memo.workflow_master.assignedTo === currentUserId ? (
                          <span className="ml-2 btn btn-warning btn-sm text-white blink_me">
                            <i className="fa fa-lg fa-circle" />
                            {/* <strong></strong> */}
                          </span>
                        ) : null}
                      </td>
                      <td>{memo.form.description}</td>
                      {/* <td>{getValue(props.users, memo.createdBy)}</td> */}
                      <td>
                        {memo.workflowMasterId ? (
                          <>
                            {memo.workflow_master.currentStatus === "Approved" ? (
                              <span className="btn btn-success btn-sm text-white">
                                <strong>Approved</strong>
                              </span>
                            ) : (
                              <span className="btn btn-info btn-sm text-white">
                                <strong>Pending</strong>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="btn btn-secondary btn-sm text-white">
                            <strong>Not Started</strong>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default connect((state) => ({
  users: state.allFields.users || [],
}))(MemoList);
