import React from "react";
import { getDocumentTypes, deleteDocumentType } from "./api";
import DocumentTypeMapStructure from "./DocumentTypeMapStructure";
import DocumentTypeList from "./DocumentTypeList";
import { loadAllFields } from "redux/actions/apiAction";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import metaRoutes from "config/meta_routes";
import { Row, Col } from "reactstrap";

class DocumentTypeDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.onFilter = this.onFilter.bind(this);
  }

  state = {
    documentTypes: [],
    documentTypesOnTable: [],
  };

  onFilter(parentId) {
    const filteredData = this.props.documentTypes?.filter((item) => {
      if (item.parentId === parentId) {
        return 1;
      }
      return 0;
    });
    this.setState({
      documentTypesOnTable: filteredData,
    });
  }

  deleteDocumentType = (id) => {
    if (window.confirm("Are you sure, you want to delete?")) {
      deleteDocumentType(id, (err, data) => {
        if (err) this.history.push(metaRoutes.adminDocumentTypes);
        if (data.success) {
          this.updateData();
          toast.success("Successful!");
          this.props.dispatch(loadAllFields());
        } else {
          toast.error(data.message);
        }
      });
    }
  };

  updateData = () => {
    getDocumentTypes((err, data) => {
      if (err) return;
      if (data.success) {
        this.setState(
          {
            documentTypes: data.data,
          },
          () => {
            this.onFilter(null);
          }
        );
      }
    });
  };

  componentDidMount() {
    this.updateData();
  }

  renderItems() {
    return (
      <Row>
        <Col md={4}>
          <DocumentTypeMapStructure documentTypes={this.props.documentTypes} onFilter={this.onFilter} {...this.props} />
        </Col>
        <Col md={8} className="pl-3 pl-md-0">
          {" "}
          <DocumentTypeList
            documentTypesOnTable={this.state.documentTypesOnTable}
            deleteDocumentType={this.deleteDocumentType}
            {...this.props}
          />
        </Col>
      </Row>
    );
  }

  render() {
    return this.renderItems();
  }
}
export default connect((state) => ({
  users: state.allFields.users,
  documentTypes: state.allFields.documentTypes,
}))(DocumentTypeDashboard);
