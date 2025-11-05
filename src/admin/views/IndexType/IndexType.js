import React, { useEffect, useState } from "react";
import { Card, CardBody, Table, CardHeader, Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import metaRoutes from "config/meta_routes";
import SearchIndexType from "./SearchIndexType";
import A from "config/url";
import { setDocumentSearchData } from "redux/actions/documentAc";
import { deleteIndexType, getIndexTypes } from "./api";
import { getValue } from "config/util";
import { CustomDelete, CustomEdit } from "admin/components";
import CustomTableAction from "admin/components/CustomTableAction";

let indexData = [];
const IndexType = (props) => {
  const [indexList, setIndexList] = useState([{}]);
  const [id, setId] = useState();
  const [index, setIndex] = useState();
  const [documentTypesId, setDocumentTypeId] = useState();
  const [selectedDocType, setSelectedDocType] = useState(null);
  function handleSelectIndexType(value) {
    setSelectedDocType(value);
    indexData = indexList.filter((row) => row.docId == value && row);
  }
  const p = props.permissions || {};

  const documentTypes = props.documentTypes ? props.documentTypes : [];
  let data = {};
  const onChange = ({ target }) => {
    const { checked, name, value, type } = target;
    if (value == "") {
      setDocumentTypeId(value);
      return updateData();
    }

    switch (type) {
      case "checkbox":
        data = { [name]: checked };
        break;
      default:
        data = { [name]: value };
        if (name === "documentTypeId") {
          setDocumentTypeId(value);
        }
        setId(data.documentTypeId);

        const indexValue = props.documentTypes.find((row) => row.id == value);

        setIndex(indexValue.name);
    }
    // props.dispatch(setDocPageNo(1));
    // props.dispatch(setDocumentSearchData({ ...props.searchData, ...data }));
  };

  function sortArray(indexList) {
    return indexList?.sort((a, b) => {
      if (a.docId < b.docId) {
        return -1;
      }
      if (a.docId > b.docId) {
        return 1;
      }
      return 0;
    });
  }

  const updateData = () => {
    getIndexTypes((err, data) => {
      if (err) return;

      const result = data.data.map((item) => ({
        ...item,
      }));
      setIndexList(sortArray(result));
    });
  };

  const handleDeleteIndexType = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }
    deleteIndexType(id, (err, json) => {
      if (err) return;
      updateData();
    });
  };

  useEffect(() => {
    updateData();
  }, []);

  function renderIndexType(data) {
    return data?.map((row) => {
      const documentType = getValue(documentTypes, row.docId);
      if (documentType)
        return (
          <tr key={row.id}>
            <td>{documentType}</td>
            <td>{row.label}</td>
            <td>{new Date(row.createdAt).toDateString()}</td>
            <td>
              <CustomTableAction
                to={metaRoutes.adminIndexTypeEdit + "?i=" + A.getHash(row.id)}
                buttonType="edit"
                permission={p.documentType}
              />
              <CustomTableAction
                onClick={() => handleDeleteIndexType(row.id)}
                buttonType="delete"
                permission={p.documentType}
              />
            </td>
          </tr>
        );
    });
  }

  return (
    <Row>
      <Col md={3}>
        <Card className="shadow">
          <SearchIndexType
            handleIndexTypeChange={onChange}
            documentTypeId={documentTypesId}
            handleSelectIndexType={handleSelectIndexType}
          />
        </Card>
      </Col>
      <Col md={9} className="pl-3 pl-md-0">
        <Card className="shadow">
          <CardHeader>
            <p className="h5">Index Type</p>
            <Link
              to={metaRoutes.adminIndexTypeAdd + "?i=" + A.getHash(id) + "&index=" + index}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-plus" /> Add Index
            </Link>
          </CardHeader>
          <CardBody>
            <Table responsive bordered hover>
              <thead className="table-active">
                <tr>
                  <th>Document Type</th>
                  <th>Index Type</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{renderIndexType(selectedDocType ? indexData : indexList)}</tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default connect((state) => ({
  ...state.allFields,
  searchData: state.docSearchData,
}))(IndexType);
