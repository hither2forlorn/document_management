import { Table } from "antd";
import React from "react";
import { CSVLink } from "react-csv";

export default function AntTable({ data, pageSize, current, total, columns, onChange, dataChange, filterTable }) {
  return (
    <div>
      <Table
        onChange={dataChange}
        scroll={{ x: 400 }}
        dataSource={filterTable == null ? data : filterTable}
        columns={columns}
        pagination={{
          current: current,
          pageSize,
          total,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["2", "3", "10", "100"],
          showTotal: (total) => `Total ${total} logs`,
          onChange: onChange,
        }}
      />
      <CSVLink data={data} filename={"Logs.csv"}>
        Download Report
      </CSVLink>
      <br />
    </div>
  );
}
