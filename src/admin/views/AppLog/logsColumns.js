import { Badge, Spoiler } from "@mantine/core";
import moment from "moment";
import React from "react";

export default function logsColumns({ data, getColumnSearchProps }) {
  // if (data) {
  //   const column = data.length > 0 ? data[0] : {};
  //   let columns = [];
  //   Object.entries(column).map(([key, value]) => {
  //     columns.push({
  //       title: key,
  //       dataIndex: key,
  //       key,
  //       sorter: (a, b) => a.id - b.id,
  //       ...getColumnSearchProps(key),
  //       render: (text) => {
  //         let backgroundColor = "";
  //         switch (String(text)) {
  //           case "true":
  //             backgroundColor = "#0F6AB4";
  //             break;
  //           case "false":
  //             backgroundColor = "#75ba24";
  //           case "GET":
  //             backgroundColor = "#000000";
  //             break;
  //           case "POST":
  //             backgroundColor = "#75ba24";
  //             break;
  //           case "PUT":
  //             backgroundColor = "#ec8702";
  //             break;
  //           case "DELETE":
  //             backgroundColor = "#d64f4e";
  //             break;
  //           default:
  //             backgroundColor = "";
  //             if (typeof text == "string" && text.length >= 70) {
  //               return (
  //                 <Spoiler
  //                   maxHeight={70}
  //                   showLabel="Show more"
  //                   hideLabel="Hide"
  //                 >
  //                   {text}
  //                 </Spoiler>
  //               );
  //             }

  //             return typeof text == "boolean" ? (
  //               <Badge
  //                 radius="md"
  //                 variant="filled"
  //                 style={{ background: backgroundColor }}
  //               >
  //                 {String(text)}
  //               </Badge>
  //             ) : (
  //               text
  //             );
  //         }
  //       },
  //     });
  //   });

  //   return columns;
  // }
  return [
    {
      title: "S.N",
      dataIndex: "id",
      key: "id",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Model Type",
      dataIndex: "name",
      key: "name",
      defaultSortOrder: "ascend",
      filters: [
        {
          text: "DOCUMENT",
          value: "DOCUMENT",
        },
        {
          text: "ATTACHMENT",
          value: "ATTACHMENT",
        },
        {
          text: "ROLES",
          value: "ROLES",
        },
        {
          text: "USER",
          value: "USER",
        },
        {
          text: "SECURITY_HIERARCHY",
          value: "SECURITY_HIERARCHY",
        },
        {
          text: "LOCATION_MAP",
          value: "LOCATION_MAP",
        },
        {
          text: "DOCUMENT_TYPES",
          value: "DOCUMENT_TYPES",
        },
        {
          text: "DOCUMENT_INDEX",
          value: "DOCUMENT_INDEX",
        },
      ],
      onFilter: (value, record) => record.name.startsWith(value),
    },

    {
      title: "Operation Type",
      dataIndex: "operation",
      key: "operation",
      filters: [
        {
          text: "GET",
          value: "GET",
        },
        {
          text: "POST",
          value: "POST",
        },
        {
          text: "DELETE",
          value: "DELETE",
        },
        {
          text: "PUT",
          value: "PUT",
        },
      ],
      onFilter: (value, record) => record.operation.startsWith(value),
      render: (_, { operation }) => {
        let backgroundColor = "";
        switch (operation) {
          case "GET":
            backgroundColor = "#0F6AB4";
            break;
          case "POST":
            backgroundColor = "#75ba24";
            break;
          case "PUT":
            backgroundColor = "#ec8702";
            break;
          case "DELETE":
            backgroundColor = "#d64f4e";
            break;
          default:
            backgroundColor = "#000000";
            break;
        }

        return (
          <Badge radius="md" variant="filled" style={{ background: backgroundColor }}>
            {operation}
          </Badge>
        );
      },
    },

    {
      title: "Query",
      dataIndex: "query",
      key: "query",

      render: (_, { query }) => {
        return (
          <>
            <Spoiler maxHeight={100} showLabel="Show more" hideLabel="Hide">
              {query}
            </Spoiler>
          </>
        );
      },
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      ...getColumnSearchProps("url"),
    },
    {
      title: "Ip Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      ...getColumnSearchProps("ipAddress"),
    },
    {
      title: "Changes",
      dataIndex: "diff",
      key: "diff",
      width: "20%",
      render: (_, { diff }) => {
        return showDifference(diff);
      },
      // ...getColumnSearchProps("diff"),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      ...getColumnSearchProps("createdBy"),
    },
    {
      title: "identityNo",
      dataIndex: "identityNo",
      key: "identityNo",
      ...getColumnSearchProps("identityNo"),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (_, { createdAt }) => {
        return (
          <>
            <span>{moment(createdAt).format("ll")}</span>
          </>
        );
      },
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",

      render: (_, { updatedAt }) => {
        return (
          <>
            <span>{moment(updatedAt).format("ll")}</span>
          </>
        );
      },
    },
  ];
}

function showDifference(diff) {
  try {
    const data = JSON.parse(diff);
    if (typeof data == "object")
      return (
        <>
          {Object.entries(data).map(([key, value]) => {
            if (typeof value == "string" || typeof value == "number")
              return (
                <p>
                  <b>{key}</b>: {value}{" "}
                </p>
              );

            if (typeof value == "boolean")
              return (
                <p>
                  <b>{key}</b>: {value ? "true" : "false"}{" "}
                </p>
              );
          })}
        </>
      );
  } catch (error) {
    return " No data";
  }
}
