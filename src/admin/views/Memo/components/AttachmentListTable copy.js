import React, { useEffect, useState } from "react";
import { Progress, Card, CardHeader, CardBody, Table } from "reactstrap";
import { downloadAttachment, deleteAttachment } from "../api/attachment";
import { server } from "admin/config/server";
import { toast } from "react-toastify";
import { SERVER_URL } from "admin/config/server";
import { Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";

var TOTAL_PAGES = 100;
var PER_PAGE_SIZE = 5;
const docLength = TOTAL_PAGES;
var currentPageNumber = 1;
const AttachmentListTable = (props) => {
  const attachments = props.attachments;
  const isPrimary = props.isPrimary;
  const [state, setState] = useState({
    loading: null,
    selectedFiles: [],
  });
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setStartOffset((props.docPagination - 1) * PER_PAGE_SIZE);
  }, [props.docPagination]);

  const handleSelect = (number) => {
    if (number > 0 && number - 1 < TOTAL_PAGES / PER_PAGE_SIZE) {
      props.dispatch(setDocPageNo(number));
      setStartOffset((number - 1) * PER_PAGE_SIZE);
    }
  };
  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }

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
    if (window.confirm("Do you want to delete the file?")) {
      deleteAttachment(id, (err, json) => {
        if (!err && json && json.success) {
          toast.success("Success!");
          props.loadMemo();
        } else {
          toast.error("Error occurred!");
        }
      });
    }
  };

  return (
    <Card className="mb-2 shadow">
      {/* HEADING START */}
      <CardHeader>
        <i className="fa fa-file" /> Attachments
      </CardHeader>
      {/* HEADING END */}
      <CardBody>
        <Table responsive bordered hover>
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
      </CardBody>

      <CardFooter className="bg-white">
        <Row>
          <Col>
            <Pagination aria-label="Page navigation example">
              <PaginationItem>
                <PaginationLink first href="" onClick={() => handleSelect(1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink previous href="" onClick={() => handleSelect(currentPageNumber - 1)} />
              </PaginationItem>
              {currentPageNumber - offset > 0 ? (
                <PaginationItem disabled>
                  <PaginationLink href="">...</PaginationLink>
                </PaginationItem>
              ) : null}
              {paginationItems.map((row) => row)}
              {currentPageNumber + offset < TOTAL_PAGES ? (
                <PaginationItem disabled>
                  <PaginationLink href="">...</PaginationLink>
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationLink next href="" onClick={() => handleSelect(currentPageNumber + 1)} />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink last href="" onClick={() => handleSelect(TOTAL_PAGES)} />
              </PaginationItem>
            </Pagination>
          </Col>
          <Col>
            <h5 className="float-right">
              Total Documents:{" "}
              {/* {startOffset + PER_PAGE_SIZE > docLength
                ? docLength
                : startOffset + PER_PAGE_SIZE}{" "}
              out of {docLength} */}
            </h5>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

export default AttachmentListTable;
