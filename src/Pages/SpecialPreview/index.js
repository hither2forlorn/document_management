import { server, SERVER_URL } from "admin/config/server";

import React, { useEffect, useState } from "react";
import qs from "querystring";
import FileViewer from "react-file-viewer"; //FILE VIEWER
import moment from "moment";
import _ from "lodash";
import Viewer from "react-viewer"; //IMAGE VIEWER
import { Dropdown, DropdownMenu, DropdownItem, DropdownToggle, Container, Card, CardHeader, Row, Col } from "reactstrap";
import {
  previewAttachment,
  previewOneAttachment,
  attachmentofMultipleHourlyAccess,
  attachmentofMultipleHourlyAccessQuery,
} from "./api";
import { toast } from "react-toastify";
import { downloadAttachment, getDocument } from "admin/views/DocumentManagement/api";
import { useQuery } from "react-query";
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { PDFViewer } from "react-view-pdf";

const SpecialPreview = (props) => {
  const token = qs.parse(props.location.search);
  const tokenValue = token["?token"];
  let type = token["type"];
  let attachId = token["attachId"];
  let hourlyAccesId = token["hourlyAccesId"];
  const [attachments, setAttachments] = useState([]);
  const [hideImageAfterExpiry, setHideImageAfterExpiry] = useState(false);
  const imageAttachments = _.filter(attachments ? attachments : [], (att) => att.fileType.includes("image"));

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
      previewOneAttachment({ id, token: tokenValue, hourlyAccesId }, (err, json) => {
        if (err) return;
        if (json.success) {
          const fileType = getFileType(json.fileType);
          const filePath = SERVER_URL + "/" + json.filePath;
          setState({
            ...state,
            previewFileType: fileType,
            previewFilePath: filePath,
            isPDF: fileType === "pdf" || fileType === "PDF" || fileType === "txt",
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
  const fetchData = async () => {
    const response = await attachmentofMultipleHourlyAccessQuery(hourlyAccesId);
    console.log(response);
    if (!response.success) {
      setHideImageAfterExpiry(true);
      toast.error(response.message);
    } else {
      setAttachments(response.data.attachments);
    }
    return data;
  };
  const { data } = useQuery("hourly_access_data", () => fetchData(hourlyAccesId));

  // const hourlyAccessPreview = () => {
  //   attachmentofMultipleHourlyAccess(hourlyAccesId, (err, data) => {
  //     if (err) {
  //       console.log(err, "data");
  //     }
  //     if (data.success) {
  //       setAttachments(data.data.attachments ? data.data.attachments : []);
  //       toast.success("Success!");
  //     } else {
  //       toast.error(data.data.message);
  //     }
  //     // setAttachments(data);
  //   });
  // };

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
          const downloadLink = SERVER_URL + "/" + json.file;
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = downloadLink;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          toast.warn(json.message);
        }
        finishLoading();
      });
    }
  };

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
            <Col md={3}>
              <span
                className="float-right pt-2"
                onClick={() => {
                  setState({ ...state, isImage: !state.isImage });
                }}
              >
                <i className="fa fa-cog pr-1" />
                Preview Images
              </span>
            </Col>
          </Row>
        </CardHeader>
        <div className="component-content-container">
          <div id="other-preview-container" style={{ display: state.isImage ? "none" : "block" }}>
            {state.isPDF && state.previewFilePath ? (
              <PDFViewer url={state.previewFilePath} />
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
                  visible={!hideImageAfterExpiry ? state.isImage : false}
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
