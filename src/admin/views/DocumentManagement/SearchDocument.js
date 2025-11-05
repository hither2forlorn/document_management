import React from "react";
import { connect } from "react-redux";
import { getOptions } from "config/util";
import { Card, CardBody, Label, Input, Button, Form, FormGroup, CardHeader } from "reactstrap";

import { getIndexType, getIndexTypes } from "../IndexType/api";
import Province from "constants/Province";
import { CustomSelect } from "admin/components";
import DistrictWithProvince from "constants/District";
import TagsInput from "./components/TagsInput";
import { banks, onlyForThisVendor, selectedVendor, excludeThisVendor, includeThisFeature, dms_features } from "config/bank";
import { ToggleButton, ToggleButtonGroup } from "@mui/lab";
import { Switch } from "@mui/material";

class SearchDocument extends React.Component {
  constructor(props) {
    super();
    this.myRef = React.createRef();
  }
  state = {
    documentTypes: [],
    statuses: [],
    locationMaps: [],
    indexList: [],
    parentDocTypes: [],
  };

  componentDidMount() {
    this.setState(this.props.allFields);
    {
      /* for displaying parent document types only */
    }
    let tempParentDocTypes = [];
    let subDocumentTypes = [];
    const data = this.props.allFields?.documentTypes?.map((el) => {
      if (!el.parentId) {
        tempParentDocTypes.push(el);
      } else subDocumentTypes.push(el);
    });
    this.setState({
      parentDocTypes:
        !includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) || this.props.AttachmentBata
          ? this.props.allFields.documentTypes
          : tempParentDocTypes,
    });

