import React from "react";
import { searchDocuments, deleteDocument } from "./api";
import { Input, Row, Col, Card } from "reactstrap";
import DocumentListTable from "./components/DocumentListTable";

import { connect } from "react-redux";
import { setDocPageNo } from "redux/actions/documentAc";
import { searchDocumentsPagination } from "./api/document";

var count = 0;
class ExpiredDocumentList extends React.Component {
  state = {
    documentList: [],
    expiryDate: 1,
  };

  handleSelect = (number) => {
    if (number > 0 && number - 1 < this.state.totalItems / 10) {
      this.setState({
        currentPageNumber: number,
        startOffset: (number - 1) * 10,
      });
    }
  };

  sortBy = (key) => {
    const sort = this.state.tableData;
    sort.sort((a, b) => {
      try {
        if (a[key].toLowerCase() < b[key].toLowerCase()) {
          return -1;
        }
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return 1;
        }
        return 0;
      } catch (err) {
        return -1;
      }
    });
    this.setState({
      tableData: sort,
    });
  };

  loadData() {
    let search = { expiryDate: this.state.expiryDate };
    searchDocumentsPagination(
      search,
      (err, json) => {
        if (err) return;
        if (json.success) {
          this.setState(
            {
              documentList: json.paginationDocument,
            },
            () => {
              this.forceUpdate();
            }
          );
        } else {
          window.alert(json.message);
        }
      },
      { page: 1, limit: 10 }
    );
  }

  handleChange = (event) => {
    const value = event.target.value;
    if (value <= 0 || value == "" || value == null) {
      this.setState({
        expiryDate: value,
      });
    } else
      this.setState(
        {
          expiryDate: value,
        },
        () => {
          this.loadData();
        }
      );
  };

  deleteDocument(id) {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }
    deleteDocument(id, (err, json) => {
      if (json.success) {
        window.location.reload();
      } else {
        window.alert(json.message);
      }
    });
  }

  componentDidMount() {
    this.setState(this.props.allFields);
    this.loadData();
    if (count === 0) {
      this.props.dispatch(setDocPageNo(1));
    }
    return () => {
      count++;
    };
  }

  render() {
    return (
      <>
        <Card className="p-1 rounded">
          <Row className="d-flex align-items-center">
            <Col md={4} xs={4}>
              <Input
                type="number"
                className="form-control rounded"
                onChange={this.handleChange}
                value={this.state.expiryDate}
              />
            </Col>
            <Col md={4} xs={8}>
              <h6 className="mt-2">week/s for the expiry of the documents</h6>
            </Col>
            <Col md={6}></Col>
          </Row>
        </Card>
        <DocumentListTable
          title="Expired Document List"
          documentList={this.state.documentList}
          showControl={false}
          permissions={this.props.permissions}
          {...this.state.data}
        />
      </>
    );
  }
}

export default connect((state) => ({ allFields: state.allFields }))(ExpiredDocumentList);
