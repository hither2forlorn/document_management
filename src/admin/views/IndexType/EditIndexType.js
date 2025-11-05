import { getFormData, getMultipleFormData } from "config/form";
import metaRoutes from "config/meta_routes";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { loadAllFields } from "redux/actions/apiAction";
import { toast } from "react-toastify";
import A from "config/url";
import query from "querystring";
import { editIndexTypes, getIndexType } from "./api";
import { Card, CardHeader, CardBody, CardFooter, Input, Form, FormGroup, Button, Label, Col, Row } from "reactstrap";
import titleCase from "utils/textCapital";
import Validation from "./components/validationwithJson";
import { banks, dms_features, excludeThisVendor, includeThisFeature } from "config/bank";

const EditIndexType = (props) => {
  const [ids, setIds] = useState();
  const [inputList, setInputList] = useState([{}]);
  const [validationRule, setvalidationRule] = useState(false);
  const [showConditionalRule, setShowConditionalRule] = useState(false);
  const [validationType, setvalidationType] = useState({});
  // const [documentTypes, setDocumentTypes] = useState([]);
  // let ids;
  // handle input change
  const date = [
    {
      name: "Pattern",
      value: "pattern",
    },
  ];
  const handleInputChange = (e, index) => {
    let { name, value } = e.target;
    switch (name) {
      case "string":
        console.log("string.");
        break;
      case "number":
        console.log("number.");
        break;
      case "alphaNum":
        console.log("alphaNum.");
        break;
      case "province":
        console.log("province.");
        break;
      case "district":
        console.log("district.");
        break;
      case "branch":
        console.log("branch.");
        break;
      case "tag":
        console.log("tag.");
        break;
      case "dynamicCombox":
        console.log("dynamicCombox.");
        break;
      default:
        console.log("Sorry, we are out");
    }

    console.log("Is there anything else you'd like?");

    if (name != "dataType") value = titleCase(value);

    const list = [...inputList];
    list[index][name] = value;

    if (name === "type") {
      if (list[index].type === "1") {
        list[index].type = "0";
      } else {
        list[index].type = "1";
      }
    }
    if (name === "isRequired") {
      if (list[index].isRequired === "1") {
        list[index].isRequired = "0";
      } else {
        list[index].isRequired = "1";
      }
    }
    if (name === "isShownInAttachment") {
      if (list[index].isShownInAttachment === "1") {
        list[index].isShownInAttachment = "0";
      } else {
        list[index].isShownInAttachment = "1";
      }
    }

    // console.log("new type is: ", list, list[index][name]);
    setInputList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, {}]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = getMultipleFormData(event);
    // for (let k of formData.entries()) {
    //   console.log(k);
    // }

    editIndexTypes(formData, (err, data) => {
      // console.log(data);
      if (err) {
        toast.error("Error!");
        return;
      }
      if (data.success) {
        toast.success(data.message);
        props.history.push(metaRoutes.adminIndexType);
        props.dispatch(loadAllFields());
      }
    });
  };

  useEffect(() => {
    const qs = query.parse(props.location.search);
    const id = A.getId(qs["?i"]);
    if (!id) {
      props.history.push(metaRoutes.adminIndexType);
      toast.warning("Please select document type!!");
    }
    setIds(id);

    getIndexType(id, (err, data) => {
      if (err) return;
      if (data.success) {
        setInputList(data.data);
      }
    });
  }, []);

  return (
    <Card className="shadow">
      <CardHeader>
        <p className="h5">Edit Index Type</p>
      </CardHeader>
      <Form onSubmit={handleSubmit}>
        <CardBody>
          {inputList.map((x, i) => {
            return (
              <>
                <Row>
                  <Col md={4}>
                    <FormGroup>
                      <Label for="dataTypeSelect">Data Type</Label>
                      <Input
                        type="select"
                        value={inputList ? x.dataType : ""}
                        name="dataType"
                        elementId={ids}
                        onChange={(e) => handleInputChange(e, i)}
                        required
                      >
                        <option value="">--NONE--</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="alphaNum">Alpha Numeric</option>
                        <option value="date">Date</option>
                        <option value="province">Province</option>
                        <option value="district">District</option>
                        <option value="tag">Tag</option>
                        <option value="dynamicCombox" disabled>
                          Dynamic Combox
                        </option>
                        {props.userProfile.id === 1 ? (
                          <option value="branch">Branch</option>
                        ) : (
                          <option value="branch" disabled>
                            Branch
                          </option>
                        )}

                        {/* <option value="">Alpha Numeric</option> */}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label>Index Name</Label>
                      <Input
                        name="label"
                        placeholder="Enter New Index Type"
                        value={x.label}
                        onChange={(e) => handleInputChange(e, i)}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        position: "relative",
                        top: "3px",
                      }}
                    >
                      <Input
                        type="checkbox"
                        value={x.isRequired}
                        name="isRequired"
                        checked={x.isRequired === "1" || x.isRequired === true ? true : false}
                        onChange={(e) => handleInputChange(e, i)}
                      />
                      <label htmlFor="Required" style={{ marginRight: 20 }}>
                        Required field
                      </label>
                    </FormGroup>

                    {includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && (
                      <>
                        <FormGroup
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            position: "relative",
                            top: "3px",
                          }}
                        >
                          <Input
                            type="checkbox"
                            value={x.validation && x.validation !== "0" ? true : false}
                            checked={
                              validationRule
                                ? validationRule
                                : x.validation && x.validation !== "0"
                                ? // x.validation === "1" || x.validation === true
                                  true
                                : false
                            }
                            name="validation"
                            onChange={(e) => handleInputChange(e, i)}
                          />
                          <label htmlFor="Required" style={{ marginRight: 20 }}>
                            Validation Rule
                          </label>
                        </FormGroup>

                        <FormGroup
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            position: "relative",
                            top: "3px",
                          }}
                        >
                          <Input
                            type="checkbox"
                            value={inputList ? x.isShownInAttachment : ""}
                            name="isShownInAttachment"
                            checked={x.isShownInAttachment === "1" || x.isShownInAttachment === true ? true : false}
                            onChange={(e) => handleInputChange(e, i)}
                          />
                          <label htmlFor="showInAttachment" style={{ marginRight: 20 }}>
                            Show in Table
                          </label>
                        </FormGroup>
                      </>
                    )}
                  </Col>

                  {/* Validation Input */}
                  {includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) &&
                    (x.validation && x.validation !== "0" ? (
                      <Validation validation={handleInputChange} value={inputList ? x.validation : ""} />
                    ) : (
                      ""
                    ))}
                </Row>

                <Input type="hidden" name="id" value={ids} />
                <Input type="hidden" name="docId" value={x.docId} />
              </>
            );
          })}
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          <Button type="submit" color="primary" className="text-white">
            Submit
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
};

export default connect((state) => ({ allFields: state.allFields, userProfile: state.userProfile }))(EditIndexType);