    getIndexTypes((err, data) => {
      // console.log(data);
      this.setState({
        indexList: data?.data,
      });
    });
  }
  handleField(id, name, item) {
    switch (item.dataType) {
      case "province":
        return (
          <div key={id}>
            <CustomSelect label={name} name={name} options={Province} onChange={this.props.onChange} />
          </div>
        );
      case "district":
        return (
          <div key={id}>
            <CustomSelect label={name} name={name} options={DistrictWithProvince} onChange={this.props.onChange} />
          </div>
        );
      case "tag":
        return (
          <div key={id} className="mt-2">
            <Label>{name}</Label>
            <Input
              className="form-control rounded"
              name="indexTypeId"
              id="indexTypeId"
              type="number"
              // name={name}
              // value={this.props.searchData.indexList}
              onChange={this.props.onChange}
              style={{ width: "100%" }}
            />
          </div>
        );

      default:
        return (
          <div key={id} className="mt-2">
            <Label>{name}</Label>
            <Input
              className="form-control rounded"
              id="indexTypeId"
              type="text"
              name={name}
              // value={this.props.searchData.indexList}
              onChange={this.props.onChange}
              style={{ width: "100%" }}
            />
          </div>
        );
        break;
    }
  }

  handleReset = () => {
    // this.setState({ indexList: [] });
    // window.location.reload();
    this.props.onReset();
    // console.log(this.state.id);
  };
  renderItems() {
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">
            <i className=" fas fa-solid fa-filter"></i>
            Filter {this.props.AttachmentBata ? "Attachments" : "Documents"}
          </p>
          <span onClick={this.handleReset} className="btn-header btn btn-outline-dark btn-sm border-dark border">
            <i className="fa fa-refresh" />
          </span>
        </CardHeader>

        <CardBody className="pt-3">
          <Form onSubmit={(e) => e.preventDefault()} ref={this.myRef}>
            <FormGroup>
              <Label className="mt-1">{this.props.AttachmentBata ? "Attachment" : "Document"} Type</Label>
              <select
                className="form-control rounded mb-3"
                name="documentTypeId"
                id="documentTypeId"
                value={getOptions(this.state.id)}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                <option value="">-- NONE --</option>
                {getOptions(this.state.parentDocTypes)}
              </select>
              {this.state.indexList &&
                this.state.indexList.map((item, idx) => (
                  <>
                    {this.props.searchData.documentTypeId && item.docId == this.props.searchData.documentTypeId
                      ? this.handleField(idx, item.label, item)
                      : null}
                  </>
                ))}
            </FormGroup>

            {onlyForThisVendor(banks.bok.name) ? (
              <FormGroup>
                <Label>Asociated ID </Label>

                <TagsInput name="tags" searchFilterBata onChange={this.props.onChange} />
              </FormGroup>
            ) : (
              <FormGroup>
                {excludeThisVendor([banks.citizen.name]) && (
                  <TagsInput name="tags" label="Tags" searchFilterBata onChange={this.props.onChange} />
                )}
              </FormGroup>
            )}

            <FormGroup>
              <Label>Search</Label>
              <Input
                // ref={this.myRef}
                className="form-control rounded"
                type="text"
                name="simpleText"
                id="simpleText"
                placeholder="Enter document name "
                value={this.props.searchData.simpleText || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              />
            </FormGroup>

            <FormGroup>
              <Label>OCR Search</Label>
              <Input
                className="form-control rounded"
                type="text"
                name="advanceText"
                id="advanceText"
                placeholder="Enter file content"
                value={this.props.searchData.advanceText || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              />
            </FormGroup>
            <FormGroup>
              <Label className="mt-1">Department</Label>
              <select
                className="form-control rounded"
                name="departmentId"
                id="departmentId"
                value={this.props.searchData.departmentId || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                <option value="">-- NONE --</option>
                {getOptions(this.state.departments)}
              </select>
            </FormGroup>

            <FormGroup>
              <Label className="mt-1">Branch</Label>
              <select
                className="form-control rounded"
                name="branchId"
                id="branchId"
                value={this.props.searchData.branchId || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                <option value="">-- NONE --</option>
                {getOptions(this.state.branches)}
              </select>
            </FormGroup>

            <FormGroup>
              <Label className="mt-1">Location Map</Label>
              <select
                className="form-control rounded"
                name="locationMapId"
                id="locationMapId"
                value={this.props.searchData.locationMapId || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                <option value="">-- NONE --</option>
                {getOptions(this.state.locationMaps)}
              </select>
            </FormGroup>
            <FormGroup>
              <Label className="mt-1">has Unit</Label>
              <select
                className="form-control rounded"
                name="hasUnit"
                id="hasUnit"
                value={this.props.searchData.hasUnit || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                {getOptions(this.props.allFields.hasUnit)}
              </select>
            </FormGroup>
            <FormGroup>
              <Label className="mt-1">Status</Label>
              <select
                className="form-control rounded"
                name="statusId"
                id="statusId"
                value={this.props.searchData.statusId || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              >
                <option value="">-- NONE --</option>
                {getOptions(this.state.statuses)}
              </select>
            </FormGroup>

            {onlyForThisVendor(banks.citizen.name) && this.props.archivedAccess ? (
              <FormGroup>
                <Label className="mt-1">is Archived?</Label>
                <select
                  className="form-control rounded"
                  name="isArchivedId"
                  id="isArchivedId"
                  value={this.props.searchData.isArchivedId || ""}
                  onChange={this.props.onChange}
                  style={{ width: "100%" }}
                >
                  {getOptions(this.props.allFields.isArchived)}
                </select>
              </FormGroup>
            ) : null}

            {/* {this.props.userProfile.id === 1 && (
            )} */}
              <FormGroup>
                <Label className="mt-1">is Deleted</Label>
                <select
                  className="form-control rounded"
                  name="isDeletedId"
                  id="idDeletedId"
                  value={this.props.searchData.isDeletedId || ""}
                  onChange={this.props.onChange}
                  style={{ width: "100%" }}
                >
                  {getOptions(this.props.allFields.isArchived)}
                </select>
              </FormGroup>

            <FormGroup>
              <Label className="mt-1">Document Added From: </Label>
              <Input
                className="form-control rounded"
                type="date"
                name="startDate"
                id="startDate"
                value={this.props.searchData.startDate || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              />
            </FormGroup>

            <FormGroup>
              <Label className="mt-1">To</Label>

              <Input
                className="form-control rounded"
                type="date"
                name="endDate"
                id="endDate"
                value={this.props.searchData.endDate || ""}
                onChange={this.props.onChange}
                style={{ width: "100%" }}
              />
            </FormGroup>

            {/* <FormGroup>
              <Label className="mt-1">Search in Archived</Label>

              <Switch
                name="hasArchived"
                checked={this.props.searchData.hasArchived || false}
                onChange={this.props.onChange}
                inputProps={{ "aria-label": "controlled" }}
              />
            </FormGroup> */}

            <Button onClick={this.handleReset} className="btn-block">
              Reset
            </Button>
          </Form>
        </CardBody>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
  userProfile: state.userProfile,
}))(SearchDocument);
