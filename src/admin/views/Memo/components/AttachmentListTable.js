import React, { useEffect, useState } from "react";
import { Progress, Card, CardHeader, CardBody, Table, CardFooter } from "reactstrap";
import { downloadAttachment, deleteAttachment } from "../api/attachment";
import { server } from "admin/config/server";
import { toast } from "react-toastify";
import { SERVER_URL } from "admin/config/server";
import { Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { getAttachmentsPaginate } from "admin/views/DocumentManagement/api/attachment";
var isPrimary;
const AttachmentListTable = (props) => {
  const [pageNumber, setPageNumber] = useState(0);
  const [numberOfPages, setNumberOfPages] = useState(0);
  const [posts, setPosts] = useState([]);

  const pages = new Array(numberOfPages).fill(null).map((v, i) => i);

  useEffect(() => {
    var limit, offset;
    getAttachmentsPaginate(
      (err, data) => {
        if (err) {
          console.log("err from getAttachments: ", err);
        } else {
          console.log("data for attachments: ", data);
          setPosts(data.resp);
        }
      },
      (limit = 5),
      (offset = 0)
    );

    setNumberOfPages(40);
  }, [pageNumber]);

  const gotoPrevious = () => {
    setPageNumber(Math.max(0, pageNumber - 1));
  };

  const gotoNext = () => {
    setPageNumber(Math.min(numberOfPages - 1, pageNumber + 1));
  };

  // const handlePageClick = (e, index) => {
  //   e.preventDefault();
  //   setCurrentPage(index);
  // };

  function startLoading() {
    document.getElementById("loading").style.display = "unset";
  }
  function finishLoading() {
    document.getElementById("loading").style.display = "none";
  }
  alert("k");

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
            {posts.map((row) => (
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

      <CardFooter>
        <button onClick={gotoPrevious}>Previous</button>
        {pages.map((pageIndex) => (
          <button key={pageIndex} onClick={() => setPageNumber(pageIndex)}>
            {pageIndex + 1}
          </button>
        ))}
        <button onClick={gotoNext}>Next</button>

        <h3>Page of {pageNumber + 1}</h3>
      </CardFooter>
    </Card>
  );
};

export default AttachmentListTable;
