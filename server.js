// File: server.js 
// Author: S. Sigman  Date: 12/30/2020
//
// server.js contains the code for the DTT Server component
// of the Ducs Time Tracker application.  Responsibilities of
// the server are:
//
//   1. Server the static web pages in the web component of 
//      the system.
//   2. Provide the DTT API for both the web and the mobile
//      components of the system.
//
// Modification Log:
// 1/17/2021 - Added express route to implement the authentication
//             API call. S. Sigman
// 1/25/2021 - Added express route to save a worksession

// import the express server
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');

// application constants
const PORT = 3200;

// create the http app
const app = express();

// set up a route to serve static pages from the public folder
app.use(express.static("public"));

// add a router
const router = express.Router();

// create API routes
router.use("/api/auth", require("./api/auth"));
router.use("/api/wsession", require("./api/wsession"));
router.use("/api/project", require("./api/project"));
router.use("/api/studentTotals",require("./api/studentTotals"));
router.use("/api/user", require("./api/user"));
router.use("/api/logout",require("./api/logout"))
 
// use the router in the app
app.use(router);

app.listen(PORT, (err) => {
    if (err) 
        console.log("Server startup failed.");
    else
        console.log(`Server listening on port ${PORT}`);
});