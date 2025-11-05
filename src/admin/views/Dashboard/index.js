import React from "react";
// import TagCloud from './TagCloud';
import "./styles.css";
import MainDashboard from "./MainDashboard";
import { getDocumentByMonth, getActiveDocument, getTotalDocument } from "./api/dashboard";

export default class Dashboard extends React.Component {
  state = {
    monthName: [],
    monthValue: [],
    activeDocument: [],
    documentValue: [],
    documentType: [],
    totalDocuments: [],
    deleteLogs: [],
  };

  // updateData() {
  //   getDocumentByMonth((err, data) => {
  //     if (!err) {
  //       const name = [];
  //       const count = [];
  //       for (let i = 0; i < data.length; i++) {
  //         name.push(data[i].month);
  //         count.push(data[i].count);
  //       }
  //       this.setState({
  //         monthName: name,
  //         monthValue: count,
  //       });
  //     }
  //   });
  // }

  // getDocumentData() {
  //   getActiveDocument((err, data) => {
  //     if (!err) {
  //       const activeDoc = [];
  //       const count = [];
  //       for (let i = 0; i < data.length; i++) {
  //         activeDoc.push(data[i].docName);
  //         count.push(data[i].count);
  //       }
  //       this.setState({
  //         activeDocument: activeDoc,
  //         documentValue: count,
  //       });
  //     }
  //   });
  // }

  // getTotalDoc() {
  //   getTotalDocument((err, data) => {
  //     if (!err) {
  //       const docType = [];
  //       const Doc = [];
  //       for (let i = 0; i < data.length; i++) {
  //         docType.push(data[i].nameOfDoc);
  //         Doc.push(data[i].totalDoc);
  //       }
  //       this.setState({
  //         documentType: docType,
  //         totalDocuments: Doc,
  //       });
  //     }
  //   });
  // }

  // componentDidMount() {
  //   this.updateData();
  //   this.getDocumentData();
  //   this.getTotalDoc();
  // }

  render() {
    return <MainDashboard />;
  }
}
