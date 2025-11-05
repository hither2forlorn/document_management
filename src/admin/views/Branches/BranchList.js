import React from "react";
import { Link } from "react-router-dom";
import { deleteBranch, getBranches } from "./api";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import metaRoutes from "config/meta_routes";
import A from "config/url";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomEdit";
import { Card, CardHeader, CardBody, Table, CardFooter, Row, Col } from "reactstrap";
import { connect } from "react-redux";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import CustomTable from "../DocumentManagement/components/CustomTable";
import CustomTableAction from "admin/components/CustomTableAction";
import { banks, onlyForThisVendor } from "config/bank";
class BranchList extends React.Component {
  state = {
    branches: [],
    currentPageNumber: 1,
    startOffset: 0,
  };

  handleSelect = (number) => {
    if (number > 0 && number - 1 < this.state.branches.length / 10) {
      this.setState({
        currentPageNumber: number,
        startOffset: (number - 1) * 10,
      });
    }
  };

  deleteBranch = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      deleteBranch(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminBranches);
        if (data.success) {
          this.updateData();
        } else {
          window.alert(data.message);
        }
      });
    }
  };

  updateData() {
    getBranches((err, data) => {
      if (err) return;
      if (data.success) {
        data.data.forEach((branch, index) => {
          branch.serial = index + 1;
        });

        this.setState({
          branches: data.data,
        });
      }
    });
  }

  componentDidMount() {
    this.updateData();
  }

  p = this.props.permissions || {};

  columnData = [
    {
      Header: "S.N",
      accessor: "serial",
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ row }) => {
        return (
          <Link
            className="text-break"
            style={{ color: "#17a2b8", cursor: "pointer" }}
            to={metaRoutes.adminBranchesView + "?i=" + A.getHash(row.original.id)}
          >
            {row.values.name}
          </Link>
        );
      },
    },
    {
      Header: "Street",
      accessor: "street",
    },
    {
      Header: "City",
      accessor: "city",
    },
    {
      Header: "Country",
      accessor: "country",
    },
    // {
    //   Header: "Postal Code",
    //   accessor: "postalCode",
    //   disableSortBy: true,
    // },
    {
      Header: "Phone",
      accessor: "phoneNumber",
      disableSortBy: true,
    },
    {
      Header: "Mail Id",
      accessor: "mailId",
      disableSortBy: true,
    },
    {
      Header: "Actions",
      accessor: "action",
      disableSortBy: true,

      Cell: ({ row }) => {
        return (
          <div style={{ cursor: "pointer" }}>
            <CustomTableAction
              to={metaRoutes.adminBranchesEdit + "?i=" + A.getHash(row.original.id)}
              buttonType="edit"
              permission={this.p.branch}
            />
            <CustomTableAction
              onClick={() => this.deleteBranch(row.original.id)}
              buttonType="delete"
              permission={this.p.branch}
            />
          </div>
        );
      },
    },
  ];

  render() {
    // const PER_PAGE_SIZE = 10;
    // let TOTAL_PAGES = Math.ceil(this.state.branches.length / PER_PAGE_SIZE);
    // // console.log(TOTAL_PAGES);
    // const offset = 3;
    // const start =
    //   this.state.currentPageNumber - offset <= 0
    //     ? 0
    //     : this.state.currentPageNumber - offset;
    // const end =
    //   this.state.currentPageNumber + offset >= TOTAL_PAGES
    //     ? TOTAL_PAGES
    //     : this.state.currentPageNumber + offset;
    // const paginationItems = [];
    // for (let i = start; i < end; i++) {
    //   paginationItems.push(
    //     <PaginationItem key={i}>
    //       <PaginationLink href="" onClick={() => this.handleSelect(i + 1)}>
    //         {i + 1}
    //       </PaginationLink>
    //     </PaginationItem>
    //   );
    // }

    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Branch List</p>
          {this.p.branch === VIEW_EDIT || this.p.branch === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminBranchesAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" />
              Add Branch
            </Link>
          ) : null}
        </CardHeader>

        {onlyForThisVendor([banks.rbb.name, banks.citizen.name]) && (
          <div className="alert alert-dark mr-3 ml-3 mt-3" role="alert">
            Note: Only admin or centeral head is allowed add branch.
          </div>
        )}
        <CardBody>
          <CustomTable columns={this.columnData} data={this.state.branches} />
          {/* <Table responsive bordered hover>
            <thead className="table-active">
              <tr>
                <th>Id</th>
                <th>Name</th>
                <th>Street</th>
                <th>City</th>
                <th>Country</th>
                <th>Postal Code</th>
                <th>Phone</th>
                <th>Website</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.branches.map((row, index) => {
                if (
                  index >= this.state.startOffset &&
                  index < this.state.startOffset + 10
                ) {
                  return (
                    <tr key={row.id}>
                      <td>{row.branchCode}</td>
                      <td>
                        <Link
                          to={
                            metaRoutes.adminBranchesView +
                            "?i=" +
                            A.getHash(row.id)
                          }
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td>{row.street}</td>
                      <td>{row.city}</td>
                      <td>{row.country}</td>
                      <td>{row.postalCode}</td>
                      <td>{row.phoneNumber}</td>
                      <td>{row.website}</td>
                      <td>
                        {p.branch === VIEW_EDIT ||
                        p.branch === VIEW_EDIT_DELETE ? (
                          // <Link
                          //   to={
                          //     metaRoutes.adminBranchesEdit +
                          //     "?i=" +
                          //     A.getHash(row.id)
                          //   }
                          //   className="edit-items-button bg-primary"
                          // >
                          //   <i className="fa fa-edit" />
                          //   Edit
                          // </Link>
                          <CustomEdit
                            to={
                              metaRoutes.adminBranchesEdit +
                              "?i=" +
                              A.getHash(row.id)
                            }
                          />
                        ) : null}
                        {p.branch === VIEW_EDIT_DELETE ? (
                          // <span
                          //   onClick={() => this .deleteBranch(row.id)}
                          //   className="delete-items-button bg-danger"
                          // >
                          //   <i className="fa fa-trash" />
                          //   Delete
                          // </span>
                          <CustomDelete
                            onClick={() => this.deleteBranch(row.id)}
                          />
                        ) : null}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </Table> */}
        </CardBody>
        {/* <CardFooter>
          <Pagination aria-label="Page navigation example">
            <PaginationItem>
              <PaginationLink
                first
                href=""
                onClick={() => this.handleSelect(1)}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                previous
                href=""
                onClick={() =>
                  this.handleSelect(this.state.currentPageNumber - 1)
                }
              />
            </PaginationItem>
            {this.state.currentPageNumber - offset > 0 ? (
              <PaginationItem disabled>
                <PaginationLink href="">...</PaginationLink>
              </PaginationItem>
            ) : null}
            {paginationItems.map((row) => row)}
            {this.state.currentPageNumber + offset < TOTAL_PAGES ? (
              <PaginationItem disabled>
                <PaginationLink href="">...</PaginationLink>
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationLink
                next
                href=""
                onClick={() =>
                  this.handleSelect(this.state.currentPageNumber + 1)
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                last
                href=""
                onClick={() => this.handleSelect(TOTAL_PAGES)}
              />
            </PaginationItem>
          </Pagination>
        </CardFooter> */}
      </Card>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(BranchList);
