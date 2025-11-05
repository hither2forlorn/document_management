// import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import { Input } from "reactstrap";
function Captcha() {
  const [user, setUser] = useState({
    username: "",
  });

  const characters = "abc123";
  function generateString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const captcha = generateString(6); // Function called here and save in captcha variable
  let handleChangeCaptcha = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    user[name] = value;
    setUser(user);
  };
  const onSubmit = (e) => {
    var element = document.getElementById("succesBTN");
    var inputData = document.getElementById("inputType");
    element.style.cursor = "wait";
    element.innerHTML = "Checking...";
    inputData.disabled = true;
    element.disabled = true;
    var myFunctions = function () {
      if (captcha == user.username) {
        element.style.backgroundColor = "green";
        element.innerHTML = "Captcha Verified";
        element.disabled = true;
        element.style.cursor = "not-allowed";
        inputData.style.display = "none";
      } else {
        element.style.backgroundColor = "red";
        element.style.cursor = "not-allowed";
        element.innerHTML = "Not Matched";
        element.disabled = true;
        //  element.disabled = true;
        var myFunction = function () {
          element.style.backgroundColor = "#007bff";
          element.style.cursor = "pointer";
          element.innerHTML = "Verify Captcha";
          element.disabled = false;
          inputData.disabled = false;
          inputData.value = "sssss";
        };
        setTimeout(myFunction, 1000);
      }
    };
    setTimeout(myFunctions, 1000);
  };

  return (
    <div class="">
      <h4>Captcha Verification</h4>
      <p className="small">Please Enter Code In Below Text Field</p>
      <Input
        style={{ border: "0", background: "white", fontSize: "20px", marginLeft: "-10px" }}
        placeholder={captcha}
        readOnly
        disabled
        type="text"
        id="captcha_show"
        className="bold"
        onPaste={(e) => {
          e.preventDefault();
          return false;
        }}
        onCopy={(e) => {
          e.preventDefault();
          return false;
        }}
      ></Input>

      <div class="form-group">
        <input
          type="text"
          id="inputType"
          placeholder="Enter Captcha"
          name="username"
          onChange={handleChangeCaptcha}
          autocomplete="off"
          style={{
            height: "50x",
            border: "1px solid #cccaca",
            borderRadius: "1px",
          }}
        />
        <text className="btn border-box small" id="captcha_reload" style={{ marginTop: "8px" }}>
          <i
            onClick={(e) => {
              generateString(6);
            }}
            className=" fas fa-recycle"
          ></i>
        </text>
        <button id="succesBTN" onClick={onSubmit} class="btn btn-primary btn-sm mt-2">
          Verify Captcha
        </button>
      </div>
    </div>
  );
}
export default Captcha;
