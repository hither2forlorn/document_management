import React from "react";
import { Link } from "react-router-dom";
import { VIEW_EDIT, VIEW_EDIT_DELETE } from "config/values";
import A from "config/url";
import metaRoutes from "config/meta_routes";
import { getValue } from "config/util";
import { connect } from "react-redux";
import { Card, Row, Col, CardHeader, CardBody, Table } from "reactstrap";
import CustomTableAction from "admin/components/CustomTableAction";
import CustomTable from "../DocumentManagement/components/CustomTable";
import moment from "moment";
import { add_serial_in_array } from "utils/arrayManipulation";

class LocationList extends React.Component {
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
      Header: "Description",
      accessor: "description",
    },
    {
      Header: "Location Type",
      accessor: "locationTypeId",
      Cell: ({ row }) => getValue(this.props.locationTypes, row.original.locationTypeId),
    },
    {
      Header: "Created By",
      accessor: "createdBy",
      Cell: ({ row }) => {
        console.log(this.props.allFields.users, row.original.createdBy);
        return getValue(this.props.allFields.users, row.original.createdBy);
      },
    },
    this.props.userProfile.id == 1
      ? {
          Header: "Hierarchy",
          accessor: "hierarchy",
        }
      : null,
    {
      Header: "Created At",
      accessor: "createdAt",
      Cell: (row) => moment(row).format("dddd, MMMM Do YYYY"),
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
              to={metaRoutes.adminLocationMapsEdit + "?i=" + A.getHash(row.original.id)}
              buttonType="edit"
              permission={p.locationMap}
            />
            <CustomTableAction
              onClick={() => this.props.deleteLocationMap(row.original.id)}
              buttonType="delete"
              permission={p.locationType}
            />
          </div>
        );
      },
    },
  ];

  columnData = this.columnData.filter((row) => row != null);

  render() {
    // add number in table
    add_serial_in_array(this.props.locationMapsOnTable);
    add_serial_in_array(this.props.allLocationData);

    const p = this.props.permissions || {};
    return (
      <Card className="sh adow">
        <CardHeader>
          <p className="h5">Location Maps</p>
          {p.locationMap === VIEW_EDIT || p.locationMap === VIEW_EDIT_DELETE ? (
            <Link to={metaRoutes.adminLocationMapsAdd} className="btn-header btn btn-outline-dark btn-sm border-dark border">
              <i className="fa fa-plus" />
              Add Location Map
            </Link>
          ) : null}
        </CardHeader>
        <CardBody>
          <CustomTable
            columns={this.columnData}
            LocationMapBata
            data={this.props.locationMapsOnTable}
            allData={this.props.allLocationData}
          />
        </CardBody>
      </Card>
    );
  }
}

export default connect((state) => ({
  locationTypes: state.allFields.locationTypes || [],
  userProfile: state.userProfile || [],
}))(LocationList);
