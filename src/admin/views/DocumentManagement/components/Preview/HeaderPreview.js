import React from "react";
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from "reactstrap";
export default function HeaderPreview(props) {
  const { setState, state, attachments, previewFile } = props;
  const fileAttachments = attachments.filter((row) => !row.fileType.includes("parent"));
  return (
    <>
      <div className="baseHeaderLayout">
        {fileAttachments.length > 0 && (
          <Dropdown
            isOpen={state.isDropdownOpen}
            toggle={() => setState({ ...state, isDropdownOpen: !state.isDropdownOpen })}
          >
            <DropdownToggle caret>
              <i className="fas fa-file"></i> Select File
            </DropdownToggle>
            <DropdownMenu
              style={{
                zIndex: 1020,
              }}
            >
              {fileAttachments.map((row, index) => {
                return (
                  <DropdownItem className="flex-wrap" key={index} title={row.name} onClick={() => previewFile(row.id)}>
                    <small>{row.name}</small>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </Dropdown>
        )}
        <h5 className="m-0 pr-2 text-center">Preview File</h5>

        <div>
          {fileAttachments.length > 0 && <span className="float-right pt-2 pl-3 pr-3"></span>}

          {/* {fileAttachments.length > 0 && state.isImage && (
            <span
              className="float-right pt-2 btn btn-secondary rounded btn-sm pl-3 pr-3"
              onClick={() => {
                setState({ ...state, isImage: state.isImage });
              }}
            >
              <i className="fas fa-file"></i> View Files
            </span>
          )} */}
        </div>
      </div>
    </>
  );
}
