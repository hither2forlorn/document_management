import React from "react";
import { editDocument, getDocument } from "./api";
import A from "config/url";
import _ from "lodash";
import DocumentForm from "./DocumentForm";
import { connect } from "react-redux";
import query from "querystring";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import { Card, CardHeader, Row, Col, Input, Label, Form, Button, CardBody } from "reactstrap";
import DocumentTypeIndex from "./DocumentTypeIndex";
import { editDocumentIndexValue } from "./api/documentIndexValue";

class EditDocument extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadSelect = this.loadSelect.bind(this);
    this.loadIndexList = this.loadIndexList.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeTags = this.handleChangeTags.bind(this);
  }

  state = {
    document: {},
    documentData: {},
    documentTypes: [],
    languages: [],
    documentConditions: [],
    statuses: [],
    locationMaps: [],
    departments: [],
    users: [],
    securityLevels: [],
    yesNo: ["Yes", "No"],
    docTags: [],
    securityLevelCheck: 0,
    authorizedUsersSelect: [],
    userAccessSelectedOptions: [],
    indexValues: [],
    validationErrors: {},
    tagsValue: [],
    hasEncryption: false,
    hasOtp: false,
    hasQuickQcr: false,
    isArchived: false,
    concate: {},
    concatString: "",
    userGroup: [],
  };
  //handle concate change
  handleChangeConcate = (params) => {
    let concatString = "";
    const concate = { ...this.state.concate, ...params };

    const data = Object.entries(concate);

    data.map(([key, value], index) => {
      concatString += `${index != 0 && data.length > 1 ? "-" : ""}` + value;
    });

    this.setState({
      concatString,
      concate,
      documentData: { ...this.state.documentData, otherTitle: concatString },
    });
  };

  handleChange = (event) => {
    if (event?.length >= 0) return;
    const name = event.target.name;
    let value = event.target.value;

    //clear concate on doc type change
    if (event?.target?.name == "documentTypeId") this.setState({ concatString: "" });

    this.setState({
      document: { ...this.state.document, [name]: value },
    });

    const doc = this.state.documentData;
    doc.userAccess = this.state.userAccessSelectedOptions;
    doc[name] = value;

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
      }
    } else {
      this.setState({ [name]: value });
    }

    this.setState(
      {
        documentData: doc,
      },
      () => {
        if (name === "securityLevel") {
          const securityLevel = _.find(this.state.securityLevels, (sL) => sL.id === Number(value));

          if (securityLevel) {
            this.setState({
              securityLevelCheck: securityLevel.value,
            });
          } else {
            this.setState({
              securityLevelCheck: 0,
            });
          }
        }
      }
    );
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (window.confirm("Do you want to update the document?")) {
      const documentData = this.state.documentData;
      documentData.userAccess = this.state.userAccessSelectedOptions;
      // settingup the tags value
      documentData.tags = this.state.tagsValue;
      // console.log(this.state.indexValues);
      // if (this.state.indexValues.length > 0) {
      //   documentData.document_index_values.map((col, ids) => {
      //     col.value = this.state.indexValues[ids].name;
      //   });
      // }
      documentData.document_index_values = this.state.indexValues;
      documentData.hasEncryption = this.state.hasEncryption;
      documentData.hasOtp = this.state.hasOtp;
      documentData.hasQuickQcr = this.state.hasQuickQcr;
      documentData.isArchived = this.state.isArchived;
      editDocument(documentData, (err, json) => {
        // console.log(json);
        if (err) {
          this.setState({
            validationErrors: err.response.data.data,
          });
          toast.error(err.response.data.message);
        } else if (!json?.success) {
          toast.error(json?.message);
        } else {
          // {
          toast.success(json.message);
          {
            /*
              old code which led back to the View Document page no matter where the user came from
          */
          }
          // this.props.history.push(
          //   metaRoutes.documentsView +
          //     "?i=" +
          //     A.getHash(this.state.documentData.id)
          // );

          {
            /*
            redirect the user back to the preious route whether it be in the Document List or View Document
          */
          }

          window.history.back();

          // } else {
          //   toast.warn(json.message);
          // }
        }
      });
    }
  };

  loadSelect() {
    const userAccess = this.state.documentData.document_access_users;
    const select = [];
    const selectedOptions = [];
    this.state.users.forEach((item) => {
      const department = this.state.departments.filter((d) => (d.id === item.departmentId ? 1 : 0))[0];
      let name;
      if (department) {
        name = item.name + " - " + department.name;
      } else {
        name = item.name;
      }
      const value = { value: item.id, label: name };
      if (userAccess.length !== selectedOptions.length) {
        userAccess.forEach((item) => {
          if (item.userId === value.value) {
            selectedOptions.push(value);
          }
        });
      }
      select.push(value);
    });
    this.setState({
      authorizedUsersSelect: select,
      userAccessSelectedOptions: selectedOptions,
    });
  }

  loadIndexList() {
    this.state.indexListData.map((element) => {
      this.state.indexTypeData.map((ele) => {
        if (element.documentIndexId === ele.id) {
          return (
            <>
              <Label>{ele.label}</Label>
              <Input type="text" value={element.value} />
            </>
          );
        }
      });
    });
  }

  componentDidMount() {
    const qs = query.parse(this.props.location.search);
    const id = A.getId(qs["?i"]);
    this.setState(this.props.allFields);
    getDocument("", Number(id), (err, json) => {
      if (err) {
        this.props.history.push(metaRoutes.documentsList);
        return;
      }
      if (json.success) {
        this.setState(
          {
            securityLevelCheck: json.data.securityLevel,
            documentData: json.data,
            docTags: json.docTags || [],
            indexListData: json.data.document_index_values,
            indexTypeData: json.data.document_indices,
            hasEncryption: json.data.hasEncryption,
            hasOtp: json.data.hasOtp,
            hasQuickQcr: json.data.hasQuickQcr,
            isArchived: json.data.isArchived,
            // userGroup: json.data.userGroup,
          },
          () => {
            this.loadSelect();
          }
        );
      } else {
        window.alert("Unsuccessful! Not allowed to access this document.");
        window.location.back();
      }
    });
  }

  handleSelectChange(value, { action, removedValue }) {
    switch (action) {
      case "remove-value":
      case "pop-value":
        if (removedValue.isFixed) {
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

  // handle tags
  handleChangeTags(value) {
    this.setState({
      tagsValue: value,
    });
  }

  setIndexValues = (listValues) => {
    this.setState({
      indexValues: listValues,
    });
  };

  renderItems() {
    return (
      <Card className="shadow">
        <Form onSubmit={this.handleSubmit}>
          <CardHeader>
            <p className="h5">
              <i className="fa fa-pencil" /> Edit Document
            </p>
          </CardHeader>
          <CardBody>
            {this.state.documentData && (
              <>
                <DocumentTypeIndex
                  {...this.props}
                  setIndexValues={this.setIndexValues}
                  handleDocumentTypeChange={this.handleChange}
                  documentTypeId={this.state.documentData.documentTypeId}
                  concateValue={this.handleChangeConcate}
                  indexValues={this.state.documentData.document_index_values}
                />
                <DocumentForm
                  validationErrors={this.state.validationErrors ? this.state.validationErrors : null}
                  handleChange={this.handleChange}
                  handleChangeTags={this.handleChangeTags}
                  handleSelectChange={this.handleSelectChange}
                  isEdit
                  {...this.state}
                  {...this.props}
                />
              </>
            )}
            <div className="dropdown-divider"></div>
            <div className="text-right">
              <Button type="submit" color="primary">
                Update
              </Button>
            </div>
          </CardBody>
        </Form>
      </Card>
    );
  }

  render() {
    return this.renderItems();
  }
}

export default connect((state) => ({ allFields: state.allFields }))(EditDocument);
