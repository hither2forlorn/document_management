import React, { useState, useEffect } from "react";
import DocumentListTable from "./components/DocumentListTable";
import { connect } from "react-redux";
import SearchDocument from "./SearchDocument";
import { getFormData } from "config/form";
import { deleteDocument } from "./api";
import { restoreDocument, searchDocumentsPagination } from "./api/document";
import { setDocumentSearchData } from "redux/actions/documentAc";
import { Col, Row } from "reactstrap";
import Axios from "axios";
import { useSelector } from "react-redux";
import { banks, excludeThisVendor, onlyForThisVendor } from "config/bank";
import { toast } from "react-toastify";

const DocumentDashboard = (props) => {
  const [documentList, setDocumentList] = useState([]);
  const [count, setCount] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  const limit = useSelector((state) => state.docLimitDocumentNumber);

  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // setRowsPerPage(parseInt(event.target.value, 10));
    setPageNumber(1);
  };

  const restorePermission = props.permissions?.restore;

  const showControl =
    excludeThisVendor([banks.rbb.name]) || props.userProfile.id === 1 || props.userProfile.hierarchy == "Super-001";

  const onChange = (e) => {
    let data = {};
    if (e?.length >= 0) {
      data = { tags: e };
    } else {
      const {
        target: { checked, name, value, type },
      } = e;
      switch (type) {
        case "checkbox":
          data = { [name]: checked };
          break;
        default:
          data = { [name]: value };
      }
    }
    // Reset the search query when Document type is not selected
    if (data.documentTypeId === "") {
      onReset();
    } else {
      setPageNumber(1);
      // props.dispatch(setDocPageNo(1));
      props.dispatch(setDocumentSearchData({ ...props.searchData, ...data }));
      setPageNumber(1);
    }
  };

  const onReset = () => {
    props.dispatch(setDocumentSearchData({}));
  };

  const onSearch = (event) => {
    event.preventDefault();
    const data = getFormData(event);
    props.dispatch(setDocumentSearchData({ ...props.searchData, ...data }));
  };

  const loadData = (source) => {
    searchDocumentsPagination(
      props.searchData,
      (err, res) => {
        if (err) return;
        if (res.success) {
          setDocumentList(res.paginationDocument);
          setTotalDocuments(res.total);
        } else {
          window.alert(res.message);
        }
      },
      { page: pageNumber, limit: props.docLimit },
      source
    );
  };

  const delDocument = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }
    deleteDocument(id, (err, json) => {
      if (err) return;
      if (!json?.success) {
        return toast.error(json?.message);
      }
      loadData();
    });
  };

  const resDocument = (id) => {
    if (!window.confirm("Do you want to restore this file?")) {
      return;
    }
    restoreDocument(id, (err, json) => {
      if (err) return;
      if (!json?.success) {
        return toast.error(json?.message);
      } else {
        toast.success(json?.message);
      }
      window.location.reload();
      loadData();
    });
  };

  useEffect(() => {
    if (count === 0) {
      onReset();
      setCount((pre) => pre + 1);
      return;
    }

    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    loadData(source);
  }, [props.searchData, props.docPageNo, props.docLimit, pageNumber, limit]); //eslint-disable-line

  return (
    <Row>
      <Col md={3}>
        <SearchDocument
          onChange={onChange}
          onSearch={onSearch}
          permissions={props.permissions}
          onReset={onReset}
          archivedAccess={props.permissions.archived}
        />
      </Col>
      <Col md={9} className="pl-3 pl-md-0">
        <DocumentListTable
          title="Document List"
          showControl={showControl}
          deleteDocument={delDocument}
          documentList={documentList}
          permissions={props.permissions}
          restoreDocument={resDocument}
          setPageNumber={setPageNumber}
          handleChangePage={handleChangePage}
          pageNumber={pageNumber}
          totalDocuments={totalDocuments}
          restorePermission={restorePermission}
        />
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
  userProfile: state.userProfile,
}))(DocumentDashboard);
