import React, { useEffect, useState } from "react";
import { setDocPageNo, setDocumentSearchData } from "redux/actions/documentAc";
import { connect } from "react-redux";
import DocumentListTable from "./components/DocumentListTable";
import { getArchivedDocuments } from "./api";

import { searchDocumentsPagination } from "./api/document";
import { useSelector } from "react-redux";

var count = 0;
const ArchivedDocumentList = (props) => {
  const [documentList, setDocumentList] = useState([]);
  const [isArchived, setIsArchived] = useState(true);

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

  const loadData = () => {
    // let search = { isArchived: isArchived };
    // getArchivedDocuments(isArchived, (err, json) => {
    //   if (err) return;
    //   if (json.success) {
    //     setDocumentList(json.data);
    //     // console.log(json.data);
    //   } else {
    //     window.alert(json.message);
    //   }
    //   // console.log(documentList);
    // });

    // props.dispatch(setDocPageNo(1));
    // props.dispatch(setDocumentSearchData({ ...props.searchData }));

    getArchivedDocuments(
      (err, res) => {
        if (err) return;
        if (res.success) {
          setDocumentList(res.paginationDocument);
          setTotalDocuments(res.total);
        } else {
          console.log(res);
          window.alert(res.message);
        }
      },
      { page: pageNumber, limit: props.docLimit }
    );
  };
  useEffect(() => {
    if (count === 0) {
      props.dispatch(setDocPageNo(1));
    }
    loadData();
    return () => {
      // count++;
    };
  }, [props.searchData, props.docPageNo, props.docLimit, pageNumber, limit]);

  return (
    <React.Fragment>
      <DocumentListTable
        title="Archived Document List"
        documentList={documentList}
        // showControl={true}
        setPageNumber={setPageNumber}
        handleChangePage={handleChangePage}
        pageNumber={pageNumber}
        permissions={props.permissions}
        totalDocuments={totalDocuments}
      />
    </React.Fragment>
  );
};
export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
}))(ArchivedDocumentList);
