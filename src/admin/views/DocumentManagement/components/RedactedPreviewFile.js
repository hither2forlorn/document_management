import React, { useState, useEffect } from "react";
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Card, CardHeader, Row, Col } from "reactstrap";
import _ from "lodash";

import FileViewer from "react-file-viewer"; //FILE VIEWER
import Viewer from "react-viewer"; //IMAGE VIEWER
import { previewAttachment } from "../api";
import moment from "moment";
import { connect } from "react-redux";
import { SERVER_URL } from "admin/config/server";

const RedactedPreviewFile = (props) => {
  const p = props.permissions;
  const attachments = props.attachments;
  const imageAttachments = _.filter(
    attachments ? attachments : [],
    (att) => att.fileType.includes("image") && !att.isCompressed && !att.isEncrypted
  );
  const [state, setState] = useState({
    previewFileType: null,
    previewFilePath: null,
    isPDF: true,
    isImage: true,
    isDropdownOpen: false,
  });
  const getFileType = (type) => {
    type = type.toLowerCase();
    switch (type) {
      case "jpg":
        type = "jpeg";
        break;
      default:
        break;
    }
    return type;
  };

  const previewFile = (id) => {
    if (id) {
      previewAttachment(id, (err, json) => {
        if (err) return;
        if (json.success) {
          const fileType = getFileType(json.fileType);
          const filePath = SERVER_URL + "/" + json.filePath;
          setState({
            ...state,
            previewFileType: fileType,
            previewFilePath: filePath,
            isPDF: fileType === "pdf",
            isImage: false,
            isDropdownOpen: false,
          });
        } else {
          window.alert(json.message);
        }
      });
    } else {
      setState({
        ...state,
        isImage: true,
      });
    }
  };

  useEffect(() => {
    setState({
      previewFileType: null,
      previewFilePath: null,
      isPDF: true,
      isImage: true,
      isDropdownOpen: false,
    });
  }, [props.isDeleted]);

  return (
    <Card className="shadow">
      <CardHeader>
        <Row>
          <Col md={4} className="pt-2">
            <i className="fa fa-file pr-1" /> Preview
          </Col>
          <Col md={4} className="text-center">
            <Dropdown
              isOpen={state.isDropdownOpen}
              toggle={() => setState({ ...state, isDropdownOpen: !state.isDropdownOpen })}
            >
              <DropdownToggle caret>Select Files</DropdownToggle>
              <DropdownMenu
                style={{
                  zIndex: 1020,
                  //   maxHeight: 300,
                  //Width: 200,
                  //   // overflowY: "auto",
                  //   // overflowX: "hidden",
                }}
              >
                {attachments.map((row, index) => {
                  if (!row.redaction) {
                    if (!row.fileType.includes("image")) {
                      return (
                        <DropdownItem
                          className="flex-wrap"
                          key={index}
                          title={row.name}
                          // style={{ width: '200px'}}
                          onClick={() => previewFile(row.id)}
                        >
                          <small>{row.name}</small>
                        </DropdownItem>
                      );
                    } else {
                      return null;
                    }
                  }
                })}
              </DropdownMenu>
            </Dropdown>
          </Col>
          <Col md={4}>
            <span
              className="float-right pt-2"
              onClick={() => {
                setState({ ...state, isImage: !state.isImage });
              }}
              // style={{
              //   border: "1px solid",
              //   padding: 5,
              //   whiteSpace: "nowrap",
              //   cursor: "pointer",
              //   margin: 3,
              //   float: "right",
              // }}
            >
              <i className="fa fa-cog pr-1" />
              Preview Images
            </span>
          </Col>
        </Row>
      </CardHeader>

      {/* HEADING END */}
      <div className="component-content-container">
        <div id="other-preview-container" style={{ display: state.isImage ? "none" : "block" }}>
          {state.isPDF && state.previewFilePath ? (
            <embed
              src={state.previewFilePath + "#toolbar=" + String(p.download ? 1 : 0)}
              type="application/pdf"
              width="100%"
              height="630px"
            />
          ) : (
            <FileViewer
              fileType={state.previewFileType}
              filePath={state.previewFilePath}
              errorComponent={<div>Error!</div>}
              onError={() => {}}
            />
          )}
        </div>
        <div
          id="image-preview-container"
          style={{
            height: 630,
            width: "100%",
            textAlign: "center",
            alignContent: "center",
            display: state.isImage ? "block" : "none",
          }}
        >
          {imageAttachments.length !== 0 ? (
            <>
              <span
                style={{
                  opacity: "60%",
                  position: "absolute",
                  left: "10%",
                  top: "78%",
                  textAlign: "left",
                  zIndex: 1010,
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "1.2em",
                }}
              >
                {props.user.username}
              </span>
              <span
                style={{
                  opacity: "60%",
                  position: "absolute",
                  left: "78%",
                  top: "78%",
                  textAlign: "left",
                  // verticalAlign: 'middle',
                  zIndex: 1010,
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "1em",
                }}
              >
                {moment().format("YYYY-MM-DD HH:mm")}
              </span>
              <Viewer
                // noImgDetails
                noClose
                downloadable={p.download}
                container={document.getElementById("image-preview-container")}
                visible={state.isImage}
                images={_.map(imageAttachments, (att) => {
                  return {
                    src: SERVER_URL + att.filePath,
                    alt: att.name,
                  };
                })}
              />
            </>
          ) : null}
        </div>
      </div>
      {/* </div> */}
    </Card>
  );
};

export default connect((state) => ({
  user: state.userProfile,
}))(RedactedPreviewFile);
