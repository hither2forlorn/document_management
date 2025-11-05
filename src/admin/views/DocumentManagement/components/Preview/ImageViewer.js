import { SERVER_URL } from "admin/config/server";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Viewer from "react-viewer";
import NoFileSelected from "./NoFileSelected";
import _ from "lodash";

export default function ImageViewer({ imageAttachments, selectedFileId, state, p }) {
  const user = useSelector((state) => state.userProfile);
  const [container, setContainer] = useState(null);

  useEffect(() => {
    setContainer(document.getElementById("image-preview-container"));
  }, []);

  const selectedImage = imageAttachments.find((att) => att.id === selectedFileId);

  return (
    <div
      id="image-preview-container"
      style={{
        height: '618px',
        width: "100%",
        textAlign: "center",
        alignContent: "center",
        display: state.isImage ? "block" : "none",
      }}
    >
      {selectedImage ? (
        <div>
          {/* Watermark details */}
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
            {user.username}
          </span>
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
            downloadable={p.download}
            container={container}
            visible={state.isImage}
            images={[
              {
                src: SERVER_URL + selectedImage.filePath,
                alt: selectedImage.name,
              },
            ]}
            style={{
              zIndex: -1,
            }}
          />
        </div>
      ) : (
        <NoFileSelected />
      )}
    </div>
  );
}
