//require modules
const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 8999;
const db = require("./config/mongoose");
const app = express();
db();
const cors = require("cors");

//Use for session
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const flashmiddleware = require("./config/flashmiddleware");

app.use(express.urlencoded({ extended: true }));
app.use(cors());

//use ejs template
app.set("view engine", "ejs");
app.set("views", "./views");

//mongo store is used to store the session cookie in db
app.use(
  session({
    name: "PlacementCellTracker",
    secret: process.env.SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create(
      {
        mongoUrl: process.env.MONGODB_URI,
        autoRemove: "disabled",
        mongooseConnection: db,
        collectionName: "sessions",
      },
      function (error) {
        console.log(error || "connect mongodb setup is ok");
      }
    ),
  })
);

// for authentication
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

//require for flash message
app.use(flash());
app.use(flashmiddleware.setFlash);

//use express router
app.use("/", require("./routes"));

//listening a port
app.listen(port, function (error) {
  if (error) {
    console.log(`Error in connecting with server: ${error}`);
  }
  console.log(`Successfully connecting with server ${port}`);
});
