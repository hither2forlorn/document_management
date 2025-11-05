import React from "react";
import { ErrorBoundary } from "error/ErrorBoundary";
import { Fallback } from "error/Fallback";
import { createRoot } from "react-dom/client";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

const errorHandler = (error, errorInfo) => {
  console.log("logging", error, errorInfo);
};

document.addEventListener("contextmenu", (event) => event.preventDefault());

root.render(
  <ErrorBoundary FallbackComponent={Fallback} onError={errorHandler}>
    <App />
  </ErrorBoundary>
);

logOutAfterTimeOut();
function logOutAfterTimeOut() {
  var t;
  window.onmousemove = resetTimer; // catches mouse movements
  window.onmousedown = resetTimer; // catches mouse movements
  window.onclick = resetTimer; // catches mouse clicks
  window.onscroll = resetTimer; // catches scrolling
  window.onkeypress = resetTimer; //catches keyboard actions

  function logout() {
    localStorage.clear();
    reload();
  }

  function reload() {
    window.location.reload(); //Reloads the current page
  }

  function resetTimer() {
    clearTimeout(t);
    t = setTimeout(logout, 24 * 60 /*minutes*/ * 60000); // time is in milliseconds (1000 is 1 second)
  }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.register();
