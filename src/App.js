import React from "react";
import { HashRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "./redux";
import AppRoutes from "./AppRoutes";
import "./scrollbar.css";

import "./App.scss";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { createTheme, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "react-query";
import PopupComponent from "Pages/PopupComponent/PopupComponent";

const loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

class App extends React.Component {
  render() {
    const queryClient = new QueryClient();
    const theme = createTheme({
      components: {
        // Name of the component
        MuiButtonBase: {
          defaultProps: {
            // The props to change the default for.
            disableRipple: true, // No more ripple!
          },
        },
      },
    });
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <ToastContainer />
            <HashRouter>
              <React.Suspense fallback={loading()}>
                <DndProvider backend={HTML5Backend}>
                  <PopupComponent />
                  <AppRoutes />
                </DndProvider>
              </React.Suspense>
            </HashRouter>
          </Provider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
}

export default App;
