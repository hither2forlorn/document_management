import React from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import A from "config/url";
import metaRoutes from "config/meta_routes";
export default class LocationMapStructure extends React.Component {
  constructor(props) {
    super(props);
    this.getLocationChildren = this.getLocationChildren.bind(this);
  }

  state = {
    editButtonShow: false,
  };

  toggleChildren(parentId) {
    const id = "cursor-pointer" + parentId;
    const elements = document.getElementsByClassName(id);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.style.display === "none") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
  }

  getSecurityHierarchyPath(hierarchyCode) {
    const tempPath = [];

    if (!hierarchyCode) {
      return;
    }
    {
      /* find the security hierarchy
       */
    }
    const itemIs = this.props.hierarchy.filter((item) => item.code === hierarchyCode);

    if (itemIs[0]?.parentId !== null) {
      this.props.hierarchy.forEach((item) => {
        if (item.id === itemIs[0]?.parentId) {
          tempPath.push(item.name);
        }
      });
    }
    tempPath.push(itemIs[0]?.name);
    return tempPath.toString().replace(",", " --> ");
  }

  getLocationChildren(parentId) {
    const locationMaps = this.props.locationMaps;
    let items = [];
    const children = locationMaps.filter((childItem) => {
      if (childItem?.parentId === parentId) {
        return 1;
      }
      return 0;
    });
    children.forEach((row, index) => {
      items.push(
        <div
          key={index}
          className={"cursor-pointer" + row.parentId}
          style={{
            marginLeft: 20,
            cursor: "pointer",
            display: "none",
          }}
        >
          <i className="fa fa-angle-down mr-2" onClick={() => this.toggleChildren(row.id)} />
          <span
            onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}
            title={this.getSecurityHierarchyPath(row.hierarchy)}
          >
            <i className="fa fa-folder-o mr-2" />
            {row.name + " "}
            {/**
             [EDIT] toggled when hovering over a child component in the tree leading to the Edit form of the concerned link
             **/}
            <Link
              to={metaRoutes.adminLocationMapsEdit + "?i=" + A.getHash(row.id)}
              style={{
                display: this.state.editButtonShow ? "inline" : "none",
                cursor: this.state.editButtonShow ? "pointer" : "none",
              }}
            >
              [EDIT]
            </Link>
          </span>
          <br />
          {this.getLocationChildren(row.id)}
        </div>
      );
    });
    return items.map((row) => row);
  }

  toggleEditButton() {
    this.setState({ editButtonShow: !this.state.editButtonShow });
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <p className="h5">
              <i className="fas fa-map-marked mr-1" />
              Location Map List
            </p>

            <span
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
              className="btn-header btn btn-outline-dark btn-sm border-dark border"
            >
              <i className="fa fa-refresh" />
            </span>

            {/* <Col
              style={{ cursor: "pointer" }}
              onClick={() => this.props.onFilter(null)}
            >
            </Col> */}
          </Row>
        </CardHeader>
        <CardBody>
          {this.props.locationMaps.map((row, index) => {
            let lowestLevel = this.props.locationMaps[0]?.level;
            this.props.locationMaps.forEach((d) => {
              if (lowestLevel >= d.level) {
                lowestLevel = d.level;
              }
            });
            if (row.level === lowestLevel) {
              return (
                <div
                  key={index}
                  id="cursor-pointer"
                  className="cursor-pointer"
                  style={{ marginLeft: row.level * 20, cursor: "pointer" }}
                  onMouseOver={() => this.setState({ editButtonShow: true })}
                  onMouseOut={() => this.setState({ editButtonShow: false })}
                >
                  <i className="fa fa-caret-down mr-2" onClick={() => this.toggleChildren(row.id)} />
                  <span
                    onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}
                    title={this.getSecurityHierarchyPath(row.hierarchy)}
                  >
                    <i className="fa fa-folder-o mr-2" />
                    {row.name + " "}
                    {/**
             [EDIT] toggled when hovering over a parent component in the tree leading to the Edit form of the concerned link
             **/}
                    <Link
                      to={metaRoutes.adminLocationMapsEdit + "?i=" + A.getHash(row.id)}
                      style={{
                        display: this.state.editButtonShow ? "inline" : "none",
                        cursor: this.state.editButtonShow ? "pointer" : "none",
                      }}
                    >
                      [EDIT]{" "}
                    </Link>
                  </span>
                  <br />
                  {this.getLocationChildren(row.id)}
                </div>
              );
            } else {
              return null;
            }
          })}
        </CardBody>
      </Card>
    );
  }
}
