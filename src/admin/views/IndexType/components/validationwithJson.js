import React, { useState, useEffect } from "react";
import { Input, FormGroup, Label, Row, Col, Button } from "reactstrap";
import { ValidationRuleString, ValidationRuleComboBox } from "../../../../constants/validation";

const Validation = (props) => {
  const [serviceList, setServiceList] = useState([{ service: "", serviceTwo: "" }]);
  const [semiColumn, setSemiColumn] = useState("");
  const [json, setJson] = useState({});
  const [seperation, setSeperation] = useState("");

  // useEffect(() => {
  //   validationRuleType;
  // }, []);

  const validationRuleType = () => {
    console.log(props?.validationRules, "asdf");
    // console.log(
    //   props?.validationRules?.string ||
    //     props?.validationRules?.alphaNum ||
    //     props?.validationRules?.number ||
    //     props?.validationRules?.date ||
    //     props?.validationRules?.autoComplete,
    //   "asd"
    // );
    // props?.validationRules?.string ||
    // props?.validationRules?.number ||
    // props?.validationRules?.alphaNum ||
    // props?.validationRules?.date ||
    // props?.validationRules?.autoComplete
    switch (props?.validationRules) {
      case "string":
        return (
          ValidationRuleString &&
          ValidationRuleString.map((index) => (
            <option value={index.value}>{index.name}</option>
            // {console.log("string.", index)}
          ))
        );
        break;
      case "number":
        // return (
        //   ValidationRuleString &&
        //   ValidationRuleString.map((index) => (
        //     <option value={index.value}>{index.name}</option>
        //   ))
        // );
        console.log("This is  a number.");
        break;
      // console.log("test" + value);
      case "alphaNum":
        console.log("alphaNum.");
        break;
      case "date":
        console.log("date.");
        break;
      case "autoComplete":
        console.log("autoComplete.");
        break;
      case "province":
        console.log("province.");
        break;
      case "district":
        console.log("district.");
        break;
      case "tag":
        console.log("tag.");
        break;
      case "nepaliDate":
        console.log("nepaliDate.");
        break;
      case "dynamicCombox":
        return (
          ValidationRuleComboBox && ValidationRuleComboBox.map((index) => <option value={index.value}>{index.name}</option>)
        );
        // console.log("dynamicCombox.");
        break;
      case "branch":
        console.log("branch.");
        break;
      default:
        // return <option value="no any data">No Any Data</option>;
        return (
          ValidationRuleString && ValidationRuleString.map((index) => <option value={index.value}>{index.name}</option>)
        );
        console.log("Sorry, we are out here.");
    }
  };

  const handleInputChange = (e) => {
    console.log(e.target.value, "eben");
    if (e.target.value) {
      setSeperation("{");
    }
  };
  // console.log(validationRuleType, "validationRuleType");
  const handleServiceChange = (e, index) => {
    const { name, value } = e.target;
    // const parse = JSON.parse(value);

    const list = [...serviceList];
    list[index][name] = value;
    setServiceList(list);
    setSemiColumn(":");
    setJson(
      serviceList
        ? "{" +
            serviceList.map((singleService, index) =>
              singleService.service
                ? '\n"' + singleService.service + '"' + semiColumn + '"' + singleService.serviceTwo + '"'
                : "" + "\n"
            ) +
            "}"
        : ""
    );
    // props.validation({ ["validation"]: json },props.i);
  };

  const handleServiceRemove = (index) => {
    const list = [...serviceList];
    list.splice(index, 1);
    setServiceList(list);
    setJson(
      serviceList
        ? "{" +
            serviceList.map((singleService, index) =>
              singleService.service
                ? '\n"' + singleService.service + '"' + semiColumn + '"' + singleService.serviceTwo + '"'
                : "" + "\n"
            ) +
            "}"
        : ""
    );
    props.validation({ ["validation"]: json }, props.i);
  };

  const handleServiceAdd = () => {
    setServiceList([...serviceList, { service: "", serviceTwo: "" }]);
    props.validation({ ["validation"]: json }, props.i);
  };

  return (
    <>
      <div className="dropdown-divider"></div>
      <Col md={4}>
        <FormGroup>
          <Label for="dataTypeSelect">Validation Field</Label>
          {serviceList.map((singleService, index) => (
            <Row>
              <Col md={5}>
                <FormGroup>
                  <Input
                    type="select"
                    name="service"
                    id="service"
                    // elementId={ids}
                    onChange={(e) => handleServiceChange(e, index)}
                  >
                    <option value="">Please Select Option</option>
                    {validationRuleType()}
                    {/* {validationRuleString &&
                      validationRuleString.map((index) => (
                        <option value={index.value}>{index.name}</option>
                      ))} */}
                    {/* {props?.data.map((value)=>(
                  <option value={value.label}>{value.label}</option>
                    ))} */}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={1}>:</Col>
              <Col md={3}>
                <FormGroup>
                  <Input
                    type="text"
                    name="serviceTwo"
                    id="serviceTwo"
                    value={singleService.serviceTwo}
                    onChange={(e) => handleServiceChange(e, index)}
                    //   elementId={ids}
                    //   onChange={(e) => handleInputChange(e, i)}
                  ></Input>
                </FormGroup>
              </Col>

              {/* <Col md={1}>
                <Input
                  type="checkbox"
                  value={true}
                  name="objSeperation"
                  onChange={(e) => handleInputChange(e, i)}
                />
                <label htmlFor="showInAttachment" style={{ marginRight: 20 }}>
                  sepret
                </label>
              </Col> */}
              {serviceList.length - 1 === index && serviceList.length < 20 && (
                <Col md={1}>
                  <FormGroup>
                    <Button onClick={handleServiceAdd} className="btn btn-brand btn-info  mr-1">
                      <i className="fa fa-plus text-white" aria-hidden="true"></i>
                    </Button>
                  </FormGroup>
                </Col>
              )}
              {serviceList.length !== 1 && (
                <>
                  <Col md={1}>
                    <FormGroup>
                      <Button
                        style={{ marginLeft: "5px" }}
                        onClick={() => handleServiceRemove(index)}
                        className="btn btn-brand btn-danger mr-1"
                      >
                        <i className="fa fa-minus text-white " aria-hidden="true"></i>
                      </Button>
                    </FormGroup>
                  </Col>
                </>
              )}
            </Row>
          ))}
        </FormGroup>
      </Col>

      <Col md={8}>
        <Label>JSON Data</Label>
        <div className="output">
          <textarea
            placeholder="{}"
            id="data"
            name="validation"
            onChange={(e) => handleInputChange(e)}
            rows="8"
            cols="62"
            disabled
            value={
              props?.validationRules === "dynamicCombox"
                ? "{option:[" +
                  serviceList.map((singleService, index) =>
                    singleService.service
                      ? '\n"' + singleService.service + '"' + semiColumn + '"' + singleService.serviceTwo + '"'
                      : "" + "\n"
                  ) +
                  "]}"
                : "{" +
                  serviceList.map((singleService, index) =>
                    singleService.service
                      ? '\n"' + seperation + singleService.service + '"' + semiColumn + '"' + singleService.serviceTwo + '"'
                      : "" + "\n"
                  ) +
                  "}"
            }
          ></textarea>
        </div>
      </Col>
    </>
  );
};

export default Validation;
