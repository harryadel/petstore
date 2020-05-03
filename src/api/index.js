require('dotenv').config()
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");

const config = require("../lib/config");
const logger = require("../lib/logger");
const swaggerDocument = require("./swagger.json");

const log = logger(config.logger);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
 * Routes
 */
app.use("/v2/pet", require("./routes/pet"));
app.use("/v2/store", require("./routes/store"));
app.use("/v2/user", require("./routes/user"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404
app.use((req, res, next) => {
  log.error(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: "Not found" });
});

// catch errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.error || err.message;
  log.error(
    `Error ${status} (${msg}) on ${req.method} ${req.url} with payload ${req.body}.`
  );
  res.status(status).send({ status, error: msg });
});

module.exports = app;
