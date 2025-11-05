import React, { useState } from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import { Table, Row, Col } from "reactstrap";
import { useSelector, connect } from "react-redux";
import { Pagination } from "@mui/material";

import { FormControl, MenuItem, Select } from "@mui/material";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { banks, dms_features, includeThisFeature, onlyForThisVendor } from "config/bank";

function CustomTable(props) {
  const { columns, data, allData } = props;
  const [filterInput, setFilterInput] = useState("");

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    gotoPage,
    setPageSize,
    prepareRow,
    setFilter,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filterInput && (props.LocationMapBata || props.securityHierarchyBata) ? allData : data, // used for search in locationMap
    },
    useFilters,
    useSortBy,
    usePagination
  );

  const handleChangePage = (event, newPage) => {
    gotoPage(newPage - 1);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value || undefined;
    const name = e.target.name;

    switch (name) {
      case "DocumentName":
        setFilter("DocumentName", value);
        setFilterInput(value);
        break;

      default:
        setFilter("name", value);
        setFilterInput(value);
        break;
    }
  };
  // Render the UI for your table

  const style = {
    backgroundColor: "red",
    fontSize: 200,
  };

  return (
    <>
      <div className="form-group rounded">
        <div className="input-group mb-2">
          <div className="input-group-prepend rounded">
            <div className="input-group-text rounded">
              <i className="fas fa-search"></i>
            </div>
          </div>
          <input
            name={props.name || "name"}
            value={filterInput}
            className="form-control rounded"
            onChange={handleFilterChange}
            placeholder={"Search by name column"}
          />
        </div>
      </div>
      <Table responsive bordered hover {...getTableProps()} id="toExcelData">
        <thead className="table-active">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={column.isSorted ? (column.isSortedDesc ? "sort-desc" : "sort-asc") : ""}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <span>
                          {"  "}
                          <i className="fas fa-caret-square-down text-info ml-2"></i>
                        </span>
                      ) : (
                        <span>
                          {"  "}
                          <i className="fas fa-caret-square-up text-info pl-1"></i>
                        </span>
                      )
                    ) : (
                      <span>
                        {" "}
                        <i className="fas fa-sort text-info pl-1"></i>
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>

      <Row>
        <Col>
          <Pagination
            count={parseInt(Math.ceil(data.length / pageSize))}
            onChange={handleChangePage}
            shape="rounded"
            page={pageIndex + 1}
          />
        </Col>
        <Col>
          <div className="float-right mt-2 d-flex align-items-center">
            <p className="mb-0 mr-2">Items Per Page</p>
            <FormControl>
              <Select
                labelId="demo-customized-select-label"
                id="demo-customized-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                }}
                className="form-control rounded"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
            <p className="mb-0 ml-2">
              Total Documents :<b className="mr-2">{data.length}</b> Page :<b> {pageIndex + 1}</b>
            </p>
            <ReactHTMLTableToExcel
              id="toExcel-button"
              className="btn btn-sm ml-2 btn-primary text-white float-right"
              table="toExcelData"
              filename="attachmentstable"
              sheet="tablexls"
              buttonText="Download Report"
            />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default connect((state) => ({
  allFields: state.allFields,
  searchData: state.docSearchData,
}))(CustomTable);
