import React, { useState } from "react";
import Modal from "../Modal";
import info_add_document from "./info_add_document";
import info_add_branch from "./info_add_branch";
import infor_add_department from "./infor_add_department";
import info_add_security_hierarchy from "./info_add_security_hierarchy";
import info_add_users from "./info_add_users";
import info_add_document_types from "./info_add_document_types";
import info_add_document_index from "./info_add_document_index";
import info_add_location_types from "./info_add_location_types";
import info_add_location_map from "./info_add_location_map";
import info_add_language from "./info_add_language";
import info_add_document_condition from "./info_add_document_condition";

export default function InfoModal({ children, type, ModalTitle }) {
  const [isOpen, setisOpen] = useState(false);
  function hanldeClose() {
    setisOpen(!isOpen);
  }

  let information = {};
  switch (type) {
    case "document":
      information = info_add_document;
      break;
    case "branch":
      information = info_add_branch;
      break;
    case "department":
      information = infor_add_department;
      break;
    case "security_hierarchy":
      information = info_add_security_hierarchy;
      break;
    case "users":
      information = info_add_users;
      break;
    case "document_types":
      information = info_add_document_types;
      break;
    case "document_index":
      information = info_add_document_index;
      break;
    case "location_types":
      information = info_add_location_types;
      break;
    case "location_map":
      information = info_add_location_map;
      break;
    case "language":
      information = info_add_language;
      break;
    case "document_condition":
      information = info_add_document_condition;
      break;
    default:
      break;
  }

  return (
    <>
      <span style={{ cursor: "pointer" }} onClick={hanldeClose}>
        <i className="fa fa-info" />
      </span>
      <Modal open={isOpen} close={hanldeClose} name={ModalTitle}>
        {Object.entries(information).map(([key, value], index) => {
          return (
            <div>
              <div className="container">
                <div className="row">
                  <div className="col-4">
                    <b> {key}:</b>
                  </div>
                  <div className="col-8 border-left text-muted">{value}</div>
                </div>
              </div>
            </div>
          );
        })}
      </Modal>
    </>
  );
}
