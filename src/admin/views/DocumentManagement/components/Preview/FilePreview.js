
import React from "react";
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import FileViewer from "react-file-viewer"; //FILE VIEWER
import { PDFViewer } from "react-view-pdf";

export default function FilePreview({ state, p }) {
  return (
    <div id="other-preview-container"   style={{display: state.isImage ? "none" : "block"}}>
      {/* can be used for pdf preview or other files */}
      {/* <DocViewer
        pluginRenderers={DocViewerRenderers}
        documents={[{ uri: state.previewFilePath }]}
      /> */}

      {state.isPDF && state.previewFilePath ? (
        <PDFViewer url={state.previewFilePath} />
      ) : (
        // <DocViewer
        //   pluginRenderers={DocViewerRenderers}
        //   documents={[{ uri:  }]}
        //   config={{
        //     header: {
        //       disableHeader: true,
        //       disableFileName: true,
        //       retainURLParams: true,
        //     },
        //   }}
        // />
        // <embed
        //   src={
        //     state.previewFilePath +
        //     "#toolbar=" +
        //     String(p.download ? 1 : 0)
        //   }
        //   type="application/pdf"
        //   width="100%"
        //   height="630px"
        // />
        
        <div style={{ overflow: "hidden", width: "100%", height: "500px" }}>
        <FileViewer
          fileType={state.previewFileType}
          filePath={state.previewFilePath}
          errorComponent={<div>Error!</div>}
          onError={() => {
            console.log("Error loading file");
          }}
        />
      </div>
      )}
    </div>
  );
}
