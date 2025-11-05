import React, { useMemo } from "react";
import _, { forEach } from "lodash";

import { banks, dms_features, excludeThisVendor, includeThisFeature, onlyForThisVendor } from "config/bank";
import { Badge } from "@mantine/core";
import { Chip, LinearProgress } from "@mui/material";

import { getValue } from "config/util";
import moment from "moment";

import CustomTableAction from "admin/components/CustomTableAction";
// import { DeleteIcon } from "@chakra-ui/icons";
import { getLocationData } from "admin/views/Util/GetLocationName";
import useIsSuperAdmin from "admin/hooks/useIsSuperAdmin";
import { Button } from "antd";

const indexDataTypes = {
  province: "province",
  date: "date",
  district: "district",
  tag: "tag",
  dynamicCombox: "dynamicCombox",
};

export default function useAttachmentColumns({
  downloadFile,
  deleteFile,
  handleEditButton,
  props,
  isPrimary,
  handleModelView,
  userIsMaker,
  p,
  showInAttachment,
}) {
  const isSuperAdmin = useIsSuperAdmin();

  const AttachRow = (item) => {
    switch (item.dataType) {
      case indexDataTypes.province:
        return getLocationData(props.allFields.provinces, item.value).name;

      case indexDataTypes.district:
        return getLocationData(props.allFields.districts, item.value)?.name || item.value;

      case indexDataTypes.dynamicCombox:
        return getLocationData(props.allFields.constants, item.value)?.name || item.value;

      case indexDataTypes.tag:
        return (
          <>
            {item &&
              typeof JSON.parse(item?.value) == "object" &&
              JSON.parse(item?.value)?.map((item) => <Chip label={item} variant="outlined" style={{ marginRight: 5 }} />)}
          </>
        );

      default:
        return item.value;
    }
  };
  let columnData = [
    {
      Header: "S.N",
      accessor: "serial",
    },
    {
      Header: "Name",
      accessor: "name",
      Cell: (row) => {
        return isPrimary ? (
          <div
            className="text-break"
            style={{ color: "#00e", cursor: "pointer" }}
            onClick={() => downloadFile(row.row.original.id)}
          >
            {row.value}{" "}
            {row.row.original?.pendingApproval && includeThisFeature(dms_features.DEFAULT_MAKER_CHECKER_DOCUMENTS) && (
              <Badge color="orange" variant="filled">
                Not Approved
              </Badge>
            )}
          </div>
        ) : (
          <div>{row.value}</div>
        );
      },
    },
    {
      Header: "Document Type",
      accessor: "documentType", // placeholder for accessor
      Cell: ({ row }) => {
        return row?.original?.documentType ? row?.original?.documentType : ""
      },
    },
    {
      Header: "Created By",
      accessor: "createdBy", // accessor is the "key" in the data
      Cell: (row) => {
        return row?.row?.original?.username ? row.row.original.username : "confidential";
      },
    },
    {
      Header: "Upload Date",
      accessor: "updatedAt",
      Cell: (row) => moment(row.value).format("dddd, MMMM Do YYYY"),
    },
    {
      Header: "Actions",
      accessor: "action",
      disableSortBy: true,


      Cell: (row) => {
        return isPrimary ? (
          <div style={{ cursor: "pointer" }}>
            {includeThisFeature(dms_features.UPLOAD_ATTACHMENT_MODAL) && (
              <CustomTableAction
                onClick={() => handleEditButton(row.row.original.id)}
                permission={p.attachment}
                buttonType="edit"
              />
            )}
            <CustomTableAction
              onClick={() => handleModelView(row.row.original.itemId, row.row.original.name)}
              permission={p.attachment}
              buttonType="attachmentVersioning"
              doNotAllow={isSuperAdmin ? false : row.row.original.sendToChecker && userIsMaker}
              // user mistake and user is maker of current document also is pending approval
              // Then maker can view file
              makerMistakeDoc={
                (userIsMaker && p?.maker && !props.documentData.sendToChecker && !props.documentData.returnedByChecker) ||
                (row.row.original.pendingApproval && p?.maker)
              }
            />
            <CustomTableAction
              onClick={() => deleteFile(row.row.original.id)}
              permission={p.attachment}
              buttonType="delete"
              doNotAllow={isSuperAdmin ? false : row.row.original.sendToChecker && userIsMaker}
              // user mistake and user is maker of current document also is pending approval
              // Then maker can delete file
              makerMistakeDoc={
                (userIsMaker && p?.maker && !props.documentData.sendToChecker && !props.documentData.returnedByChecker) ||
                (row.row.original.pendingApproval && p?.maker)
              }
            />
          </div>
        ) : (
          <div></div>
        );
      },
    },
  ];

  // feature only for selected vendors
  if (includeThisFeature(dms_features.EDIT_ATTACHMENTS))
    // added document type, indexes and associtaed id in table
    columnData.splice(
      2,
      0,
      {
        Header: "Document Type",
        accessor: "documentType",
      },
      {
        Header: "Indexes",
        accessor: "showInAttachment",
        Cell: ({ row }) => {
          const id = row.original.id;
          return (
            !props.hourlyAccessForUser && (
              <div className="text-break">
                {showInAttachment ? (
                  showInAttachment.map((show) => {
                    if (show.id === id)
                      return (
                        <p>
                          {show.label} = {AttachRow(show)}
                        </p>
                      );
                  })
                ) : (
                  <p></p>
                )}
              </div>
            )
          );
        },
      },
      {
        ...(includeThisFeature(dms_features.ASSOCIATED_IDS)
          ? {
            Header: "Associated IDs",
            accessor: "associatedIds",
            Cell: ({ row }) => {
              return (
                <>
                  {props?.associatedBokIds?.map((show) => {
                    if (show.attachId == row.original.id) return <p>{show.value}</p>;
                  })}
                </>
              );
            },
          }
          : null),
      }
    );

  columnData = columnData.filter((row) => Object.keys(row).length > 0);

  // React Table
  return useMemo(() => columnData, [props]);
}
