import React from "react";
import { addDocument } from "./api";
import { connect } from "react-redux";
import { getFormData } from "config/form";
import { toast } from "react-toastify";
import DocumentForm from "./DocumentForm";
import A from "config/url";
import _ from "lodash";
import NepaliDate from 'nepali-date-converter';
import { LoadingOverlay } from "@mantine/core";
import metaRoutes from "config/meta_routes";
import { Card, CardHeader, CardBody, CardFooter, Form, Button, Row, Col, Container } from "reactstrap";
import DocumentTypeIndex from "./DocumentTypeIndex";
import CustomLoading from "admin/components/CustomLoading";

import InfoModal from "admin/components/infoModal";
import validateIndexValues from "../Util/validateIndexes";
import moment from "moment";
class AddDocument extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleChangeTags = this.handleChangeTags.bind(this);
    this.handleChangeConcate = this.handleChangeConcate.bind(this);
    // this.onSubmit = this.onSubmit.bind(this);
  }

  state = {
    document: {},
    documentData: {},
    indexValues: [],
    documentTypes: [],
    languages: [],
    documentConditions: [],
    statuses: [],
    locationMaps: [],
    departments: [],
    branches: [],
    users: [],
    securityLevels: [],
    yesNo: ["Yes", "No"],
    documentTypeId: "",
    BOKID: "",
    securityLevelCheck: 0,
    authorizedUsersSelect: [],
    userAccessSelectedOptions: [],
    indexLists: [],
    validationErrors: {},
    isDisabled: false,
    associatedBokIds: [],
    includedCheckers: [],
    tagsVlaue: [],
    hasOtp: false,
    hasEncryption: false,
    hasQuickQcr: false,
    isArchived: false,
    isOpen: false,
    concate: {},
    concatString: "",
    checkerList: [],
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const formData = getFormData(event)

    if (!formData.checker) {
      return toast.error("Please select the checker!")
    }
    console.log(formData.madeBy, "------------------------------------------------------");
    if (!formData.madeBy) {
      return toast.error("Please select the Maker Name!")
    }
    if (formData.disposalDate) {
      const dateString = new NepaliDate(formData.disposalDate).toJsDate();  // Convert Nepali Date to JavaScript Date
      const offsetInMilliseconds = (5 * 60 + 45) * 60 * 1000; // 5 hours and 45 minutes
      const formattedDate = new Date(dateString.getTime() + offsetInMilliseconds);  // Create a new Date object from the dateString

      // Now adjust the date to Kathmandu time zone using moment.js
      const currentDate = moment();
      const dateWithTime = moment.utc(formattedDate).set({
        hour: currentDate.hour(),
        minute: currentDate.minute(),
        second: currentDate.second(),
        millisecond: currentDate.millisecond()
      });
      // Convert the date to Kathmandu time zone (Asia/Kathmandu)
      const kathmanduTime = dateWithTime.tz("Asia/Kathmandu").format('YYYY-MM-DD HH:mm:ss');
      formData.disposalDate = kathmanduTime;
    }

    // validation for indexes
    const { exit, errorMessages } = validateIndexValues(
      formData.documentTypeId,
      this.state.indexValues,
      this.props.allFields.documentTypes
    );
    if (exit) {
      this.setState({ validationErrors: errorMessages });
      return;
    }

    if (formData.checker) {
      formData.checker = [{ userId: formData.checker, isApprover: true }];
    }
    formData.userAccess = this.state.userAccessSelectedOptions;
    formData.tags = this.state.tagsVlaue;
    formData.hasEncryption = this.state.encrytDocument;
    formData.document_index_values = this.state.indexValues;
    formData.hasEncryption = this.state.hasEncryption;
    formData.hasOtp = this.state.hasOtp;
    formData.hasQuickQcr = this.state.hasQuickQcr;
    formData.isArchived = this.state.isArchived;

    addDocument(formData, (err, data) => {
      if (err || !data.success) {
        this.setState({
          validationErrors: err?.response?.data?.data || {},
          isDisabled: false,
        });
        toast.error(err?.response?.data?.message || data.message);
      } else {
        toast.success(data.message);
        this.props.history.push(metaRoutes.documentsView + "?i=" + A.getHash(data.id));
      }
    });
    this.setState({ isDisabled: true });
  };

  // handle tags
  handleChangeTags(value) {
    this.setState({
      tagsVlaue: value,
    });
  }

  handleChangeBokId(id) {
    this.setState({ BOKID: id });
  }

  handleChangeAssociatedBokIds(value) {
    this.setState({
      associatedBokIds: value,
    });
  }

  //handle concate change
  handleChangeConcate = (params) => {
    let concatString = "";
    const concate = { ...this.state.concate, ...params };

    const data = Object.entries(concate);

    data?.map(([key, value], index) => {
      concatString += `${index != 0 && data.length > 1 ? "-" : ""}` + value;
    });

    this.setState({ concatString, concate, documentData: { ...this.state.documentData, otherTitle: concatString } });
  };

  handleChange = (event) => {
    if (event?.length >= 0) {
      return;
    }
    //clear concate on doc type change
    if (event?.target?.name == "documentTypeId") this.setState({ concatString: "" });

    const name = event.target.name;
    let value = event.target.value;
    const { type, checked } = event.target;
    const fieldValue = type === "checkbox" ? checked : value;

    //  used for hiding security level and vice verca.
    switch (name) {
      case "securityLevel":
      case "hierarchy":
        this.setState({
          document: { ...this.state.document, [name]: value },
        });
        break;
      default:
        this.setState((prevState) => ({
          documentData: {
            ...prevState.documentData,
            [name]: fieldValue,
          },
        }));
      // case "checker":
      //   if (this.state.securityLevel == 3)
      //     this.setState({
      //       authorizedUsersSelect: [{ value: value }],
      //     });
    }

    // setting checkboxes for the form
    if (event.target.type === "checkbox") {
      value = event.target.checked;

      switch (name) {
        case "hasEncryption":
          this.setState({ hasEncryption: !this.state.hasEncryption });
          break;
        case "hasOtp":
          this.setState({ hasOtp: !this.state.hasOtp });
          break;
        case "hasQuickQcr":
          this.setState({ hasQuickQcr: !this.state.hasQuickQcr });
          break;
        case "isArchived":
          this.setState({ isArchived: !this.state.isArchived });
          break;

        default:
          this.setState((prevState) => ({
            documentData: {
              ...prevState.documentData,
              [name]: fieldValue,
            },
          }));
          break;
      }
    }

    // assigning in state
    switch (name) {
      case "name":
        this.handleChangeBokId(value);

        break;
      case "documentTypeId":
        this.setState({
          documentTypeId: value,
        });
        break;
      case "hasEncryption":
        const encryption = this.state.encrytDocument;
        this.setState({ encrytDocument: !encryption });
        break;
      case "securityLevel":
        // validate security levels
        const securityLevel = _.find(this.state.securityLevels, (sL) => sL.id === Number(value));
        if (securityLevel) {
          this.setState({
            securityLevelCheck: securityLevel.value,
          });
          // security level is medium then filter users
          if (value == 2) {
            // if (!this.state.document?.departmentId) {
            //   toast.warn("Please select Department");
            //   return;
            // }

            const userProfile = this.props.userProfile;
            const result = this.state.users.filter((user) =>
              userProfile.departmentId
                ? user.departmentId == userProfile?.departmentId
                : user.branchId == userProfile.branchId
            );
            this.setState({ includedCheckers: result });
          } else {
            this.setState({
              includedCheckers: this.state.users,
            });
          }
        } else {
          this.setState({
            securityLevelCheck: 0,
            includedCheckers: this.state.users,
          });
        }
        break;
      case "departmentId":
        if (value === "") {
          this.setState({ includedCheckers: [] });
        } else {
          // filtered user data when selecting security level is Medium
          if (this.state.securityLevelCheck === 2) {
            const result = this.state.users.filter((user) => user.departmentId == value);
            this.setState({ includedCheckers: result });
          } else this.setState({ includedCheckers: this.state.users });
        }

      default:
        this.setState((prevState) => ({
          documentData: {
            ...prevState.documentData,
            [name]: fieldValue,
          },
        }));
        break;
    }
  };

  //handler to change position of the departments in order to create default department for the current user
  defaultDepartmentHandler(from, to, arr) {
    arr?.length == 0 ? (arr = []) : arr?.splice(to, 0, arr?.splice(from, 1)[0]);
  }

  componentDidMount() {
    // extract current user's department id.
    const userDetail = this.props.userProfile;
    // next 2 lines remove isArchived object from the allFields response object as it clashed with the one mentioned in the state above
    let tempAll = this.props.allFields;
    delete tempAll.isArchived;
    this.setState(tempAll, () => {
      const select = [];

      // exclude current user from user list
      const data = this.state.checkerList.filter((user) => user.id !== this.props.userProfile.id);
      this.setState({ users: data, includedCheckers: data });

      // Select only authorized user
      this.state.users.forEach((item) => {
        const department = this.state.departments.filter((d) => (d.id === item.department ? 1 : 0))[0];
        let name;
        if (department) {
          name = item.name + " - " + department.name;
        } else {
          name = item.name;
        }
        const value = { value: item.id, label: name };
        select.push(value);
      });
      this.setState({
        authorizedUsersSelect: select,
      });

      // setting default Security Level to Medium
      const { securityLevels } = this.state;
      if (securityLevels[0]?.id !== 2) {
        this.defaultDepartmentHandler(1, 0, securityLevels);
      }
      this.setState({ securityLevels: securityLevels });
    });

    // setting departments in state according to the user's department
    this.setState({ departments: this.props.allFields.departments }, (res) => {
      const indexIs = this?.state?.departments?.findIndex((dept) => dept.id === userDetail.departmentId);
      const { departments } = this.state;
      this?.defaultDepartmentHandler(indexIs, 0, departments);

      if (departments?.length > 0) {
        this.setState({
          document: {
            ...this.state.document,
            departmentId: departments[0].id,
          },
        });
      }

      this.setState({ departments: departments }, () => { });
    });

    // if (userDetail.id !== 1) {
    //   const locationMaps = this.props.allFields.locationMaps.filter(
    //     (location) => location.branchId == userDetail.branchId
    //   );
    //   this.setState({ locationMaps });
    // }
  }

  handleSelectChange(value, { action, removedValue }) {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue && removedValue.isFixed) {
          return;
        }
        break;
      case "clear":
        value = this.state.authorizedUsersSelect.filter((v) => v.isFixed);
        break;
      default:
        break;
    }
    this.setState({ userAccessSelectedOptions: value });
  }

  setIndexValues = (listValues) => {
    this.setState({
      indexValues: listValues,
    });
  };

  /**
   * This function is for handeling the encryption of the document
   * @param {*} e gets event from the checkbox
   */
  handleEncryptionOfDoc = (e) => {
    const encryption = this.state.encrytDocument;
    this.setState({ encrytDocument: !encryption });
  };

  renderItems() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <LoadingOverlay visible={this.state.isDisabled} />
        <Card className="shadow">
          <CardHeader>
            <Row>
              <Col sm={11}>
                <p className="h5 ">Add Document</p>
              </Col>
              {/* <Col
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
            ></Col> */}
              <Col sm={1} className="d-flex justify-content-end">
                <InfoModal type="document" ModalTitle="Document Field Information"></InfoModal>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <DocumentTypeIndex
              {...this.props}
              setIndexValues={this.setIndexValues}
              handleChange={this.handleChange}
              handleDocumentTypeChange={this.handleChange}
              handleChangeAssociatedBokIds={this.handleChangeAssociatedBokIds}
              documentTypeId={this.state.documentTypeId}
              concateValue={this.handleChangeConcate}
              validationErrors={this.state.validationErrors}
            />
            <DocumentForm
              validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
              // handleSubmit={this.handleSubmit}
              handleChange={this.handleChange}
              handleChangeTags={this.handleChangeTags}
              handleSelectChange={this.handleSelectChange}
              handleEncryptionOfDoc={this.handleEncryptionOfDoc}
              doc={this.state.documentData} // Pass documentData as doc
              {...this.state}
            />
          </CardBody>
          <CardFooter className="d-flex justify-content-end">
            <Button type="button" color="danger" onClick={() => window.history.back()} className="mr-1">
              Cancel
            </Button>
            <Button type="submit" disabled={this.state.isDisabled} color="primary">
              <CustomLoading isLoading={this.state.isDisabled} />
            </Button>
          </CardFooter>
        </Card>
      </Form>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(AddDocument);
