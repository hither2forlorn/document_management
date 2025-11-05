import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button, Table, Row, Col } from "reactstrap";
import { getMemoList, deleteMemo } from "./api/memo";
import { getValue } from "config/util";
import metaRoutes from "config/meta_routes";
import A from "config/url";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { CURRENT_USER_ID, VIEW_EDIT_DELETE, VIEW_EDIT, VIEW } from "config/values";
import { skipOne } from "../Workflow/util";
import MemoSearch from "./components/MemoSearch";
import { setMemoSearch } from "redux/actions/memoAction";
import query from "querystring";

const MemoList = (props) => {
  const p = props.permissions;
  const [memos, setMemos] = useState([]);
  const currentUserId = localStorage.getItem(CURRENT_USER_ID);
  const qs = query.parse(props.location.search);
  const tag = qs.tag;
  const title = qs.title;

  useEffect(() => {
    if (props.memoSearchData.tag !== tag) props.dispatch(setMemoSearch({ tag }));
    getData();
  }, [props.memoSearchData, tag]); //eslint-disable-line

  const getData = () => {
    getMemoList(props.memoSearchData, (err, data) => {
      if (err) toast.error("Error!");
      else setMemos(data);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const searchData = props.memoSearchData;
    searchData[name] = value;
    props.dispatch(setMemoSearch({ ...searchData }));
  };

  const onDelete = (id) => {
    deleteMemo(id, (err, data) => {
      if (err) toast.error("Error!");
      else {
        if (data.success) {
          toast.success("Success");
          getData();
        } else {
          toast.warn(data.message);
        }
      }
    });
  };

  return (
    <>
      <Row>
        <Col md={3}>
          <MemoSearch
            currentUserId={currentUserId}
            onChange={handleChange}
            setSearchData={(searchData) => props.dispatch(setMemoSearch(searchData))}
          />
        </Col>
        <Col md={9}>
          <Card className="shadow">
            <CardHeader>
              <h5>{title ? title : "Memo"} List</h5>
            </CardHeader>
            <CardBody>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>S.N.</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Requested by</th>
                    <th>Status</th>
                    <th style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {memos.map((memo, idx) => (
                    <tr key={memo.id}>
                      <td>{idx + 1}</td>
                      <td>
                        {p.memo === VIEW_EDIT_DELETE || p.memo === VIEW_EDIT || p.memo === VIEW ? (
                          <Link
                            // className="text-decoration-none"
                            to={metaRoutes.memoView + "?i=" + A.getHash(memo.id)}
                          >
                            {memo.form.name}
                          </Link>
                        ) : (
                          memo.form.name
                        )}
                        {memo.workflow_master && memo.workflow_master.assignedTo === currentUserId ? (
                          <span className="ml-2 btn btn-warning btn-sm text-white blink_me">
                            <i className="fa fa-lg fa-circle" />
                            {/* <strong></strong> */}
                          </span>
                        ) : null}
                      </td>
                      <td>{memo.form.description}</td>
                      <td>{getValue(props.users, memo.createdBy)}</td>
                      <td>
                        {memo.workflow_master ? (
                          <>
                            {memo.workflow_master.currentLevel >= 0 ? (
                              <span
                                title={"Pending on " + getValue(props.users, memo.workflow_master.assignedTo)}
                                className="btn btn-info btn-sm text-white"
                              >
                                <strong>{memo.workflow_master.currentStatus}</strong>
                              </span>
                            ) : (
                              <span className="btn btn-success btn-sm text-white">
                                <strong>{memo.workflow_master.currentStatus}</strong>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="btn btn-secondary btn-sm text-white">
                            <strong>Not Started</strong>
                          </span>
                        )}
                      </td>
                      <td>
                        {memo.workflow_master &&
                        memo.workflow_master.currentStatus === "Pending" &&
                        memo.workflow_master.currentLevel < memo.workflow_master.maxLevel ? (
                          <Button
                            title="Skip one user"
                            className="mx-1 text-white"
                            onClick={() => skipOne(memo.workflow_master.id, getData)}
                            size="sm"
                            color="info"
                          >
                            <i className="fa fa-forward" />
                          </Button>
                        ) : null}
                        {p.memo === VIEW_EDIT_DELETE ? (
                          <Button className="mx-1 text-white" onClick={() => onDelete(memo.id)} size="sm" color="danger">
                            <i className="fa fa-trash" />
                          </Button>
                        ) : null}
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
  memoSearchData: state.memoSearchData,
}))(MemoList);
