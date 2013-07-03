// @author: Thomas Stockx
// @copyright: OKFN Belgium

// Node.js entry point

var express = require("express");
var spots = require("./urlroutes/spots");

var app = express();

// define the spots API url routes.
app.get("/spots", spots.findAll);
app.get("/spots/:id", spots.findById);


console.log("Listening on port 1337...");
// start server
app.listen(1337);