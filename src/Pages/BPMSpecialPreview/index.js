import { server, SERVER_URL } from "admin/config/server";

import React, { useEffect, useState } from "react";
import qs from "querystring";
import FileViewer from "react-file-viewer"; //FILE VIEWER
import moment from "moment";
import _ from "lodash";
import Viewer from "react-viewer"; //IMAGE VIEWER
import { Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Container, Card, CardHeader, Row, Col } from "reactstrap";
import { previewAttachment } from "./api";
import { toast } from "react-toastify";
import { downloadAttachment, getDocument } from "admin/views/DocumentManagement/api";
import A from "config/url";
import download from "downloadjs";

const SpecialPreview = (props) => {
  const token = qs.parse(props.location.search);
  const tokenValue = token["?token"];
  let type = token["type"];
  let attachId = token["attachId"];
  attachId = A.getId(attachId);
  const [attachments, setAttachments] = useState([]);
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

  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }

  const downloadFile = (id) => {
    if (window.confirm("Dow you want to download the file?")) {
      startLoading();
      downloadAttachment(id, (err, json) => {
        if (json.success) {
          const downloadLink = SERVER_URL + json.file;
          if (downloadLink.includes("JPG") || downloadLink.includes("jpg")) {
            download(downloadLink);
          } else {
            const link = document.createElement("a");
            link.style.display = "none";
            link.href = downloadLink;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          toast.warn(json.message);
        }
        finishLoading();
        props.loadDocument();
        finishLoading();
      });
    }
  };

  useEffect(() => {
    server
      .get(`/bpm-doc-preview`, {
        params: { type, attachId: 8044 },
      })
      .then((data) => {
        if (data.data.success) {
          setAttachments(data.data.data.attachments ? data.data.data.attachments : []);
        } else if (!data.data.success) {
          toast.error(data.data.message);
        }
      })
      .catch((err) => {
        toast.error("Error!!");
      });
  }, []);

  return (
    <Container>
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
                  }}
                >
                  {attachments.map((row, index) => {
                    if (!row.fileType.includes("image")) {
                      return (
                        <DropdownItem className="flex-wrap" key={index} title={row.name} onClick={() => previewFile(row.id)}>
                          <small>{row.name}</small>
                        </DropdownItem>
                      );
                    } else {
                      return null;
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
            {/* <Col md={1}>
              {attachments.map((row) => (
                <>
                  <span
                    className="float-right pt-2"
                    onClick={() => downloadFile(row.id)}
                    style={{
                      padding: 5,
                      cursor: "pointer",
                    }}
                  >
                    <i className="fas fa-file-download"></i>
                  </span>
                </>
              ))}
            </Col> */}
          </Row>
        </CardHeader>
        <div className="component-content-container">
          <div id="other-preview-container" style={{ display: state.isImage ? "none" : "block" }}>
            {state.isPDF && state.previewFilePath ? (
              <embed
                src={state.previewFilePath + "#toolbar=" + String(0)}
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
                ></span>
                <span
                  style={{
                    opacity: "60%",
                    position: "absolute",
                    left: "78%",
                    top: "78%",
                    textAlign: "left",
                    zIndex: 1010,
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "1em",
                  }}
                >
                  {moment().format("YYYY-MM-DD HH:mm")}
                </span>
                <Viewer
                  noClose
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
      </Card>
    </Container>
  );
};

export default SpecialPreview;
