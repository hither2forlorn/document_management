import React, { useState } from "react";
import { Input, FormGroup, Label, Row, Col, Button } from "reactstrap";
import { conditionsType, DocumentConditionsField, AutoCompleteField } from "../../../../constants/conditional";

const Conditional = (props) => {
  const [serviceList, setServiceList] = useState([{ conditionIn: "", condition: "", documentConditionsField: "" }]);
  const [isConcate, setIsConcate] = useState(false);
  const [conditionFor, setConditionFor] = useState([{}]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === "condition" && value === "3") {
      setIsConcate(true);
      setConditionFor(DocumentConditionsField);
    } else if (name === "condition" && value === "4") {
      console.log(AutoCompleteField);
      setIsConcate(true);
      setConditionFor(AutoCompleteField);
    } else {
      setIsConcate(false);
    }
    const list = [...serviceList];
    list[index][name] = value;
    setServiceList(list);
    const condition = JSON.stringify(serviceList);
    props.condition({ ["condition"]: condition }, props.i);
  };

  const handleServiceRemove = (index) => {
    const list = [...serviceList];
    list.splice(index, 1);
    setServiceList(list);
  };

  const handleServiceAdd = () => {
    setServiceList([...serviceList, { conditionIn: "", condition: "", documentConditionsField: "" }]);
    const condition = JSON.stringify(serviceList);
    props.condition({ ["condition"]: condition }, props.i);
  };

  return (
    <>
      <Row>
        <Col md={4}>
          <Label for="dataTypeSelect">Use Condition In(For Index Name)</Label>
        </Col>

        <Col md={4}>
          <Label for="dataTypeSelect">Condition</Label>
        </Col>
        {isConcate ? (
          <Col md={4}>
            <Label for="dataTypeSelect">Result In</Label>
          </Col>
        ) : (
          ""
        )}
      </Row>

      {serviceList.map((data, index) => (
        <Row>
          <Col md={4}>
            <FormGroup>
              <Input type="select" name="conditionIn" onChange={(e) => handleChange(e, index)} required>
                <option value="">--please Select--</option>
                {props?.data.map((value) => (
                  <option value={value.label}>{value.label}</option>
                ))}
              </Input>
            </FormGroup>
          </Col>

          <Col md={4}>
            <FormGroup>
              <Input type="select" name="condition" onChange={(e) => handleChange(e, index)} required>
                {conditionsType && conditionsType.map((index, key) => <option value={index.value}>{index.name}</option>)}
              </Input>
            </FormGroup>
          </Col>

          {isConcate ? (
            <Col md={4}>
              <FormGroup>
                <Input
                  type="select"
                  name="documentConditionsField"
                  //   elementId={ids}
                  onChange={(e) => handleChange(e, index)}
                  required
                >
                  {conditionFor && conditionFor.map((index, key) => <option value={index.value}>{index.name}</option>)}
                </Input>
              </FormGroup>
            </Col>
          ) : (
            ""
          )}
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
    </>
    //   ))}
  );
};

export default Conditional;
