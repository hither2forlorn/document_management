import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Card, CardHeader, CardBody, Input, CardFooter, Button, Row, Col, FormGroup, Label, Table, Form } from "reactstrap";
import { MultiSelect } from "@mantine/core";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { provideTimelyAccess } from "../api";
import Select from "react-select";
import { toast } from "react-toastify";
import { getValue } from "config/util";
import { SEND_EMAIL_HOURLY_ACCESS } from "config/values";
import { sendEmail } from "../api/send_email";
import metaRoutes from "config/meta_routes";
import CustomSubmit from "admin/components/CustomSubmit";
import A from "config/url";
import { Link } from "react-router-dom";
import query from "querystring";
import HourlyAccessList from "./HourlyAccessList";
import Redaction from "./Redaction";
import RedactionHourlyAccess from "./RedactionHourlyAccess";
import RedactionPDF from "./RedactionPDF";
import { redactedHourlyAccess } from "../api/document";
import { dms_features, includeThisFeature } from "config/bank";

const ProvideAccess = (props) => {
  const previewUrl = window.location.origin + "#" + metaRoutes.documentsPreview + "?i=";
  const otherUrl = window.location.origin + "/#/special-preview?token=";
  const [duration, setDuration] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [email, setEmail] = useState([{}]);
  const [existingUsers, setExistingUsers] = useState(false);
  const [otherUsers, setOtherUsers] = useState(false);
  const [redact, setRedact] = useState(false);
  const [nonRedact, setNonRedact] = useState(false);
  const [bools, setBools] = useState(false);
  const documentData = props.documentData;
  const [isLoading, setIsLoading] = useState(false);
  const selectedAttachmentId = props.selectedAttachmentId || null;
  const hourlyAccesses = documentData.hourly_accesses ? documentData.hourly_accesses : [];
  const qs = query.parse(props.location.search).type;
  const [durationTypeValue, setDurationTypeValue] = useState(60 * 1000);
  const [attachmentTypeValue, setAttachmentTypeValue] = useState([]);
  const [redacted, setRedacted] = useState(false);
  const [redactionValue, setredactionValue] = useState([]);
  const [redactedAttachment, setRedactedAttachment] = useState([]);
  const [disableSelect, setDisableSelect] = useState(false);
  const [redactionModule, setRedactionModule] = useState(false);
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
    setEmail(value);
    setSelectedUsers(value);
  };

  const onSubmit = (e) => {
    setRedacted(true);
    e.preventDefault();
    setRedactionModule(true);
    if ((otherUsers && attachmentTypeValue !== null) || existingUsers) {
      setIsLoading(true);
      setExistingUsers(false);
      setDuration(1);
      setDurationTypeValue(60 * 1000);
      const data = {
        // attachmentId: selectedAttachmentId ? selectedAttachmentId : null,
        documentId: props.documentData.id,
        durationInMillis: duration * durationTypeValue,
        // selectedUsers,
        previewUrl,
        otherUrl,
        attachmentId: attachmentTypeValue,
        selectedEmails: email.map((item) => {
          return { userId: item?.value, userEmail: item?.userEmail };
        }),
        type: null,
        redact,
        redactionValue,
        redactedAttachment,
      };
      console.log(data.attachmentId);
      provideTimelyAccess(data, (err, json) => {
        if (!json.success) {
          return toast.warning(json.message || "Empty email! Please clear email and continue!");
        }
        if (data.attachmentId === null) {
          toast.warn("Please select an attachment");
        } else {
          if (err) toast.error("Oops! Something went wrong");
          else {
            toast.success("Success!");
            props.loadDocument();
          }
        }
      });

      // setEmail([{}]);
    } else {
      toast.warn("Please select an attachment");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const onSendMail = (data) => {
    sendEmail(SEND_EMAIL_HOURLY_ACCESS, {
      userId: data.userId,
      validTill: data.validTill,
      url: data.url,
      userEmail: data.userEmail,
    });
  };
  const emailChangeHandler = (e, index) => {
    let val = [...email];
    val[index][e.target.name] = e.target.value;
    setEmail(val);
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

  // const handleRedact = (e) => {
  //   if (e.target.checked) {
  //     setRedact(true);
  //     setNonRedact(false);
  //     // setSelectedUsers([]);
  //     // setExistingUsers(false);
  //     // setOtherUsers(false);
  //     // setEmail([{}]);
  //     // setOtherUsers(false);
  //   }
  // };

  const onHandleClick = () => {
    if (selectedAttachmentId !== null) {
      props.history.push({
        pathname: metaRoutes.documentsRedaction,
        search: "?i=",
        hash: A.getHash(documentData.id),
        state: {
          selectedAttachmentId,
        },
      });
    } else {
      toast.warn("Please select an attachment");
    }
  };

  const handleNonRedact = (e) => {
    if (e.target.checked) {
      setNonRedact(true);
      setRedact(false);
      setBools(true);
    }
  };

  const requiredComponent = (
    <span className="text-danger h6 ml-1">
      <b>*</b>
    </span>
  );
  const handleOptionChange = (value, { action, removedValue }) => {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = props.attachments.filter((v) => v.isFixed);
        break;
      default:
        break;
    }
    setAttachmentTypeValue(value);
  };

  if (isLoading) {
    return "Loading";
  }

  const handleRedactionAttachmentchange = (value, { action, removedValue }) => {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = props.attachments.filter((v) => v.isFixed);
        break;
      default:
        break;
    }

    setredactionValue(value.value);
    setRedactedAttachment(value);
    setRedact(true);
  };

  const handleRedactionSubmit = (e) => {
    window.open(`${process.env.REACT_APP_REDACTION_URL}/${redactionValue}`, "_blank");
    setDisableSelect(true);
    console.log(disableSelect, "this is disable select");
  };
  return (
    <>
      <Row className="mt-3">
        <Col md={6}>
          <Form onSubmit={onSubmit}>
            <Card className="shadow">
              <CardHeader>
                <i className="fa fa-hourglass" /> Provide Hourly Access
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="12">
                    <FormGroup>
                      <Label>Select Attachment {requiredComponent}</Label>
                      <Select
                        isDisabled={disableSelect ? true : false}
                        isMulti
                        onChange={handleOptionChange}
                        value={attachmentTypeValue}
                        name="userAccess"
                        className="basic-multi-select react-select-style"
                        classNamePrefix="select"
                        options={
                          props.attachments
                            ? props.attachments
                                .filter((row) => !row.pendingApproval)
                                .map((row, index) => ({
                                  value: row.id,
                                  label: row.name,
                                }))
                            : []
                        }
                      />

                      {/* <MultiSelect
                      data={getOptions}
                      onChange={(e) =>
                        setAttachmentTypeValue(Number(e.target.value))
                      }
                      options={props.attachments.map((row, index) => {
                        return row.name;
                      })}
                      value={attachmentTypeValue}
                    /> */}

                      {/* <Inputs
                      type="select"
                      min="0"
                      name="documentSelection"
                      required
                      onChange={(e) =>
                        setAttachmentTypeValue(Number(e.target.value))
                      }
                      value={attachmentTypeValue}
                    >
                      <option value={props.documentData.id}>
                        Select this document
                      </option>
                      {props.attachments.map((row, index) => {
                        return (
                          <option key={index} value={row.id}>
                            {row.name}
                          </option>
                        );
                      })}
                    </Inputs> */}
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  {/* {(qs || bools) && ( */}
                  <>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duration {requiredComponent}</Label>
                        <Input
                          type="number"
                          min="0"
                          required
                          onChange={(e) => setDuration(Number(e.target.value))}
                          value={duration}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Duration Type {requiredComponent}</Label>

                        <Input
                          type="select"
                          min="0"
                          required
                          onChange={(e) => setDurationTypeValue(Number(e.target.value))}
                          value={durationTypeValue}
                        >
                          <option value="60000">Minute</option>
                          <option value="360000">Hour</option>
                          <option value="86400000">Day</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col>
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
                    </Col>
                  </>
                  {/* )} */}
                  <Col>
                    {/* {!qs && (
                    <FormGroup>
                      <Label>
                        Do You want to do <strong>Redaction</strong> ?
                      </Label>
                      <div>
                        <FormGroup check inline>
                          <Label check className="mr-3">
                            <Input
                              required
                              type="radio"
                              name="radio1"
                              onChange={(e) => handleRedact(e)}
                            />
                            Yes
                          </Label>
                          <Label check>
                            <Input
                              required
                              type="radio"
                              name="radio1"
                              onChange={(e) => handleNonRedact(e)}
                            />
                            No
                          </Label>
                        </FormGroup>
                      </div>
                    </FormGroup>
                  )} */}
                  </Col>
                  {existingUsers && (
                    <Col md="12">
                      {requiredComponent}
                      <Select
                        isMulti
                        onChange={handleSelectChange}
                        value={selectedUsers}
                        name="userEmail"
                        className="basic-multi-select react-select-style"
                        classNamePrefix="select"
                        options={
                          props.users
                            ? props.users.map((u) => ({
                                value: u.id,
                                label: u.name,
                                userEmail: u.email,
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
                            name="userEmail"
                            value={item.otherUsersEmail}
                            onChange={(e) => emailChangeHandler(e, index)}
                            placeholder="Enter email"
                          />
                          {email.length !== 1 && (
                            <Button
                              size="sm"
                              color="danger"
                              title="Delete Email"
                              onClick={(e) => removeBtnClickHandler(e, index)}
                            >
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
                </Row>
              </CardBody>

              <CardFooter>
                {/* {!qs ? (
                <>
                  <Col className="d-flex justify-content-end">
                    {redact && (
                      // <p>
                      //   Click &nbsp;
                      //   <Link
                      //     to={{
                      //       pathname: metaRoutes.documentsRedaction,
                      //       search: "?i=",
                      //       hash: A.A.(documentData.id),
                      //       state: {
                      //         selectedAttachmentId,
                      //       },
                      //     }}
                      //   >
                      //     here
                      //   </Link>
                      //   &nbsp;to do Redaction.
                      // </p>
                      <Button onClick={onHandleClick}>Here</Button>
                    )}
                  </Col>
                  <Col className="d-flex justify-content-end">
                    {nonRedact && <CustomSubmit />}
                  </Col>
                </>
              ) : ( */}
                <Col className="d-flex justify-content-end">
                  <CustomSubmit />
                </Col>
                {/* )} */}
              </CardFooter>
            </Card>
          </Form>
        </Col>
        <Col md={6}>
          <Card className="shadow">
            <CardHeader>
              <i className="fa fa-hourglass" /> Hourly Access
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
                    let url = previewUrl + u.token + "&type=" + qs + "&attachId=" + u.attachmentId;
                    if (u.userEmail) {
                      url = otherUrl + u.token + "&type=" + qs + "&hourlyAccesId=" + A.getHash(u.id);
                      "&docId=" + props.documentData.id;
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
        </Col>
      </Row>
      {includeThisFeature(dms_features.REDACTION) && (
        <div
          className="redaction-component"
          style={{
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <RedactionPDF
            redactionValues={redactionValue}
            handleRedactionAttachmentchange={handleRedactionAttachmentchange}
            attachments={props.attachments}
            onSubmit={onSubmit}
            handleRedactionSubmit={handleRedactionSubmit}
            disableSelect={disableSelect}
            redactionModule={redactionModule}
          />
        </div>
      )}
    </>
  );
};

const HourlyAccess = (props) => {
  return <ProvideAccess {...props} />;
};

export default connect((state) => ({
  ...state.allFields,
}))(HourlyAccess);
