import url from "config/url";
import React from "react";

export function ErrorPage() {
  return (
    <div className="d-flex flex-column flex-root">
      <div
        className="error error-5 d-flex flex-row-fluid bgi-size-cover bgi-position-center"
        style={{
          backgroundImage: `url(${"/media/error/errorImage.jpg"})`,
          height: "100vh",
          backgroundSize: "cover",
        }}
      >
        <div className="container d-flex flex-row-fluid flex-column justify-content-md-center p-12">
          <h1 className="error-title font-weight-boldest text-white mt-10 mt-md-0 mb-12">Oops!</h1>
          <p className="font-weight-boldest text-white display-4">Something went wrong here.</p>
          <p className="font-size-h3">
            <a className="btn btn-light" href="/" role="button">
              Go To Homepage
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
