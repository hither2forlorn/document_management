import React, { useState } from "react";
import { Row, Col, TabPane, TabContent, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";
import { getDocument } from "./api";
import A from "config/url";
import _ from "lodash";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import HourlyAccess from "./components/HourlyAccess";
import DocumentInformation from "./components/DocumentInformation";
import DocumentAccessLogs from "./components/DocumentAccessLogs";
import PreviewAttachments from "./components/PreviewAttachments";
import AttachmentListTable from "./components/AttachmentListTable";
import DocumentCheckoutCard from "./components/DocumentCheckoutCard";
import FavouriteList from "./favouriteListTabel";
import metaRoutes from "config/meta_routes";
import query from "querystring";
import OTPVerification from "./components/OTPVerification";
import { banks, dms_features, excludeThisVendor, includeThisFeature, onlyForThisVendor } from "config/bank";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "../Roles/util";
import { Modal, Button, Group } from "@mantine/core";
import { Menu } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import WatermarkSettings from "./WatermarkSettings";
import axios from "axios";
import { addWatermark } from "./api/watermark";
import WatermarkSettingsBasic from "./WatermarkSettingsBasic";

function startLoading() {
  document.getElementById("loading").style.display = "unset";
}

function finishLoading() {
  document.getElementById("loading").style.display = "none";
}

class ViewDocument extends React.Component {
  state = {
    activeTab: this.props.userProfile.roleId == 1 ? "1" : "2",
    isSuperAdmin: this.props.userProfile.roleId == 1 ? true : false,

    documentData: {},
    documentAudits: [],

    attachments: [],
    showInAttachment: [],
    imageAttachments: [],

    documentTypes: [],
    owners: [],
    statuses: [],
    languages: [],
    documentConditions: [],
    makerOrChecker: {},
    options_maker: [],
    departments: [],
    locationMaps: [],
    securityLevel: [],
    isImage: true,
    json: null,
    attachmentId: null,
    associatedBokIds: [],
    otpVerified: false,
    allTags: [],
    watermarkPosition: 1,
    customWatermarkId: null,
    saveSettings: false,
    modal: false,
    defaultWatermarkSettings: false,
  };

  /**
   *
   * @param {*} value otp verified status (either verified or not verified)
   */
  handleVerifyOtp = (value) => {
    this.setState({ otpVerified: value });
  };

  loadDocument = () => {
    startLoading();
    let id = "";
    let type = "";
    try {
      const qs = query.parse(this.props.location.search);
      id = A.getId(qs["?i"]);
      type = qs.type ? qs.type : null;
      A.getId(this.props.match.params.id);
      this.setState.types(type);
    } catch (err) { }
    if (Number(id)) {
      getDocument(type, id, (err, json) => {
        if (type) {
          this.setState({ activeTab: "3" });
        }
        if (err) {
          toast.error("Could not access this document at the moment!");
          this.props.history.push(metaRoutes.documentsList);
        } else {
          if (json.success) {
            const { data, showInAttachment } = json.attachments;
            this.setState({
              documentData: json.data,
              json: json,
              attachments: data || [],
              makerOrChecker: json.makerOrChecker || {},
              options_maker: json.options_maker || [],
              associatedBokIds: json.associatedIds,
              showInAttachment,
              allTags: json.docTags,
            });
          } else {
            toast.error(json.message);
            this.props.history.push(metaRoutes.documentsList);
          }
        }
        finishLoading();
      });
    } else {
      toast.error("Invalid ID!");
      this.props.history.push(metaRoutes.documentsList);
      finishLoading();
    }
  };

  setSelectedAttachmentId = (id) => {
    this.setState({ attachmentId: id });
  };

  componentDidUpdate(prevProps) {
    console.log(this.props.location.search, prevProps.location.search);
    // Typical usage (don't forget to compare props):
    if (this.props.location.search !== prevProps.location.search) {
      this.loadDocument();
    }
  }
  handleModalOpen = () => {
    this.setState({ opened: true });
  };
  handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "documentTypeId") {
      this.setState({
        documentTypeId: value,
      });
    }

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
  };

  formSubmit = (e) => {
    e.preventDefault();

    const getAttachmentId = this.state.attachments?.map((attachment) => attachment.id);
    
    let formData = new FormData();

    // appending form data grabbed from the form component
    formData.append("watermarkText", e.target.watermarkText.value);
    formData.append("watermarkPosition", e.target.watermarkPosition.value || 1);
    formData.append("watermarkImage", e.target.watermarkImage.files[0] || "");
    formData.append("isActive", this.state.defaultWatermarkSettings);
    formData.append("userId", this.props.userProfile.id);
    formData.append("saveSettings", this.state.saveSettings);
    // dummy data for default watermark settings

    addWatermark(formData, (err, data) => {
      if (err) {
        toast.error(err.response.data.message);
      } else {
        const customWatermarkId = data.data;
        this.setState({ customWatermarkId });
      }
    });
    // send data to server

    this.toggle();
  };

  componentDidMount() {
    this.loadDocument();
    this.setState(this.props.allFields);
  }
  handleCustomWatermark = (e) => {
    this.setState({
      watermarkPosition: e.key,
    });
  };
  onCheckboxChange = (e) => {
    console.log(`checked = ${e.target.checked}`);
    this.setState({
      saveSettings: !this.state.saveSettings,
    });
  };

  onDefaultCheckboxChange = (e) => {
    this.setState({
      defaultWatermarkSettings: !this.state.defaultWatermarkSettings,
    });
  };

  toggle = () => this.setState({ modal: !this.state.modal });

  defaultWatermark = () => {
    this.setState({
      defaultWatermarkSettings: true,
    });
  };
  render() {
    const isMaker = this.props.permissions.maker;
    const isChecker = this.props.permissions.checker;
    const p = this.props.permissions || {};
    const showDocumentAccess =
      (p.document === VIEW_EDIT || p.document === VIEW_EDIT_DELETE) && this.state.documentData.isApproved;
    /**
     * for the OTP verification to load JSX of OTP verify modal or the actual document
     */
    if (this.state.documentData.hasOtp && !this.state.otpVerified)
      return <OTPVerification handleVerifyOtp={this.handleVerifyOtp} />;
    else
      return (
        <Row>
          <Col md={4}>
            <DocumentInformation
              isPrimary
              json={this.state.json}
              makerOrChecker={this.state.makerOrChecker}
              documentData={this.state.documentData}
              loadDocument={this.loadDocument}
              permissions={p}
              tags={this.state.allTags}
            />
            <FavouriteList isPrimary documentData={this.state.documentData} permissions={p} />
          </Col>
          <Col md={8} className="watermark-columns">
            {isMaker && includeThisFeature(dms_features.BASIC_WATERMARK) ? (
              <WatermarkSettingsBasic
                handleCustomWatermark={(e) => this.handleCustomWatermark(e)}
                watermarkPosition={this.state.watermarkPosition}
                customWatermarkId={this.state.customWatermarkId}
              />
            ) : (
              <WatermarkSettings
                saveSettings={this.state.saveSettings}
                defaultWatermarkSettings={this.state.defaultWatermarkSettings}
                onDefaultCheckboxChange={this.onDefaultCheckboxChange}
                defaultWatermark={this.defaultWatermark}
                toggle={this.toggle}
                modal={this.state.modal}
                onCheckboxChange={this.onCheckboxChange}
                handleCustomWatermark={(e) => this.handleCustomWatermark(e)}
                watermarkPosition={this.state.watermarkPosition}
                formSubmit={this.formSubmit}
              />
            )}
            <PreviewAttachments
              isActive={this.state.saveSettings}
              customWatermarkId={this.state.customWatermarkId}
              setSelectedAttachmentId={this.setSelectedAttachmentId}
              attachments={this.state.attachments}
              permissions={p}
              isDeleted={this.state.isDeleted}
              type={this.state.type}
              watermarkPosition={this.state.watermarkPosition}
            />
          </Col>
          <Col md={12}>
            <AttachmentListTable
              isPrimary
              isActive={this.state.saveSettings}
              customWatermarkId={this.state.customWatermarkId}
              isOpened={this.state.opened}
              watermarkPosition={this.state.watermarkPosition}
              documentData={this.state.documentData}
              makerOrChecker={this.state.makerOrChecker}
              options_maker={this.state.options_maker}
              attachments={this.state.attachments}
              showInAttachment={this.state.showInAttachment}
              associatedBokIds={this.state.associatedBokIds}
              documentTypes={this.state.documentTypes}
              permissions={p}
              documentId={this.state.documentData.id}
              loadDocument={this.loadDocument}
              handleModalOpen={this.handleModalOpen}
              afterDelete={() => this.setState({ isDeleted: true })}
            />
          </Col>
          <Col className="my-3" md={12}>
            <Nav tabs>
              {this.state.isSuperAdmin && (
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === "1",
                    })}
                    onClick={() => this.setState({ activeTab: "1" })}
                  >
                    Audit Logs
                  </NavLink>
                </NavItem>
              )}
              <NavItem>
                {/* <NavLink
                  className={classnames({
                    active: this.state.activeTab === "2",
                  })}
                  onClick={() => this.setState({ activeTab: "2" })}
                >
                  Checkout Logs
                </NavLink> */}
              </NavItem>
              {showDocumentAccess && (
                <NavItem>
                  <NavLink
                    className={classnames({
                      active: this.state.activeTab === "3",
                    })}
                    onClick={() => this.setState({ activeTab: "3" })}
                  >
                    Hourly Access
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              {this.state.isSuperAdmin && (
                <TabPane tabId="1">
                  <DocumentAccessLogs documentData={this.state.documentData} />
                </TabPane>
              )}
              {/* <TabPane tabId="2">
                <DocumentCheckoutCard
                  loadDocument={this.loadDocument}
                  documentId={this.state.documentData.id}
                  checkoutInfos={this.state.documentData.document_checkouts}
                />
              </TabPane> */}
              {showDocumentAccess && (
                <TabPane tabId="3">
                  <HourlyAccess
                    {...this.props}
                    selectedAttachmentId={this.state.attachmentId}
                    type={this.state.types}
                    documentData={this.state.documentData}
                    loadDocument={this.loadDocument}
                    attachments={this.state.attachments}
                  />
                </TabPane>
              )}
            </TabContent>
          </Col>
        </Row>
      );
  }
}

export default connect((state) => ({
  allFields: state.allFields,
  userProfile: state.userProfile,
}))(ViewDocument);
