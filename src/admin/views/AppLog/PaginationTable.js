import React, { useState, useRef } from "react";
import { paginationLogs, reporting } from "./api";
import moment from "moment";
import AntPagination from "../DocumentManagement/components/AntPagination";
import { useQuery } from "react-query";
import { Button, DatePicker, Input, InputNumber, Select, Space } from "antd";
import { ContactsOutlined, SearchOutlined } from "@ant-design/icons";

import Highlighter from "react-highlight-words";
import logsColumns from "./logsColumns";
export default function PaginationTable({ queryId }) {
  const { Search } = Input;
  const { Option } = Select;
  const [filteredInfo, setFilteredInfo] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const [pager, setPager] = useState(10);
  const [limit, setlimit] = useState(5);
  const [filterTable, setFilterTable] = useState(null);
  const [searchValue, setSearchValue] = useState();
  const [filterValue, setFilterValue] = useState({ name: "", value: "" });
  const handleChange = (filters, sorter) => {
    setFilteredInfo(filters);
  };

  const pageChangeHandler = (pg, pageSize) => {
    setlimit(pageSize);
    setPager(pg);
  };

  const onSearchValue = (value) => {
    const filterData = data.filter((o) =>
      Object.keys(o).some((k) => String(o[k]).toLowerCase().includes(value.toLowerCase()))
    );
    setSearchValue(value);

    setFilterTable(filterData);
  };

  const { isLoading, error, data } = useQuery(["logs_data", queryId], () => {
    return paginationLogs({
      page: pager,
      limit,
      search: filterValue,
      queryId,
    });
  });

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  // const combo = {
  //   Operation__STRING: "STRING".toLowerCase(),
  //   Id__NUMBER: "DATE".toLowerCase(),
  //   idd__number: "NUMBER".toLowerCase(),
  //   operation_two: "String".toLowerCase(),
  //   operationid: "Number".toLowerCase(),
  // };
  const combo = {};

  const columnData = logsColumns({ data: data?.data, getColumnSearchProps });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValue({ ...filterValue, [name]: value });
    console.log(name, value);
  };

  return (
    <>
      <div
        class="container"
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1rem",
          gap: "1rem",
        }}
      >
        {Object.entries(combo).map(([key, value]) => {
          switch (value) {
            case "number":
              return (
                <InputNumber
                  style={{ width: "250px" }}
                  name={key}
                  placeholder={`Please enter ${key} ...`}
                  onChange={handleFilterChange}
                />
              );
            case "string":
              return <Input name={key} placeholder={`Please enter ${key} ...`} onChange={handleFilterChange} />;
            case "date":
              return <DatePicker placeholder={`Please enter ${key} ...`} />;
            default:
              break;
          }
        })}

        {/*
        <div>
          <Select defaultValue="POST" style={{ width: "200px" }}>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
          </Select>
        </div>

        */}
      </div>

      <AntPagination
        filterTable={filterTable}
        dataChange={handleChange}
        columns={columnData}
        data={data.data}
        pageSize={limit}
        onChange={pageChangeHandler}
        current={pager}
        total={data?.count}
      />
    </>
  );
}
