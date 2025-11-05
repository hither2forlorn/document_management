import React, { useState, useEffect } from "react";
import { Row, Col } from "reactstrap";
import qs from "querystring";
import PreviewAttachments from "./components/PreviewAttachments";
import DocumentInformation from "./components/DocumentInformation";
import AttachmentListTable from "./components/AttachmentListTable";
import { previewDocument } from "./api";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";

function startLoading() {
  document.getElementById("loading").style.display = "unset";
}

function finishLoading() {
  document.getElementById("loading").style.display = "none";
}

const ViewDocumentInformation = (props) => {
  const p = props.permissions || {};
  const query = qs.parse(props.location.search.substring(1, props.location.search.length));
  const token = query.i;
  const type = query.type;
  // console.log(type);
  const [documentData, setDocumentData] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState(null);

  useEffect(() => {
    startLoading();
    previewDocument(token, type, (err, json) => {
      if (!err && json.success) {
        setDocumentData(json.data);
        setAttachments(json.data.attachments ? json.data.attachments : []);
      } else {
        toast.error("Could not access this document at the moment!");
        props.history.push(metaRoutes.documentsList);
      }
      finishLoading();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Row>
      <Col md={4}>
        <DocumentInformation documentData={documentData} permissions={p} />
      </Col>
      <Col md={8}>
        <PreviewAttachments attachments={attachments} setSelectedAttachmentId={setSelectedAttachmentId} permissions={p} />
      </Col>
      <Col md={12}>
        {/* <AttachmentListTable
          hourlyAccessForUser
          attachments={attachments}
          permissions={p}
          documentId={documentData.id}
        /> */}
      </Col>
    </Row>
  );
};

export default ViewDocumentInformation;
