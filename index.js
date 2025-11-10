const express = require("express");
require("express-async-errors");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
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

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer",
      },
      servers: ["http://localhost:8181"],
    },
  },
  // ['.routes/*.js']
  apis: ["./src/document-management/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const corsOptions = {
  origin: [
    "http://10.1.3.49:3001",
    "https://localhost:3000",
    "http://localhost:3000",
    "http://dms.ebl.com.np",
    "http://localhost:3001",
    "http://localhost:8181",
    "https://localhost:8181",
    "https://dms.ebl.com.np",
    "https://eblapims.ebl-zone.com",
    "https://10.1.3.49:443",
    "https://10.1.3.49:80",
    "https://cap-unit.ebl.com.np",
    "https://offline.ebl.com.np",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(
  compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(helmet());
app.use(
  helmet.frameguard({
    action: "allow-from",
    domain: "*",
  })
);

app.use(
  session({
    secret: "=z|D3(k9S-|5}g,7 L.KfF  ?Q|Eo5lefWQ4JG&)Qp8(>0C<|#ahtcOz]-x=$:;p",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 2 * 60 * 1000,
      secure: false, // if true only transmit cookie over https
      httpOnly: true, // if true prevent client side JS from reading the cookie
    },
  })
);

app.use(morgan("tiny"));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "500mb" }));
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
//   if (err.name === "UnauthorizedError") {CXVN
//     res.status(err.status).send();
//   } else {
//     res.status(err.status || 500).send();
//   }
// });
/******************************************************************************************************************** */
app.use("/", express.static("public"));
/******************************************************************************************************************** */

const sslEnabled = process.env.SSL_ENABLED === "true";
if (sslEnabled) {
  app.get("/", (req, res) => res.redirect("https://" + req.headers.host + req.url));
  https
    .createServer(
      {
        key: fs.readFileSync("./ssl/key.pem"),
        cert: fs.readFileSync("./ssl/cert.pem"),
        // passphrase: process.env.SSL_PASS_PHRASE,
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
  console.log("UNCAUGHT EXCEPTION ERROR AT INDEX.JS", err);

  logger.error(err);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION EXCEPTION ERRROR AT INDEX.JS", err);
  logger.error(err);
});
