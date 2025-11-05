import React, { useState, useEffect } from "react";
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, Card, CardHeader, Row, Col } from "reactstrap";
import _ from "lodash";

import FileViewer from "react-file-viewer"; //FILE VIEWER
import Viewer from "react-viewer"; //IMAGE VIEWER
import { previewAttachment } from "../api";
import moment from "moment";
import { connect } from "react-redux";
import { SERVER_URL } from "admin/config/server";
import { toast } from "react-toastify";
import NoFileSelected from "./Preview/NoFileSelected";
import ImageViewer from "./Preview/ImageViewer";
import HeaderPreview from "./Preview/HeaderPreview";
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import FilePreview from "./Preview/FilePreview";
import { Spin } from "antd";
import { Select, Space } from "antd";
import { watermarkValues } from "admin/views/Util/constantWatermarkValues";
import { Menu } from "antd";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";

const PreviewAttachments = (props) => {
  const p = props.permissions;
  const [loading, setLoading] = useState(false);
  // show single attachment.
  let attachments = props.attachment ? props.attachments.filter((row) => row.id === props.attachId) : props.attachments;
  // remove file type parent=> only for indexes.
  attachments = attachments?.filter((attach) => attach.fileType != "parent");
  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  const items = [
    getItem("", "sub1", <SettingOutlined />, [
      getItem(
        "Select Watermark Position",
        null,
        null,
        [
          getItem("Center(default)", "1"),
          getItem("Top Right", "2"),
          getItem("Top Left", "3"),
          getItem("Bottom Right", "4"),
          getItem("Bottom Left", "5"),
          getItem("Diagonal", "6"),
        ],
        "group"
      ),
    ]),
  ];

  const imageAttachments = _.filter(attachments || [], (att) => att.fileType.includes("image"));
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
      case "jpeg":
        return "jpeg";
      case "png":
        return "png";
      case "gif":
        return "gif";
      case "bmp":
        return "bmp";
      case "tiff":
        return "tiff";
      case "jfif":
        return "jfif";
      case "svg":
        return "svg+xml";
      default:
        return type;
    }
  };

  const previewFile = (id) => {
    // For hourly access
    let cw = props.customWatermarkId ? props.customWatermarkId : props.watermarkPosition;
    props.setSelectedAttachmentId(id);
    setLoading(true);

    if (id) {
      previewAttachment(id, cw, (err, json) => {
        if (err) {
          console.error("Error in previewAttachment:", err);
          toast.error("Error fetching attachment details");
          setLoading(false);
          return;
        }

        if (json.success) {
          const fileType = getFileType(json.fileType);
          const isImage = ["jpeg", "png", "gif", "bmp", "tiff", "svg+xml"].includes(fileType); // Update image types
          const filePath = SERVER_URL + "/" + json.filePath;

          setState((prevState) => ({
            ...prevState,
            previewFileType: fileType,
            previewFilePath: filePath,
            isPDF: fileType === "pdf" || fileType === "PDF" || fileType === "txt",
            isImage: isImage,
            isDropdownOpen: false,
            selectedFileId: id, // Track the selected file ID
          }));
          setLoading(false);
        } else {
          toast.error(json.message || "Failed to preview the file.");
          setLoading(false);
        }
      });
    } else {
      setState((prevState) => ({
        ...prevState,
        isImage: true,
        selectedFileId: null, // Reset selected ID if no file
      }));
    }
  };

  const handleCustomWatermark = (e) => {
    setCustomWatermarkValue(e.key);
  };
  useEffect(() => {
    // show pdf if there is no image
    if (attachments.length > 0 && imageAttachments == 0) {
      previewFile(attachments[0]?.id);
    }
    // set default attachment if it not
    setState({
      previewFileType: null,
      previewFilePath: null,
      isPDF: true,
      isImage: true,
      isDropdownOpen: false,
    });
    // props.attachment && previewFile(props?.attachId);
  }, [props.isDeleted]);

  return (
    <Card className="shadow">
      <CardHeader className="card-wrapper">
        <HeaderPreview setState={setState} state={state} attachments={attachments} previewFile={previewFile} />
      </CardHeader>
      {/* HEADING END */}
      {loading ? (
        <div
          className="component-content-container"
          style={{
            textAlign: "center",
            height: "450px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </div>
      ) : (
        <div className="component-content-container" >
          {/*  File Preview */}
          <FilePreview state={state} p={p} />

          {/* image preview */}
          <ImageViewer
            imageAttachments={imageAttachments}
            selectedFileId={state.selectedFileId} // Pass selected file ID
            state={state}
            p={p}
          />        
          </div>
      )}
      {/* </div> */}
    </Card>
  );
};

export default connect((state) => ({
  user: state.userProfile,
}))(PreviewAttachments);
