import React, { useEffect, useState } from "react";
import { setDocPageNo, setDocumentSearchData } from "redux/actions/documentAc";
import { connect } from "react-redux";
import { getFavouriteList } from "./api/favouriteList";
import A from "config/url";
import { getFavouriteDocuments, searchDocumentsPagination } from "./api/document";
import { useSelector } from "react-redux";
import DocumentListTable from "./components/DocumentListTable";
import CustomTable from "./components/CustomTable";
import { Link } from "react-router-dom";
import metaRoutes from "config/meta_routes";
import { Card, CardBody, CardHeader } from "reactstrap";

var count = 0;
const FavouriteDocumentList = (props) => {
  const [documentList, setDocumentList] = useState([]);
  const [isFavourite, setIsFavourite] = useState(true);
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
    // getFavouriteList(isFavourite, (err, json) => {
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
    getFavouriteDocuments(
      (err, res) => {
        console.log("Response Data", res);
        console.log("The data", props.searchData);
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

  console.log("Docuemnt List =>", documentList);
  console.log("Total Docuemtn =>", totalDocuments);

  useEffect(() => {
    if (count === 0) {
      props.dispatch(setDocPageNo(1));
    }
    loadData();
    return () => {
      count++;
    };
  }, [props.searchData, props.docPageNo, props.docLimit, pageNumber, limit]);

  const columnData = [
    {
      Header: "Doc Type",
      accessor: "DocumentType",
    },
    {
      Header: "Department",
      accessor: "Department",
    },
    {
      Header: "Doc Name",
      accessor: "DocumentName",
      Cell: ({ row }) => {
        return (
          <Link
            className="text-break"
            style={{ color: "#17a2b8", cursor: "pointer" }}
            to={metaRoutes.documentsView + "?i=" + A.getHash(row.original.id)}
          >
            {row.values.DocumentName}
          </Link>
        );
      },
    },
    {
      Header: "Status",
      accessor: "DocumentStatus",
    },
    {
      Header: "Location",
      accessor: "locationMap",
    },
    {
      Header: "Created By",
      accessor: "username",
    },
  ];

  return (
    <React.Fragment>
      {/* <DocumentListTable
        title="Favourite Document List"
        documentList={documentList}
        showControl={false}
        setPageNumber={setPageNumber}
        handleChangePage={handleChangePage}
        pageNumber={pageNumber}
        totalDocuments={totalDocuments}
      /> */}

      <Card className="shadow">
        <CardHeader>
          <p className="h5">Favourite Document List</p>
        </CardHeader>
        <CardBody>
          <CustomTable name={"DocumentName"} columns={columnData} data={documentList} />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
  docLimit: state.docLimitDocumentNumber,
}))(FavouriteDocumentList);
