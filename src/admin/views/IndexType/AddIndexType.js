import { getFormData, getMultipleFormData } from "config/form";
import metaRoutes from "config/meta_routes";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { loadAllFields } from "redux/actions/apiAction";
import { toast } from "react-toastify";
import A from "config/url";
import query from "querystring";
import { addIndexType } from "./api";
import { Card, CardHeader, CardBody, CardFooter, Input, Form, FormGroup, Button, Label, Row, Col } from "reactstrap";
import { useParams, useLocation } from "react-router-dom";
import { selectedVendor, banks, onlyForThisVendor, excludeThisVendor, includeThisFeature, dms_features } from "config/bank";
import CustomSubmit from "admin/components/CustomSubmit";
import titleCase from "utils/textCapital";
import Validation from "./components/validationwithJson";
import Conditional from "./components/conditional";

const AddIndex = (props) => {
  const [ids, setIds] = useState();
  const [inputList, setInputList] = useState([{}]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [indexName, setIndexName] = useState();
  const [showUrl, setShowUrl] = useState(false);
  // const [dataType, setDataType] = useState({});
  const [dataType, setDataType] = useState();
  const [validation, setValidation] = useState();
  const [condition, setCondition] = useState();
  const [isValidation, setIsValidation] = useState(false);
  const [showConditionalRule, setShowConditionalRule] = useState(false);
  // const [documentTypes, setDocumentTypes] = useState([]);
  // let ids;
  // handle input change
  const handleInputChangeValidation = (e, index) => {
    const { name, checked } = e.target;
    if (name === "validation" && checked == true) {
      const list = [...inputList];
      list[index][name] = checked;
      setInputList(list);
      setIsValidation(true);
    } else {
      const list = [...inputList];
      list[index][name] = checked;
      setInputList(list);
      setIsValidation(false);
    }
  };

  const handleInputChangeConditional = (e, index) => {
    const { name, checked } = e.target;
    if (name === "condition" && checked == true) {
      const list = [...inputList];
      list[index][name] = checked;
      setInputList(list);
      setShowConditionalRule(true);
    } else {
      const list = [...inputList];
      list[index][name] = checked;
      setInputList(list);
      setShowConditionalRule(false);
    }
  };

  const handleInputChange = (e, index) => {
    // console.log(ids,"ids");
    if (e?.target) {
      let { name, value } = e.target;
      if (e.target.value === "autoComplete") {
        setShowUrl(true);
      } else if (e.target.name === "dataType") {
        setShowUrl(false);
      }
      if (e?.target?.name === "dataType" && e?.target?.value) {
        // setDataType({ ...dataType, [e.target.value]: e.target.value });
        setDataType(e.target.value);
      }
      // value = titleCase(value);
      const list = [...inputList];
      list[index][name] = value;
      list[index]["docId"] = ids;
      setInputList(list);
    } else if (e?.validation) {
      const list = [...inputList];
      list[index]["validation"] = e?.validation;
      list[index]["docId"] = ids;
      setValidation(e);
    } else if (e?.condition) {
      const list = [...inputList];
      list[index]["condition"] = e?.condition;
      list[index]["docId"] = ids;
      setCondition(e);
    }
  };
  // console.log(dataType, "dataType");
  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setInputList([...inputList, {}]);
    // setValidation(false)
    // setShowConditionalRule(false)
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // const formData = getMultipleFormData(event);
    // console.log(docId,"formDataDocId");
    const formData = inputList;
    // for (let k of formData.entries()) {
    //   console.log(k);
    // }
    addIndexType(formData, (err, data) => {
      if (err) {
        toast.error("Error!");
        return;
      }
      if (data.success) {
        toast.success(data.message);
        setIsDisabled(true);
        props.history.push(metaRoutes.adminIndexType);
        props.dispatch(loadAllFields());
      }
    });
  };

  useEffect(() => {
    const qs = query.parse(props.location.search);
    const id = A.getId(qs["?i"]);
    setIndexName(qs["index"]);
    if (!id) {
      props.history.push(metaRoutes.adminIndexType);
      toast.warning("Please select document type!!");
    }
    setIds(id);
  }, [props.location.search]);
  return (
    <Card className="shadow">
      <CardHeader>
        <h5>
          Add new index type <span className="badge badge-info font-weight-bold text-white">{indexName}</span>{" "}
        </h5>{" "}
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
                      <Input type="select" name="dataType" elementId={ids} onChange={(e) => handleInputChange(e, i)}>
                        <option value="">--NONE--</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="alphaNum">Alpha Numeric</option>
                        <option value="date">Date</option>
                        <option value="autoComplete" disabled>
                          Auto Complete
                        </option>
                        <option value="province">Province</option>
                        <option value="district">District</option>
                        <option value="tag">Tag</option>
                        <option value="nepaliDate">NepaliDate</option>
                        <option value="dynamicCombox" disabled>
                          Static Combox
                        </option>
                        <option value="branch">Branch</option>
                        {/* <option value="">Alpha Numeric</option> */}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={showUrl ? 3 : 4}>
                    <FormGroup>
                      <Label>Index Name</Label>
                      <Input
                        name="label"
                        placeholder="Enter New Index Type"
                        value={x.label}
                        onChange={(e) => handleInputChange(e, i)}
                      />
                    </FormGroup>
                  </Col>
                  {showUrl ? (
                    <Col md={3}>
                      <FormGroup>
                        <Label>API</Label>
                        <Input
                          name="api"
                          placeholder="Enter API Url"
                          value={x.api}
                          onChange={(e) => handleInputChange(e, i)}
                        />
                      </FormGroup>
                    </Col>
                  ) : (
                    ""
                  )}
                  <Col md={showUrl ? 2 : 4}>
                    <FormGroup
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        position: "relative",
                        top: "3px",
                      }}
                    >
                      <Input type="checkbox" value={true} name="isRequired" onChange={(e) => handleInputChange(e, i)} />
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
                          <Input type="checkbox" name="validation" onChange={(e) => handleInputChangeValidation(e, i)} />
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
                          <Input type="checkbox" name="condition" onChange={(e) => handleInputChangeConditional(e, i)} />
                          <label htmlFor="Required" style={{ marginRight: 20 }}>
                            Conditional Rule
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
                            value={true}
                            checked
                            name="isShownInAttachment"
                            onChange={(e) => handleInputChange(e, i)}
                          />
                          <label htmlFor="showInAttachment" style={{ marginRight: 20 }}>
                            Show in Table
                          </label>
                        </FormGroup>
                      </>
                    )}
                  </Col>
                </Row>
                <Row>
                  {/* Conditional Input */}
                  {x.condition && x.label ? (
                    <>
                      <Col md={12}>
                        <Conditional condition={handleInputChange} data={inputList} i={i} />
                      </Col>
                    </>
                  ) : (
                    ""
                  )}

                  {/* Validation Input */}
                  {excludeThisVendor([banks.rbb.name]) &&
                    (x.validation ? (
                      <>
                        <Validation
                          // validationRules={
                          //   Object.keys(dataType).length > 0 ? dataType : ""
                          // }
                          validationRules={dataType}
                          validation={handleInputChange}
                          i={i}
                        />
                      </>
                    ) : (
                      ""
                    ))}
                  {/* Add or Remove index type */}
                  <Col md={12}>
                    <div className="dropdown-divider"></div>
                    <Input type="hidden" name="docId" value={ids} />
                    <div className="d-flex justify-content-end">
                      {inputList.length - 1 === i && (
                        <FormGroup>
                          <Button onClick={handleAddClick} className="btn btn-brand btn-info  mr-1">
                            <i className="fa fa-plus text-white" aria-hidden="true"></i>
                          </Button>
                        </FormGroup>
                      )}
                      {inputList.length !== 1 && (
                        <FormGroup>
                          <Button onClick={() => handleRemoveClick(i)} className="btn btn-brand btn-danger mr-1">
                            <i className="fa fa-minus text-white" aria-hidden="true"></i>
                          </Button>
                        </FormGroup>
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            );
          })}
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          {/* <Button type="submit" color="primary" className="text-white">
            Submit
          </Button> */}
          <CustomSubmit isDisabled={isDisabled} />
        </CardFooter>
      </Form>
    </Card>
  );
};

export default connect((state) => ({ allFields: state.allFields, userProfile: state.userProfile }))(AddIndex);
