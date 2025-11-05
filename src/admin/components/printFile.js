import React, { Children, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import QRCode from "qrcode.react";

// import { ComponentToPrint } from "./ComponentToPrint";

const PrintFile = ({ component, documentData }) => {
  const componentRef = useRef();
  const [toggle, setToggle] = useState(false);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  function handleOnclick() {
    handlePrint();
    setToggle(!toggle);
  }

  return (
    <div>
      {/* <ComponentToPrint ref={componentRef} /> */}
      {toggle && (
        <div ref={componentRef}>
          <div style={{ padding: 20 }}>
            <QRCode value={documentData.identifier} className="border p-1 w-50 h-50 " />
          </div>
        </div>
      )}
      <button className=" btn btn-secondary rounded btn-sm" onClick={handleOnclick}>
        <i className="fas fa-print"></i>
        {!toggle ? " View QR" : " Print this QR out!!"}
      </button>
    </div>
  );
};

export default PrintFile;
