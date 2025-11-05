import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
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
import { setDocLimitDocumentNumber, setDocPageNo } from "redux/actions/documentAc";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const NotificationList = (props) => {
  const PER_PAGE_SIZE = props.docLimit;
  const offset = props.docLimit; // total number of page to show in pagination
  const currentPageNumber = props.docPagination;
  const [startOffset, setStartOffset] = useState(currentPageNumber);
  const docLength = props.totalPages;

  const handleSelect = (number) => {
    if (number > 0 && number - 1 < docLength / PER_PAGE_SIZE) {
      props.dispatch(setDocPageNo(number));
      setStartOffset((number - 1) * PER_PAGE_SIZE);
    }
  };
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

  // if null then add empty array.
  const documentTypes = props.documentTypes ? props.documentTypes : [];
  const departments = props.departments ? props.departments : [];
  const statuses = props.statuses ? props.statuses : [];
  const locationMaps = props.locationMaps ? props.locationMaps : [];
  const users = props.users ? props.users : [];
  const p = props.permissions ? props.permissions : {};

  let TOTAL_PAGES = Math.ceil(docLength / PER_PAGE_SIZE);

  const start = currentPageNumber - offset <= 0 ? 0 : currentPageNumber - offset;
  const end = currentPageNumber + offset >= TOTAL_PAGES ? TOTAL_PAGES : currentPageNumber + offset;
  const paginationItems = [];

  for (let i = start; i < end; i++) {
    paginationItems.push(
      <PaginationItem active={i === startOffset / PER_PAGE_SIZE} key={i}>
        <PaginationLink href="" onClick={() => handleSelect(i + 1)}>
          {i + 1}
        </PaginationLink>
      </PaginationItem>
    );
  }
  return (
<Card>
  <CardHeader>
    <span>
      <b>You have {props.documentList.length} new notifications</b>
    </span>
  </CardHeader>
  {/* Added a container with scrolling functionality */}
  <CardBody className="notification-list p-0" style={{ maxHeight: "600px", overflowY: "auto" }}>
    {props.documentList.map((row, index) => {
      const documentType = getValue(documentTypes, row.documentTypeId);
      const status = getValue(statuses, row.statusId);
      const locationMap = getValue(locationMaps, row.locationMapId);
      const department = getValue(departments, row.departmentId);
      const createdUser = getValue(users, row.createdBy);

      return (
        <>
          <Link to={metaRoutes.documentsView + "?i=" + A.getHash(row.id)}>
            <div className="notification-icon">
              <i className="fa fa-bell text-light"></i>
            </div>
            {row.isExpired && row.isExpiring === 0 ? (
              <span className="bg-red-400">
                Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                from "{department || row.Department}" has expired on {row.disposalDate}.
              </span>
            ) : row.isExpiring === 1 ? (
              <span className="bg-red-400">
                Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                from "{department || row.Department}" Department which you have set <b>"{row.notification} {row.notificationUnit}"</b> 
                notification will expire on <b>"{row.disposalDateNP}"</b>.
                </span>
            ) : (row.returnedByChecker)  ? (
              <span className="bg-red-400">
                Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                has been rejected by checker.
              </span>
            ) : row.returnedByApprover ? (
              <span className="bg-red-400">
                Document Name: <b>"{row.otherTitle || row.DocumentName}"</b> 
                has been rejected by the approver.
              </span>
            ): (
              <span>
                Document Name : <b>"{row.otherTitle || row.DocumentName}" </b>
                from "{department || row.Department}" Department is waiting for approval.
              </span>
            )}
          </Link>
        </>
      );
    })}
  </CardBody>
</Card>
  );
};

NotificationList.propTypes = {
  title: PropTypes.string,
  documentList: PropTypes.array,
  showControl: PropTypes.bool,
  deleteDocument: PropTypes.func,
  permissions: PropTypes.object,
};

export default connect((state) => ({
  ...state.allFields,
  docPagination: state.docPageNo,
  totalPages: state.docTotalPages,
  docLimit: state.docLimitDocumentNumber,
}))(NotificationList);
