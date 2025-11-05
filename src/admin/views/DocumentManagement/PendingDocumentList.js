import React, { useState, useEffect } from "react";
import { setDocPageNo } from "redux/actions/documentAc";
import { getPendingDocuments, approveDocument, archiveDocument } from "./api";
import DocumentListTable from "./components/DocumentListTable";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";

import Axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../Dashboard/api";

let checkerData;

const PendingDocumentList = (props) => {
  const [documentList, setDocumentList] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [initiaterUser, setInitiaterUser] = useState("");
  const limit = useSelector((state) => state.docLimitDocumentNumber);
  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // setRowsPerPage(parseInt(event.target.value, 10));
    setPageNumber(1);
  };

  const handleApproveDocument = (id) => {
    if (!window.confirm("Do you want to approve this file?")) {
      return;
    }

    approveDocument(id, (err, json) => {
      if (json.success) {
        toast.success("The document has been Approved");
        loadData();
      } else {
        toast.error(json.message);
      }
    });
  };

  const rejectDocument = (id) => {
    let rejectReason = prompt("reason to reject");

    if (!window.confirm("Do you want to reject this file?")) {
      return;
    }

    // consists reject rason and id
    const rejectData = {
      id: id,
      rejectReason: rejectReason,
    };

    archiveDocument(rejectData, (err, json) => {
      if (json.success) {
        toast.success("The document has been rejected");
        loadData();
      } else {
        toast.error(json.message);
      }
    });
  };

  const loadData = (source) => {
    getPendingDocuments(
      (err, res) => {
        if (err) return;
        if (res.success) {
          setDocumentList(res.paginationDocument);
          setTotalDocuments(res.total);
          setInitiaterUser(res.user);
        } else {
          console.log(res);
          window.alert(res.message);
        }
      },
      { page: pageNumber, limit: props.docLimit }
    );
  };
  useEffect(() => {
    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    loadData(source);
    return () => {
      source.cancel();
    };
  }, [props.searchData, props.docPageNo, props.docLimit, pageNumber, limit]); //eslint-disable-line

  return (
    <DocumentListTable
      title="Pending Document List"
      fromPendingListTable
      documentList={documentList}
      showControl={true}
      permissions={props.permissions}
      approveDocument={handleApproveDocument}
      rejectDocument={rejectDocument}
      setPageNumber={setPageNumber}
      handleChangePage={handleChangePage}
      pageNumber={pageNumber}
      totalDocuments={totalDocuments}
      initiaterUser={initiaterUser}
    />
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
  userProfile: state.userProfile,
}))(PendingDocumentList);
