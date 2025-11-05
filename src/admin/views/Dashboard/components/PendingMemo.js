import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { getMemoReport } from "../api/memo";
import metaRoutes from "config/meta_routes";

const bgColors = ["bg-info", "bg-warning", "bg-primary", "bg-danger", "bg-success"];

const PendingMemo = (props) => {
  const [pendingMemos, setPendingMemo] = useState([]);
  useEffect(() => {
    getMemoReport("all", (err, data) => {
      if (!err) {
        setPendingMemo(data);
      }
    });
  }, []);

  return (
    <Row className="my-3">
      {pendingMemos.map((pendingMemo) => (
        <Col className="px-2" md={2} xs={3}>
          <Link
            className="text-decoration-none"
            to={metaRoutes.memoList + `?i=x&tag=${pendingMemo.tag}&title=${pendingMemo.name}`}
          >
            <h3 style={{ fontFamily: "none" }}>
              <span className={"p-1 mr-2 " + bgColors[Math.floor(Math.random() * bgColors.length)]}>
                <i className="text-white fa fa-cog"></i>
              </span>
              {pendingMemo.count}
            </h3>
            <h4 style={{ fontFamily: "none" }}>{pendingMemo.name.toUpperCase()}</h4>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default PendingMemo;
