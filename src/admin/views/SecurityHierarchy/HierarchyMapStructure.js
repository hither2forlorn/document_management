import React, { Component } from "react";
import { Card, CardBody, CardHeader, Row, Col } from "reactstrap";
import { connect } from "react-redux";

class HierarchyMapStructure extends Component {
  constructor(props) {
    super(props);
    this.getHierarchyChildren = this.getHierarchyChildren.bind(this);
    this.toggleChildren = this.toggleChildren.bind(this);
  }

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

  getHierarchyChildren(parentId) {
    const hierarchy = this.props.hierarchy;
    let items = [];
    const children = hierarchy.filter((childItem) => {
      if (childItem.parentId === parentId) {
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
            marginLeft: row.level * 10 > 40 ? 40 : row.level * 10,
            cursor: "pointer",
            display: "none",
          }}
        >
          <i className="fa fa-angle-down mr-2" onClick={() => this.toggleChildren(row.id)} />
          <span onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}>
            {row.multipleHierarchy ? (
              <>
                <i className="fa fa-folder mr-2" style={{ color: "#2132e8" }} />
                <span>{row.name}</span>
              </>
            ) : (
              <>
                <i className="fa fa-folder-o mr-2" />
                <span>{row.name}</span>
              </>
            )}
          </span>
          <br />
          {this.getHierarchyChildren(row.id)}
        </div>
      );
    });
    return items;
  }

  render() {
    return (
      <Card className="shadow">
        <CardHeader>
          <Row>
            <p className="h5">
              <i className="fas fa-sitemap mr-1 ml-1" />
              Security Hierarchy
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
            ></Col> */}
          </Row>
        </CardHeader>
        <CardBody>
          {this.props.hierarchy.map((row, index) => {
            let lowestLevel = this.props.hierarchy[0]?.level;
            this.props.hierarchy.forEach((d) => {
              if (lowestLevel >= d.level) {
                lowestLevel = d.level;
              }
            });

            if (row.level == lowestLevel) {
              return (
                <div
                  key={index}
                  id="cursor-pointer"
                  className="cursor-pointer"
                  style={{ marginLeft: row.level * 20, cursor: "pointer" }}
                >
                  <i className="fa fa-caret-down mr-2" onClick={() => this.toggleChildren(row.id)} />
                  <span onClick={() => this.props.onFilter(row.id) & this.toggleChildren(row.id)}>
                    <i className="fa fa-folder-o mr-2" />
                    {row.name}
                  </span>
                  <br />
                  {this.getHierarchyChildren(row.id)}
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

export default connect((state) => ({ allFields: state.allFields }))(HierarchyMapStructure);
