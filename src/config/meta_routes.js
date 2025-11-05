import customerMETA from "../client/meta_routes";
import adminMETA from "admin/meta_routes";

const metaRoutes = {
  ...adminMETA,
  // CUSTOMER META ROUTES
  ...customerMETA,
};

export default metaRoutes;
