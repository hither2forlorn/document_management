import React, { useState, useEffect } from "react";
import AttachmentListTable from "./components/AttachmentListTablePaginate";
import { connect } from "react-redux";
import SearchDocument from "./SearchDocument";
import { getFormData } from "config/form";
import { setDocumentSearchData } from "redux/actions/documentAc";
import { Col, Row } from "reactstrap";
import { getAttachmentsPaginate } from "./api/attachment";
import Axios from "axios";

const AttachmentDashboard = (props) => {
  const [attachmentList, setAttachmentList] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalAttachments, setTotalAttachments] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // setRowsPerPage(parseInt(event.target.value, 10));
    setPageNumber(1);
  };

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
    getAttachmentsPaginate(
      props.searchData,
      (err, res) => {
        if (err) return;
        if (res.success) {
          setAttachmentList(res.resp);
          setTotalAttachments(res.total);
        } else {
          console.log(res);
          window.alert(res.message);
        }
      },
      props.docLimit,
      pageNumber,
      source
    );
  };

  useEffect(() => {
    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();

    loadData(source);
    return () => {
      source.cancel();
    };
  }, [props.searchData, props.docLimit, pageNumber]); //eslint-disable-line

  return (
    <Row>
      <Col md={3}>
        <SearchDocument AttachmentBata onChange={onChange} onSearch={onSearch} onReset={onReset} />
      </Col>
      <Col md={9}>
        <AttachmentListTable
          attachmentList={attachmentList}
          permissions={props.permissions}
          setPageNumber={setPageNumber}
          handleChangePage={handleChangePage}
          pageNumber={pageNumber}
          totalAttachments={totalAttachments}
        />
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
}))(AttachmentDashboard);
