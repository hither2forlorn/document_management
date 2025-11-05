import React, { useEffect, useRef, useState } from "react";
import WebViewer from "@pdftron/webviewer";
// import samplesSetup from "@pdftron/webviewer";
import { server, SERVER_URL } from "admin/config/server";
import A from "config/url";
import { getDocument, previewAttachment, provideTimelyAccess } from "../api";
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Form, FormGroup, Label, Row, Col, Table } from "reactstrap";
import CustomCancel from "admin/components/CustomCancel";
import metaRoutes from "config/meta_routes";
import { toast } from "react-toastify";
import { getOneAttachments } from "../api/attachment";

const Redaction = (props) => {
  let viewer = document.getElementById("file-viewer");
  const [documentData, setDocumentData] = useState([{}]);
  const [attachments, setAttachments] = useState([{}]);
  const [redactFile, setRedactFile] = useState(true);
  const [attachmentData, setAttachmentData] = useState("");
  let attachmentId = props.location.state.selectedAttachmentId;

  function samplesSetup(instance) {
    instance.enableElements(["bookmarksPanel", "bookmarksPanelButton"]);
    instance.enableFeatures([instance.Feature.Measurement]);
  }

  const loadDoc = () => {
    let ids = A.getId(props.location.hash.slice(1));
    if (ids) {
      getDocument("", ids, (err, json) => {
        if (json.success) {
          setDocumentData(json.data);
          setAttachments(json.data.attachments ? json.data.attachments : []);
        }
      });
    }
  };
  WebViewer(
    {
      path: "./lib",
      initialDoc: "",
      fullAPI: true,
      // enableAnnotations: false,
      enableRedaction: true,
      documentType: "pdf",
    },
    viewer
  )
    .then((instance) => {
      samplesSetup(instance);
      let ids = A.getId(props.location.hash.slice(1));

      document.getElementById("select").onchange = (e) => {
        let docPath = "";
        let fileValue = e.target.options[e.target.selectedIndex].attributes["fileId"].value;
        previewAttachment(fileValue, (err, json) => {
          if (err) return;
          if (json.success) {
            const filePath = SERVER_URL + "/" + json.filePath;
            instance.loadDocument(filePath);
          } else {
            window.alert(json.message);
          }
        });
      };
      const { docViewer, annotManager, CoreControls, Annotations } = instance;
      docViewer.on("documentLoaded", () => {
        const redact = new Annotations.RedactionAnnotation();
        annotManager.addAnnotation(redact);
        annotManager.drawAnnotationsFromList(redact);
      });
      // Add header button that will get file data on click
      // instance.setToolMode(Tools.ToolNames.REDACTION);
      instance.setHeaderItems((header) => {
        header.push({
          type: "actionButton",
          img: "icon-chevron-right",
          onClick: async () => {
            const xfdfString = await annotManager.exportAnnotations();
            const saveOptions = CoreControls.SaveOptions;
            // annotManager.importAnnotations(xfdfString);
            const options = {
              xfdfString,
              flags: saveOptions.LINEARIZED,
              downloadType: "pdf",
            };

            const doc = docViewer.getDocument();
            const fileName = doc.filename;
            const data2 = await doc.getFileData(options);
            const blob = new Blob([data2], { type: "application/pdf" });
            const data1 = new FormData();
            data1.append("fileType", options.downloadType);
            data1.append("itemId", attachmentData.itemId);
            data1.append("itemType", "document");
            data1.append("redaction", redactFile);
            data1.append("file", blob, fileName);
            for (var key of data1) {
              console.log(key);
            }
            server
              .post("/attachment", data1)
              .then((res) => {
                props.history.push(metaRoutes.documentsView + "?i=" + props.location.hash.slice(1) + "&type=redact");
                toast.success("successfully redacted");
              })
              .catch((err) => console.log(err));

            // instance.downloadPdf(options);
          },
        });
      });
    })
    .catch((err) => console.log(err));

  useEffect(() => {
    getOneAttachments(attachmentId, (err, data) => {
      if (err) {
        console.log(err);
      }
      setAttachmentData(data);
    });
    loadDoc();
  }, []);
  return (
    <>
      <Card className="shadow">
        <CardHeader>
          {" "}
          <Row>
            <Col>
              <FormGroup>
                <Label>Select Files</Label>

                <Input id="select" type="select" className="w-50">
                  <option>--NONE--</option>
                  {/* {attachments.map((row, index) => {
                    if (!row.redaction) {
                      return (
                        <>
                          {
                            <option
                              key={index}
                              value={row.filePath}
                              name={row.name}
                              fileId={Number(row.id)}
                            >
                              {row.name}
                            </option>
                          }
                        </>
                      );
                    }
                  })} */}
                  <option value={attachmentData.filePath} name={attachmentData.name} fileId={Number(attachmentData.id)}>
                    {attachmentData.name}
                  </option>
                </Input>
              </FormGroup>
            </Col>
          </Row>
        </CardHeader>
        <CardBody>
          <div className="webviewer" id="file-viewer" style={{ height: "100vh" }}></div>
        </CardBody>
        <CardFooter className="d-flex justify-content-end">
          <CustomCancel onClick={() => window.history.back()} />
        </CardFooter>
      </Card>
    </>
  );
};
export default Redaction;
