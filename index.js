const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const https = require("https");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const process = require("process");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const app = express();

const logger = require("./src/config/logger");
const ErrorHandler = require("./src/util/errors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { corsOptions, swaggerOptions } = require("./src/config/options");

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' https://dms.epf.org.np:443");
  next();
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
app.use("/setup", require("./src/config/setup"));
app.use(require("./src/config/middleware"));
app.use(passport.initialize());
app.use(passport.session());
require("./src/config/scheduler");
require("./src/user-management/auth/passport-ad");
require("./src/user-management/auth/passport-admin");
require("./src/user-management/auth/passport-customer");
app.use("/api", express.static("temp"));
app.use("/api", require("./src/user-management"));
/******************************************************************************************************************** */
app.use("/api", require("./src/document-management"));
app.use("/api", require("./src/memo-mangement"));
app.use("/api", require("./src/workflow"));
app.use("/api", require("./src/misc"));
/******************************************************************************************************************** */
app.use("/api", require("./src/security-hierarchy"));
app.use("/api", require("./src/logs"));
/******************************************************************************************************************** */
app.use("/api", require("./src/client"));
/******************************************************************************************************************** */
const PORT = process.env.PORT || 8181;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.use("/api", express.static("manual"));
app.use("/docs", express.static("doc"));

app.use(ErrorHandler);
// app.use((err, req, res, next) => {
//   if (err.name === "UnauthorizedError") {
//     res.status(err.status).send();
//   } else {
//     res.status(err.status || 500).send();
//   }
// });
/******************************************************************************************************************** */
app.use("/", express.static("public"));
app.use("/api/redaction/:id", express.static("redaction"));

/******************************************************************************************************************** */

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

/******************************************************************************************************************** */
const sslEnabled = process.env.SSL_ENABLED === "true";
if (sslEnabled) {
  app.get("/", (req, res) => res.redirect("https://" + req.headers.host + req.url));
  https
    .createServer(
      {
        key: fs.readFileSync("./ssl/key.pem"),
        cert: fs.readFileSync("./ssl/cert.pem"),
        rejectUnauthorized: true, // Default, but explicit is good
        passphrase: process.env.SSL_PASS_PHRASE,
      },
      app
    )
    .listen(PORT, () => {
      const data = new Date();
      console.log("|--------------------------------------------");
      console.log("| Server       : " + "DMS");
      console.log("| Port         : " + PORT);
      console.log("| Date         : " + data.toJSON().split("T").join(" "));
      console.log("|--------------------------------------------");
      console.log("| Waiting For Database Connection ");
      console.log("Listening on PORT " + PORT + " with SSL Enabled ( ✅  ✅  ✅  ✅  )");
    });
} else {
  app.listen(PORT, () => {
    const data = new Date();
    console.log("|--------------------------------------------");
    console.log("| Server       : " + "DMS");
    console.log("| Port         : " + PORT);
    console.log("| Date         : " + data.toJSON().split("T").join(" "));
    console.log("|--------------------------------------------");
    console.log("| Waiting For Database Connection ");
    console.log("Listening on PORT " + PORT + " with SSL Disabled( ❌ ❌ ❌ ❌  )");
  });
}
process.on("uncaughtException", (err) => {
  logger.error(err);
});
