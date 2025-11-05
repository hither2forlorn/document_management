import React from "react";
import metaRoutes from "./meta_routes";

const Dashboard = React.lazy(() => import("./views/Dashboard"));
const MemoList = React.lazy(() => import("./views/Memo/MemoList"));
const MemoView = React.lazy(() => import("./views/Memo/MemoView"));
const MemoNew = React.lazy(() => import("./views/Memo/MemoNew"));

const routes = [
  // { path: metaRoutes.clientHome, exact: true, name: "Home" },
  {
    path: metaRoutes.clientDashboard,
    exact: true,
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: metaRoutes.clientMemoList,
    exact: true,
    name: "Memo List",
    component: MemoList,
  },
  { path: metaRoutes.clientMemoNew, name: "New Memo", component: MemoNew },
  { path: metaRoutes.clientMemoView, name: "View Memo", component: MemoView },
];

export default routes;
