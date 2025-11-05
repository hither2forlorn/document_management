import React, { useState } from "react";
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Card, CardHeader, Row, CardBody, Col } from "reactstrap";
import _ from "lodash";

import FileViewer from "react-file-viewer"; //FILE VIEWER
import Viewer from "react-viewer"; //IMAGE VIEWER
import { previewAttachment } from "../api/attachment";
import { connect } from "react-redux";
import { SERVER_URL } from "admin/config/server";

const PreviewAttachments = (props) => {
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
          const filePath = SERVER_URL + json.filePath;
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

  return (
    <Card className="shadow">
      <CardHeader>
        <Row>
          <Col>
            <i className="fa fa-file" /> Preview
          </Col>
          <Col>
            <Dropdown
              isOpen={state.isDropdownOpen}
              toggle={() => setState({ ...state, isDropdownOpen: !state.isDropdownOpen })}
            >
              <DropdownToggle caret>Select Files</DropdownToggle>
              <DropdownMenu
                style={{
                  zIndex: 1020,
                  maxHeight: 300,
                  maxWidth: 200,
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                {attachments.map((row, index) => {
                  if (!row.fileType.includes("image")) {
                    return (
                      <DropdownItem
                        key={index}
                        title={row.name}
                        // style={{ width: '200px', textOverflow: 'wrap' }}
                        onClick={() => previewFile(row.id)}
                      >
                        {row.name}
                      </DropdownItem>
                    );
                  } else {
                    return null;
                  }
                })}
              </DropdownMenu>
            </Dropdown>
          </Col>
          <Col>
            <span
              className="float-right"
              onClick={() => {
                setState({ ...state, isImage: !state.isImage });
              }}
              style={{
                border: "1px solid",
                padding: 5,
                whiteSpace: "nowrap",
                cursor: "pointer",
                margin: 3,
              }}
            >
              <i className="fa fa-cog" />
              Preview Images
            </span>
          </Col>
        </Row>
      </CardHeader>
      {/* HEADING END */}
      <CardBody className="w-100">
        <div id="other-preview-container" style={{ display: state.isImage ? "none" : "block" }}>
          {state.isPDF && state.previewFilePath ? (
            <embed
              src={state.previewFilePath + "#toolbar=" + String(p.download && p.print ? 1 : 0)}
              type="application/pdf"
              width="100%"
              height="400px"
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
            height: 400,
            width: "100%",
            textAlign: "center",
            alignContent: "center",
            display: state.isImage ? "block" : "none",
          }}
        >
          {imageAttachments.length !== 0 ? (
            <Viewer
              // noImgDetails
              noClose
              onClose={() => setState({ ...state, isImage: false })}
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
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
};

export default connect((state) => ({
  user: state.userProfile,
}))(PreviewAttachments);
