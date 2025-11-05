import React from "react";
import { Button, Col, Row } from "reactstrap";
import { CustomInput, CustomSelect } from "admin/components";
import CustomCancel from "admin/components/CustomCancel";
import CustomSubmit from "admin/components/CustomSubmit";
import { Form, CardBody, CardFooter } from "reactstrap";
import { connect } from "react-redux";
import { banks, onlyForThisVendor } from "config/bank";
import ReactSelect from "admin/components/ReactSelect";
import { preventWhitespaceAtFirst } from "../Util/preventWhitespaceAtFirst";

const LocationMapForm = (props) => {
  const locationMap = props.locationMap ? props.locationMap : {};
  const validationErrors = props.validationErrors ? props.validationErrors : null;
  const isEdit = props.isEdit ? true : false;
  return (
    <Form onSubmit={props.handleSubmit}>
      <CardBody>
        <Row>
          <Col md={4}>
            <CustomInput
              required
              object={locationMap}
              isEdit={isEdit || locationMap.name}
              label="Name"
              name="name"
              onInput={(e) => preventWhitespaceAtFirst(e.target)}
              value={locationMap.name}
              errors={validationErrors ? validationErrors.name : null}
              onChange={props.handleChange}
            />
          </Col>
          <Col md={4}>
            <CustomInput
              object={locationMap}
              isEdit={isEdit}
              label="Description"
              onInput={(e) => preventWhitespaceAtFirst(e.target)}
              name="description"
              errors={validationErrors ? validationErrors.description : null}
              onChange={props.handleChange}
            />
          </Col>
          <Col md={4}>
            <CustomSelect
              object={locationMap}
              isEdit={isEdit}
              required
              label="Location Type"
              name="locationTypeId"
              errors={validationErrors ? validationErrors.locationTypeId : null}
              options={props.locationTypes}
              onChange={props.handleChange}
            />
          </Col>
          <Col md={4}>
            <CustomSelect
              object={locationMap}
              isEdit={isEdit}
              label="Parent Category"
              name="parentId"
              errors={validationErrors ? validationErrors.parentId : null}
              options={props.locationMaps}
              onChange={props.handleChange}
            />
          </Col>
          {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
            <Col md={4}>
              <CustomSelect
                required={props.userProfile.id == 1 ? false : true}
                label="Security Hierarchy"
                name="hierarchy"
                onChange={props.handleChange}
                object={locationMap}
                options={props.hierarchy}
                isEdit={isEdit}
                errors={validationErrors ? validationErrors.hierarchy : null}
              />
            </Col>
          )}
          {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
            <Col md={4}>
              <ReactSelect
                // required={props.userProfile.id == 1 ? false : true}
                label="Multiple Security Hierarchy"
                name="multiple_hierarchy"
                onChange={props.handleChange}
                object={locationMap}
                isMulti
                options={props.hierarchy}
                isEdit={isEdit}
                errors={validationErrors ? validationErrors.hierarchy : null}
              />
            </Col>
          )}
          {/* <Col md={4}>
            <CustomSelect
              object={locationMap}
              isEdit={isEdit}
              label="Branch (Default to current branch)"
              options={props.branches}
              name="branchId"
              errors={validationErrors ? validationErrors.parentId : null}
              onChange={props.handleChange}
            />
          </Col> */}
        </Row>
        <div className="alert alert-dark" role="alert">
          Note: If Security hierarchy is set to none then all user will able to view location.{" "}
        </div>
      </CardBody>
      <CardFooter className="d-flex justify-content-end">
        {isEdit ? (
          <>
            <Button onClick={() => window.history.back()} type="button" color="danger" className="mx-2 text-white">
              Cancel
            </Button>
            <button className="btn btn-primary" type="submit">
              Update
            </button>
          </>
        ) : (
          <>
            <CustomCancel onClick={() => window.history.back()} />
            <CustomSubmit isDisabled={props.isDisabled} />
          </>
        )}
      </CardFooter>
    </Form>
  );
};

export default connect((state) => ({
  ...state.allFields,
  userProfile: state.userProfile,
}))(LocationMapForm);
