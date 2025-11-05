import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Row } from "reactstrap";
import { Link } from "react-router-dom";
import A from "config/url";
import metaRoutes from "config/meta_routes";

const DepartmentMapStructure = ({ departments, onFilter }) => {
  if (!Array.isArray(departments) || (departments.success === false)) {
    return null; // Render nothing if no departments or unsuccessful fetch
  }

  const [expandedNodes, setExpandedNodes] = useState({}); // Tracks expanded nodes

  useEffect(() => {
    // Initialize with no nodes expanded
    setExpandedNodes({});
  }, [departments]);

  const toggleNode = (id) => {
    setExpandedNodes((prevState) => ({
      ...prevState,
      [id]: !prevState[id], // Toggle the expanded state for the given ID
    }));
  };

  const lowestLevel = Math.min(...departments.map((d) => d.level));

  // Group departments by their departmentParentId
  const groupByParentId = (departments) => {
    return departments.reduce((acc, department) => {
      if (!acc[department.parentId]) acc[department.parentId] = [];
      acc[department.parentId].push(department);
      return acc;
    }, {});
  };

  const groupedDepartment = groupByParentId(departments);

  // Function to recursively render child departments and branches
  const renderTree = (parentId, level) => {
    const nodes = groupedDepartment[parentId] || [];

    return nodes
      .filter((node) => node.level === level) // Only render nodes of the current level
      .map((node) => (
        <div key={node.id} style={{ marginLeft: (level - lowestLevel) * 10, cursor: "pointer" }}>
          <i
            className={`fa ${expandedNodes[node.id] ? "fa-caret-down" : "fa-caret-right"} mr-2`}
            onClick={() => toggleNode(node.id)}
          />
          <span onClick={() => onFilter(node.id)}>
            <i className="fa fa-folder-o mr-2" />
            {node.name}
            <Link
              to={`${metaRoutes.adminDepartmentsEdit}?i=${A.getHash(node.id)}`}
              style={{ marginLeft: 8 }}
            >
              [EDIT]
            </Link>
          </span>
          <br />
          {expandedNodes[node.id] && (
            <>
              {/* Render the branches */}
              {node.branches &&
                node.branches.map((branch) => (
                  <div key={branch.id} style={{ marginLeft: (level + 1 - lowestLevel) * 10 }}>
                    <i className="fa fa-folder-open mr-2" />
                    {branch.name}
                  </div>
                ))}
              {/* Recursively render child departments */}
              {renderTree(node.id, level + 1)}
            </>
          )}
        </div>
      ));
  };

  // Get the departments that are at the lowest level
  const lowestLevelDepartments = departments.filter((node) => node.level === lowestLevel);

  return (
    <Card className="shadow">
      <CardHeader>
        <Row>
          <p className="h5">
            <i className="fas fa-building mr-1" />
            Department List
          </p>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => onFilter(null)}
            className="btn-header btn btn-outline-dark btn-sm border-dark border"
          >
            <i className="fa fa-refresh" />
          </span>
        </Row>
      </CardHeader>
      <CardBody>
        {lowestLevelDepartments.map((node) => (
          <div key={node.id} style={{ marginLeft: (node.level - lowestLevel) * 20 }}>
            <i
              className={`fa ${expandedNodes[node.id] ? "fa-caret-down" : "fa-caret-right"} mr-2`}
              onClick={() => toggleNode(node.id)}
            />
            <span onClick={() => onFilter(node.id)}>
              <i className="fa fa-folder-o mr-2" />
              {node.name}
              <Link
                to={`${metaRoutes.adminDepartmentsEdit}?i=${A.getHash(node.id)}`}
                style={{ marginLeft: 10 }}
              >
                [EDIT]
              </Link>
            </span>
            <br />
            {expandedNodes[node.id] && (
              <>
                {node.branches &&
                  node.branches.map((branch) => (
                    <div key={branch.id} style={{ marginLeft: (node.level + 1 - lowestLevel) * 20 }}>
                      <i className="fa fa-folder-open mr-2" />
                      {branch.name}
                    </div>
                  ))}
                {renderTree(node.id, node.level + 1)}
              </>
            )}
          </div>
        ))}
      </CardBody>
    </Card>
  );
};

export default DepartmentMapStructure;
