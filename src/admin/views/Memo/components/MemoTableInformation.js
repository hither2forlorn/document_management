import React from "react";
import { Card, CardBody, Table } from "reactstrap";
import { connect } from "react-redux";
import { JsonToTable } from "react-json-to-table";

const MemoTableInformation = (props) => {
  const memoDetails = props.memoDetails || [];
  return (
    <>
      <h3>Case Detail:</h3>
      {memoDetails.map((data, i) => {
        const keys = Object.keys(data[0]);
        return (
          <Card key={i} className="shadow">
            <CardBody>
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    {keys.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((data, j) => (
                    <tr key={j}>
                      {keys.map((key) => (
                        <td key={key}>{data[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        );
      })}
      {/* <h3>Case:</h3>
        <JsonToTable json={props.memoDetails} />*/}
    </>
  );
};

export default connect((state) => ({
  permissions: state.permissions,
}))(MemoTableInformation);
