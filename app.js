const express = require("express");
const http = require("http");
const indexRoute = require("./routes/index");
const users = require("./routes/user");
const User = require("./models/User.js");
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors");
// flash middlewares require
const flash = require("connect-flash");
const methodOverride = require("method-override");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(cors());
app.options("*", cors());

app.use(methodOverride("_method"));

const db = require("./config/keys").MongoURI;

require("./config/passport")(passport);

// session and flash middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// connect to DB
mongoose
  .connect(process.env.MONGODB_URI || db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB contected..."))
  .catch((err) => {
    return err.message;
  });

// initialize and set EJS
app.use(expressLayouts);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());
// Global varable
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.err_msg = req.flash("err_msg");
  res.locals.error = req.flash("error");
  next();
});

// routes
app.use("/", indexRoute);
app.use("/users", users);
app.use("*", (req, res) => {
  res.status(404).render("404", { layout: false });
});
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Server started on port " + port);
});
