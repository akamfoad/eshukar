const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const { connect } = require("./config/db");

// load env variables
dotenv.config({
  path: "./config/.env",
});

// importing routers
const servicesRouter = require("./routes/services");
const categoriesRouter = require("./routes/categories");
const workersRouter = require("./routes/workers");
const teamsRouter = require("./routes/teams");
const customersRouter = require("./routes/customers");
const requestsRouter = require("./routes/requests");
const authRouter = require("./routes/auth");

// middlewares
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error");
const cors = require("cors");

// connect to db
connect();

const app = express();

// mounting middlewares
if (process.env.NODE_ENV === "development") {
  app.use(require("morgan")("dev"));
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// mounting routes
app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/workers", workersRouter);
app.use("/api/v1/teams", teamsRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/requests", requestsRouter);
app.use("/api/v1/auth", authRouter);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.clear();
  console.log(`listening on localhost:${PORT}`);
});

// handle unhandledRejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
});
