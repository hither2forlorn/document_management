import React from "react";
import { connect } from "react-redux";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getValue } from "config/util";
import { toast } from "react-toastify";
import { Card, CardHeader, CardBody, Input, CardFooter, Button, Row, Col, FormGroup, Label, Table, Form } from "reactstrap";
import { sendEmail } from "../api/send_email";
import { SEND_EMAIL_HOURLY_ACCESS } from "config/values";
import metaRoutes from "config/meta_routes";

const HourlyAccessList = (props) => {
  const previewUrl = window.location.origin + "#" + metaRoutes.documentsPreview + "?i=";
  const otherUrl = window.location.origin + "/#/special-preview?token=";
  const documentData = props.documentData;
  //   console.log(props.documentData);
  const hourlyAccesses = documentData.hourly_accesses ? documentData.hourly_accesses : [];
  const onSendMail = (data) => {
    sendEmail(SEND_EMAIL_HOURLY_ACCESS, {
      userId: data.userId,
      validTill: data.validTill,
      url: data.url,
      userEmail: data.userEmail,
    });
  };

  return (
    <Card className="shadow">
      <CardHeader>
        <i className="fa fa-hourglass" /> Hourly dfsdf
      </CardHeader>
      <CardBody>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>User</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {hourlyAccesses.map((u, i) => {
              let url = previewUrl + u.token;
              if (u.userEmail) {
                url = otherUrl + u.token;
              }
              return (
                <tr key={i}>
                  <td>{getValue(props.users, u.userId) ? getValue(props.users, u.userId) : u.userEmail}</td>
                  <td>
                    <CopyToClipboard text={url} onCopy={() => toast.info("Copied to clipboard!")}>
                      <Button size="sm" color="info" title="Copy to Clipboard">
                        <i className="fa fa-copy text-white" />
                      </Button>
                    </CopyToClipboard>
                    <Button
                      className="ml-2"
                      size="sm"
                      color="primary"
                      title="Send Email"
                      onClick={() =>
                        onSendMail({
                          userId: u.userId,
                          validTill: u.validTill,
                          url,
                          userEmail: u.userEmail,
                        })
                      }
                    >
                      <i className="fa fa-arrow-up text-white" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  ...state.allFields,
}))(HourlyAccessList);
