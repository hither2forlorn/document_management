import React, { useState } from "react";
import { Progress, Card, CardHeader, CardBody, Table } from "reactstrap";
import { downloadAttachment } from "../api/attachment";
import { server, SERVER_URL } from "client/config/server";
import { toast } from "react-toastify";

const AttachmentListTable = (props) => {
  const attachments = props.attachments;
  const isPrimary = props.isPrimary;
  const [state, setState] = useState({
    loading: null,
    selectedFiles: [],
  });
  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }
  const onSelectedFile = (event) => {
    setState({
      ...state,
      selectedFiles: event.target.files,
    });
  };

  const downloadFile = (id) => {
    const p = props.permissions;
    if (p.download) {
      if (window.confirm("Do you want to download the file?")) {
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
    } else {
      window.alert("Not allowed to download the file!");
    }
  };

  const deleteFile = (id) => {
    toast.warn("You cannot delete the file");
    // if (window.confirm("Do you want to delete the file?")) {
    //   deleteAttachment(id, (err, json) => {
    //     if (!err && json && json.success) {
    //       toast.success("Success!");
    //       props.loadMemo();
    //     } else {
    //       toast.error("Error occurred!");
    //     }
    //   });
    // }
  };

  const uploadFile = (fileType) => {
    if (state.selectedFiles.length > 0) {
      const data = new FormData();
      data.append("fileType", fileType);
      data.append("itemId", props.memoId);
      data.append("itemType", "memo");
      for (var file in state.selectedFiles) {
        data.append("file", state.selectedFiles[file]);
      }
      setState({
        ...state,
        loading: 0,
      });
      server
        .post("/client/attachment", data, {
          onUploadProgress: (progressEvent) => {
            const percentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100));
            setState({
              loading: percentage,
            });
          },
        })
        .then((res) => {
          props.loadMemo();
          setState({
            ...state,
            selectedFiles: [],
            loading: null,
          });
        })
        .catch((err) => {
          setState({
            ...state,
            selectedFiles: [],
            loading: null,
          });
        });
    } else {
      toast.warn("No files selected!");
    }
  };
  return (
    <Card className="mb-2">
      {/* HEADING START */}
      <CardHeader>
        <i className="fa fa-file" /> Attachments
      </CardHeader>
      {/* HEADING END */}
      <CardBody>
        <Table responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size(in KB)</th>
              <th>Modified</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attachments.map((row) => (
              <tr key={row.id}>
                {isPrimary ? (
                  <td style={{ color: "#00e", cursor: "pointer" }} onClick={() => downloadFile(row.id)}>
                    {row.name}
                  </td>
                ) : (
                  <td>{row.name}</td>
                )}
                <td>{row.fileType}</td>
                <td>{row.size}</td>
                <td>{new Date(row.updatedAt).toDateString()}</td>
                {isPrimary ? (
                  <td style={{ cursor: "pointer" }} onClick={() => deleteFile(row.id)}>
                    <i className="fa fa-trash" />
                  </td>
                ) : (
                  <td></td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        {isPrimary ? (
          <>
            <div className="custom-file mb-4" style={{ zIndex: 0 }}>
              <input
                onChange={onSelectedFile}
                multiple
                type="file"
                className="custom-file-input"
                name="file"
                id="file"
                aria-describedby="inputGroupFileAddon01"
              />
              <label style={{ cursor: "pointer" }} className="custom-file-label" id="file-label" htmlFor="file">
                {state.selectedFiles && state.selectedFiles.length !== 0
                  ? Object.values(state.selectedFiles).map((file) => file.name + ", ")
                  : "Choose a file..."}
              </label>
            </div>
            {state.loading !== null ? <Progress id="progress-bar" value={state.loading} /> : null}
            <div className="component-button-container">
              <button onClick={() => uploadFile()}>
                <i className="fa fa-check" />
                Upload
              </button>
            </div>
          </>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default AttachmentListTable;
