import React from "react";
import { searchDocuments, deleteDocument } from "./api";
import DocumentListTable from "./components/DocumentListTable";

export default class DocumentList extends React.Component {
  state = {
    documentList: [],
  };

  loadData() {
    let search = this.props.searchData;
    searchDocuments(search, (err, json) => {
      if (err) return;
      if (json.success) {
        this.setState(
          {
            documentList: json.data,
          },
          () => this.forceUpdate()
        );
        // console.log(this.state.documentList);
      } else {
        window.alert(json.message);
      }
    });
  }

  deleteDocument = (id) => {
    if (!window.confirm("Do you want to delete this file?")) {
      return;
    }
    deleteDocument(id, (err, json) => {
      if (err) return;
      this.loadData();
    });
  };

  componentWillReceiveProps() {
    this.loadData();
  }

  render() {
    return (
      <DocumentListTable
        title="Document List"
        documentList={this.state.documentList}
        showControl={true}
        deleteDocument={this.deleteDocument}
        permissions={this.props.permissions}
      />
    );
  }
}
