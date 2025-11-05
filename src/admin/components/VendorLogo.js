import React from "react";
import { selectedVendor, banks, onlyForThisVendor } from "config/bank";

let logoImage;
switch (selectedVendor) {
  case banks.rbb.name:
    logoImage = "img/rbb.jpg";
    break;

  case banks.bok.name:
    logoImage = "img/bok.png";
    break;
  case banks.citizen.name:
    logoImage = "img/citizens.jpg";
    break;
  case banks.everest.name:
    logoImage = "img/everest.jpg";
    break;
  case banks.epf.name:
    logoImage = "img/epf.png";
    break;
  default:
    logoImage = null;
}

const VendorLogo = () => {
  return (
    <>

      {/* <img
      // src={
      //   onlyForThisVendor(banks.bok.name)
      //     ? "img/bok.png"
      //     : "img/rbb.jpg"
      // }
      src={logoImage}
      alt="Logo"
    /> */}

    </>
  );
};

export default VendorLogo;
