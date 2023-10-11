const companyRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");
const industriesRoutes = require("./routes/industries");

const express = require("express");
const app = express();
const ExpressError = require("./expressError");

// Middleware should be set up first
app.use(express.json());

// Then, your routes
app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/industries", industriesRoutes);


/** 404 handler */
app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message;
  return res.status(status).json({ error: { message, status } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
}

module.exports = app;

