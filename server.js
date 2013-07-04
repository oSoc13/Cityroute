/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

// Node.js entry point

var express = require("express");
var utils = require("./utils");
// bind spot requests to spots.js
var spots = require("./urlroutes/spots");
// bind route requests to routes.js
var routes = require("./urlroutes/routes");

var app = express();

// define the spots API url routes.
// requires latitude & longitude as url params
app.get("/spots", spots.findSpotsByLatLong);
// requires id
app.get("/spots/:id", spots.findById);

// define the routes API url routes.
// requires spot id as url param
app.get("/routes", routes.findRoutesStartingAtSpot);
// requires id
app.get("/routes/:id", routes.findById);


console.log("Listening on port 1337...");
// start server
app.listen(1337);