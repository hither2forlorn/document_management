import React, { useEffect, useState } from "react";
import {
  Progress,
  Card,
  CardHeader,
  CardBody,
  Table,
  CardFooter,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

import { downloadAttachment, deleteAttachment } from "../api/attachment";
import { server } from "admin/config/server";
import { toast } from "react-toastify";
import { SERVER_URL } from "admin/config/server";
import { Row, Col } from "reactstrap";
import Pagination from "@mui/lab/Pagination";
import { useSelector, connect } from "react-redux";
import { Link } from "react-router-dom";

import { getAttachmentsPaginate } from "admin/views/DocumentManagement/api/attachment";
import PreviewAttachments from "./PreviewAttachments";

import metaRoutes from "config/meta_routes";
import A from "config/url";
import { FormControl, MenuItem, Select } from "@mui/material";
import { setDocLimitDocumentNumber } from "redux/actions/documentAc";

const AttachmentListTable = (props) => {
  const [modal, setModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const limit = useSelector((state) => state.docLimitDocumentNumber);

  const handleChange = (event) => {
    props.dispatch(setDocLimitDocumentNumber(event.target.value));
  };

  const setSelectedAttachmentId = (id) => {
    setSelectedAttachment(id);
  };

  const toggle = (attachId, docId, type) => {
    setSelectedAttachment({
      attachId,
      docId,
      type,
    });
    setModal(!modal);
  };
  const isPrimary = props.isPrimary;

  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }

  const downloadFile = (id) => {
    const p = props.permissions;
    if (p?.download) {
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
    if (window.confirm("Do you want to delete the file?")) {
      deleteAttachment(id, (err, json) => {
        if (!err && json && json.success) {
          toast.success("Success!");
          props.loadMemo();
        } else {
          toast.error(json.message || "Error occurred!");
        }
      });
    }
  };

  const modalForAttachment = (
    <Modal isOpen={modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Attachment</ModalHeader>
      <ModalBody>
        <PreviewAttachments
          attachment
          setSelectedAttachmentId={setSelectedAttachmentId}
          attachId={selectedAttachment?.attachId}
          attachments={props?.attachmentList}
          isDeleted={false}
          permissions={props.permissions}
          type={selectedAttachment?.type}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );

  return (
    <Card className="mb-2 shadow">
      {modalForAttachment}
      {/* HEADING START */}
      <CardHeader>
        <i className="fas fa-paperclip" /> Attachments
      </CardHeader>
      {/* HEADING END */}
      <CardBody>
        <Table responsive bordered hover id="toExcel">
          <thead className="table-active">
            <tr>
              <th>Document Type</th>
              <th>Department</th>
              <th>Branch</th>
              <th>File Name</th>
              <th>Document Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {props?.attachmentList?.map((row) => (
              <tr key={row.id}>
                <td>{row.documentType}</td>
                <td>{row.department}</td>
                <td>{row.branch}</td>
                {isPrimary ? (
                  <td style={{ color: "#00e", cursor: "pointer" }} onClick={() => downloadFile(row.id)}>
                    {row?.name}
                  </td>
                ) : (
                  <td>{row?.name}</td>
                )}
                <td>
                  <Link className="text-break" to={metaRoutes.documentsView + "?i=" + A.getHash(row.itemId)}>
                    {row.otherTitle}
                  </Link>
                </td>

                <td style={{ cursor: "pointer" }}>
                  <Button color="primary" onClick={() => toggle(row.id)} style={{ marginRight: 5 }}>
                    <i className="fa fa-eye" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>

      <CardFooter>
        <Row>
          <Col>
            <Pagination
              count={parseInt(Math.ceil(props.totalAttachments / limit))}
              onChange={props.handleChangePage}
              shape="rounded"
              page={props.pageNumber}
            />
          </Col>
          <Col>
            <div className="float-right mt-2 d-flex align-items-center">
              <p className="mb-0 mr-2">Items Per Page</p>
              <FormControl>
                <Select
                  labelId="demo-customized-select-label"
                  id="demo-customized-select"
                  value={props.docLimit}
                  onChange={handleChange}
                  className="form-control rounded"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
              <p className="mb-0 ml-2">
                Total Documents :<b className="mr-2">{props.totalAttachments}</b> Page :<b> {props.pageNumber}</b>
              </p>
              <ReactHTMLTableToExcel
                id="toExcel-button"
                className="btn btn-sm ml-2 btn-primary text-white float-right"
                table="toExcel"
                filename="attachmentdetails"
                sheet="tablexls"
                buttonText="Download Report"
              />
            </div>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};
export default connect((state) => ({
  ...state.allFields,
  docLimit: state.docLimitDocumentNumber,
}))(AttachmentListTable);
