import React, { useState } from "react";
import { Input, FormGroup, Label, Row, Col, Button } from "reactstrap";

const Json = (props) => {
  // console.log(props.value);
  // let myArray = props.value.split(':');
  const global = [
    {
      name: "Max Length",
      value: "maxlength",
    },
    {
      name: "Min Length",
      value: "minlength",
    },
  ];
  const [serviceList, setServiceList] = useState([{ service: "", serviceTwo: "" }]);
  const [semiColumn, setSemiColumn] = useState("");
  const [json, setJson] = useState({});

  const handleServiceChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...serviceList];
    list[index][name] = value;
    setServiceList(list);
    setSemiColumn(":");
  };

  const handleServiceRemove = (index) => {
    const list = [...serviceList];
    list.splice(index, 1);
    setServiceList(list);
  };

  const handleServiceAdd = () => {
    setServiceList([...serviceList, { service: "", serviceTwo: "" }]);
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
    props.validation({ ["validation"]: json });
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
                    required
                  >
                    <option value="">please Select</option>
                    {global.map((index) => (
                      <option value={index.value}>{index.name}</option>
                    ))}
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
                    required
                  ></Input>
                </FormGroup>
              </Col>
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
                <Col md={1}>
                  <FormGroup>
                    <Button onClick={() => handleServiceRemove(index)} className="btn btn-brand btn-danger mr-1">
                      <i className="fa fa-minus text-white" aria-hidden="true"></i>
                    </Button>
                  </FormGroup>
                </Col>
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
              serviceList
                ? "{" +
                  serviceList.map((singleService, index) =>
                    singleService.service
                      ? '\n"' + singleService.service + '"' + semiColumn + '"' + singleService.serviceTwo + '"'
                      : "" + "\n"
                  ) +
                  "}"
                : ""
            }
          ></textarea>
        </div>
      </Col>
    </>
  );
};

export default Json;
