import React from "react";
import { connect } from "react-redux";
import { getValue } from "config/util";
import { Card, CardHeader, CardBody, Table, Row, Col } from "reactstrap";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

const DocumentAccessLogs = (props) => {
  const documentAudits = (props.documentData || {}).document_audits || [];
  return (
    //<div className="component-container">
    <Card className="shadow">
      {/* HEADING START */}
      <CardHeader>
        <Row>
          <Col>
            <i className="fas  fa-file-alt" /> Document Access Logs
          </Col>
        </Row>
      </CardHeader>
      {/* HEADING END */}
      {/* <div
        className="component-content-container"
        style={{ maxHeight: 400, height: "auto", overflowY: "scroll" }}
      >
        <div className="component-table-container"> */}
      <CardBody>
        <Table responsive bordered hover id="toExcel">
          <thead>
            <tr>
              <th>Access Type</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Accessed By</th>
            </tr>
          </thead>
          <tbody>
            {documentAudits.map((row) => (
              <tr key={row.id}>
                <td>{row.accessType.toUpperCase()}</td>
                <td>{row.on}</td>
                <td>{new Date(row.dateTime).toDateString()}</td>
                <td>{new Date(row.dateTime).toTimeString()}</td>
                {/* <td>{getValue(props.users, row.accessedBy)}</td> */}
                <td>{row?.accessedBy === 1 ? <p>Admin</p> : getValue(props.users, row.accessedBy)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <ReactHTMLTableToExcel
          id="toExcel-button"
          className="btn btn-sm btn-primary text-white float-right"
          table="toExcel"
          filename="accesslogs"
          sheet="tablexls"
          buttonText="Download Report"
        />
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  users: state.allFields.users,
}))(DocumentAccessLogs);
