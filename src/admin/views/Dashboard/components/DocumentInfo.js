import React from "react";
import { CardDeck } from "reactstrap";
import DeleteLogReport from "./DeleteLog";
import DocumentTypeReport from "./DocumentType";
import UsedTags from "./Usedtags";
// import DocumentStatusReport from "./DocumentStatus";

const DocumentInfo = (props) => {
  return (
    <>
      <CardDeck className="my-3">
        <DocumentTypeReport />
        <DeleteLogReport />

        {/* <DocumentStatusReport /> */}
      </CardDeck>
      <UsedTags />
    </>
  );
};

export default DocumentInfo;
