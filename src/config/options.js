const { consoleLog } = require("../util");

var whitelist = [
  "https://localhost:3000",
  "http://localhost:3000",
  "http://172.16.1.23:80",
  "https://172.16.1.23:443",
  "http://127.0.0.1:3000",
  "http://dms.epf.org.np",
  "https://dms.epf.org.np",
  "http://localhost:8181",
  "https://localhost:8181",
  "http://localhost:3001",
  "http://192.168.1.94:3000",
  "http://192.168.101.89:3000",
  "http://192.168.101.145:3001",
  "http://192.168.101.145:8181",
  "http://192.168.101.145:8181",
  "http://192.168.101.145:3001",
];

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "DMS API",
      description: "DMS API Information",
      contact: {
        name: "Developer",
      },
      servers: ["http://localhost:8181"],
    },
  },
  // ['.routes/*.js']
  apis: ["./src/document-management/routes/*.js"],
};

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin || process.env.NODE_ENV === "development") callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

module.exports = { swaggerOptions, corsOptions, whitelist };
