import React, { useEffect, useState } from "react";
import { Row, Col, PaginationItem, PaginationLink } from "reactstrap";
import Pagination from "@mui/lab/Pagination";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { getValue } from "config/util";
import A from "config/url";
import PropTypes from "prop-types";
import metaRoutes from "config/meta_routes";
import CustomEdit from "admin/components/CustomTableAction";
import CustomDelete from "admin/components/CustomDelete";
import { Card, CardHeader, CardBody, CardFooter, Table } from "reactstrap";
import { setDocPageNo } from "redux/actions/documentAc";
import { setDocLimitDocumentNumber } from "redux/actions/documentAc";
import { useSelector } from "react-redux";

import { FormControl, MenuItem, Select } from "@mui/material";

const PER_PAGE_SIZE = 6;
const offset = 3;

const DocumentListTable = (props) => {
  const PER_PAGE_SIZE = props.docLimit;
  const currentPageNumber = props.docPagination;
  const [startOffset, setStartOffset] = useState(currentPageNumber);
  const docLength = props.documentList.length;
  const documentList = props.documentList;

  const handleSelect = (number) => {
    if (number > 0 && number - 1 < props.documentList.length / PER_PAGE_SIZE) {
      props.dispatch(setDocPageNo(number));
      setStartOffset((number - 1) * PER_PAGE_SIZE);
    }
  };

  const limit = useSelector((state) => state.docLimitDocumentNumber);

  const handleChange = (event) => {
    props.dispatch(setDocLimitDocumentNumber(event.target.value));
  };

  const sortBy = (key) => {
    const sort = props.documentList;
    sort.sort((a, b) => {
      try {
        if (a[key].toLowerCase() < b[key].toLowerCase()) {
          return -1;
        }
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return 1;
        }
        return 0;
      } catch (err) {
        return -1;
      }
    });
  };

  useEffect(() => {
    setStartOffset((props.docPagination - 1) * PER_PAGE_SIZE);
  }, [props.docPagination, props.dispatch, props.docLimitDocumentNumber]);

  const documentTypes = props.documentTypes ? props.documentTypes : [];
  const departments = props.departments ? props.departments : [];
  const statuses = props.statuses ? props.statuses : [];
  const locationMaps = props.locationMaps ? props.locationMaps : [];
  const users = props.users ? props.users : [];
  const p = props.permissions ? props.permissions : {};

  return (
    <Card className="shadow">
      <CardHeader>
        <p className="h5">{props.title}</p>
        {props.showControl && (p.document === VIEW_EDIT || p.document === VIEW_EDIT_DELETE) ? (
          <Link to={metaRoutes.documentsAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
            <i className="fa fa-plus" /> Add Document
          </Link>
        ) : null}
      </CardHeader>
      <CardBody>
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th scope="col">Document Type</th>
              <th scope="col">Department</th>
              <th scope="col" onClick={() => sortBy("name")}>
                Organization Name
              </th>
              <th scope="col" onClick={() => sortBy("otherTitle")}>
                Document Name
              </th>
              <th scope="col">Status</th>
              <th scope="col">Location</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {documentList.map((row, index) => {
              if (index >= startOffset && index < startOffset + PER_PAGE_SIZE) {
                console.log(row);
                const documentType = getValue(documentTypes, row.documents && row.documentTypeId);
                const status = getValue(statuses, row.statusId);
                const locationMap = getValue(locationMaps, row.locationMapId);
                const department = getValue(departments, row.departmentId);
                const createdUser = getValue(users, row.createdBy);

                return (
                  <tr key={index}>
                    <td className="text-break">{documentType}</td>
                    <td className="text-break">{department}</td>
                    <td className="text-break">{row.name}</td>
                    <td>
                      <Link className="text-break" to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}>
                        {row.otherTitle}
                      </Link>
                    </td>
                    <td className="text-break">{status}</td>
                    <td className="text-break">{locationMap}</td>
                    <td>
                      {props.showControl && (p.document === VIEW_EDIT || p.document === VIEW_EDIT_DELETE) ? (
                        <CustomEdit to={metaRoutes.documentsEdit + "?i=" + A.getHash(row.id)} />
                      ) : null}
                      {props.deleteDocument && props.showControl && p.document === VIEW_EDIT_DELETE ? (
                        <CustomDelete onClick={() => props.deleteDocument(row.id)} />
                      ) : null}
                      {props.approveDocument ? (
                        <button onClick={() => props.approveDocument(row.id)} className="btn btn-success btn-sm m-1">
                          <i className="fa fa-check" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              }
              return null;
            })}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter className="bg-white">
        <Row>
          <Col>
            <Pagination
              count={parseInt(Math.ceil(props.totalDocuments / limit))}
              onChange={props.handleChangePage}
              shape="rounded"
              page={props.pageNumber}
            />
          </Col>
          <Col>
            <div className="float-right mt-2 d-flex align-items-center">
              <p className="mb-0 mr-2">Items Per Page</p>
              <FormControl>
                <Select
                  labelId="demo-customized-select-label"
                  id="demo-customized-select"
                  value={props.docLimit}
                  onChange={handleChange}
                  className="form-control rounded"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
              <p className="mb-0 ml-2">
                Total Documents :<b className="mr-2">{props.totalDocuments}</b> Page :<b> {props.pageNumber}</b>
              </p>
            </div>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

DocumentListTable.propTypes = {
  title: PropTypes.string,
  documentList: PropTypes.array,
  showControl: PropTypes.bool,
  deleteDocument: PropTypes.func,
  permissions: PropTypes.object,
};

export default connect((state) => ({
  ...state.allFields,
  docPagination: state.docPageNo,

  docLimit: state.docLimitDocumentNumber,
}))(DocumentListTable);
