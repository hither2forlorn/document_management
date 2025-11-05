import React from "react";
import { Link } from "react-router-dom";
import { getLocationTypes, deleteLocationType } from "./api";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import { loadAllFields } from "redux/actions/apiAction";
import A from "config/url";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import CustomDelete from "admin/components/CustomDelete";
import CustomEdit from "admin/components/CustomTableAction";
import { Card, Row, Col, CardHeader, CardBody, Table } from "reactstrap";
import moment from "moment";
import CustomTable from "../DocumentManagement/components/CustomTable";
import CustomTableAction from "admin/components/CustomTableAction";
import handleSerialNumber from "../Util/hanldeSerialNumber";
class LocationTypesList extends React.Component {
  state = {
    locationTypes: [],
  };

  deleteLocationType = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      deleteLocationType(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminLocationTypes);
        if (data.success) {
          toast.success("Success!");
          this.updateData();
          this.props.dispatch(loadAllFields());
        } else {
          toast.error(data.message);
        }
      });
    }
  };

  updateData = () => {
    getLocationTypes((err, data) => {
      if (err) {
        toast.error("Error in the client Side");
        console.log(err);
        return;
      }
      if (data.success) {
        const result = handleSerialNumber(data.data);
        this.setState({
          locationTypes: result,
        });
      }
    });
  };

  componentDidMount() {
    this.updateData();
  }

  columnData = [
    {
      Header: "S.N",
      accessor: "serial",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Date Registered",
      accessor: "createdAt",
      Cell: (row) => moment(row.value).format("dddd, MMMM Do YYYY"),
    },
    {
      Header: "Date Modified",
      accessor: "updatedAt",
      Cell: (row) => moment(row.value).format("dddd, MMMM Do YYYY"),
    },

    {
      Header: "Actions",
      accessor: "action",
      disableSortBy: true,

      Cell: ({ row }) => {
        const p = this.props.permissions || {};
        return (
          <div style={{ cursor: "pointer" }}>
            <CustomTableAction
              to={metaRoutes.adminLocationTypesEdit + "?i=" + A.getHash(row.original.id)}
              buttonType="edit"
              permission={p.locationType}
            />
            <CustomTableAction
              onClick={() => this.deleteLocationType(row.original.id)}
              buttonType="delete"
              permission={p.locationType}
            />
          </div>
        );
      },
    },
  ];

  render() {
    const p = this.props.permissions || {};
    return (
      <Card className="shadow">
        <CardHeader>
          <p className="h5">Location Types</p>
          {p.locationType === VIEW_EDIT || p.locationType === VIEW_EDIT_DELETE ? (
            <Link
              to={metaRoutes.adminLocationTypesAdd}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-plus" />
              Add Location Type
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <CustomTable columns={this.columnData} data={this.state.locationTypes} />
        </CardBody>
      </Card>
    );
  }
}

export default connect()(LocationTypesList);
