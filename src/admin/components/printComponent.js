import React, { useRef } from "react";
import { useState } from "react";
import Pdf from "react-to-pdf";
import ReactToPrint from "react-to-print";
import PrintTemplate from "./PrintTemplate";
import { FaDownload, FaPrint } from "react-icons/fa";

const ref = React.createRef();

const PDF = (props) => {
  const [print, setPrint] = useState(false);
  const componentRef = useRef();

  function togglePrint(toPdf) {
    setPrint(true);
    toPdf();
    setPrint(false);
  }

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button>
            <FaPrint className="pencil" />
            <span className="bg-blue-500 dash" />
            {/* Print */}
          </button>
        )}
        content={() => componentRef.current}
      />
      <Pdf targetRef={ref} filename="post.pdf">
        {({ toPdf }) => (
          <button onClick={toPdf}>
            <FaDownload className="pencil" />
            <span className="bg-blue-500 dash" />
            {/* Download */}
          </button>
        )}
      </Pdf>
      <ComponentToPrint ref={componentRef} table_data={props.table_data} invoice={props.table_data.invoice} />
    </>
  );
};

export const ComponentToPrint = React.forwardRef((props, ref) => {
  // console.log('dslklf', props.invoice);
  return (
    <div ref={ref}>
      <PrintTemplate data={props.table_data} />
    </div>
  );
});
export default PDF;
