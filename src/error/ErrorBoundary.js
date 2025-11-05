import React from "react";
import { ErrorPage } from "./page/ErrorPage";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Customized error handling goes here!
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <ErrorPage />
          {/* <h1>Error Boundary!!!</h1> */}
        </div>
      );
    }

    return this.props.children;
  }
}
