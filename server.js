// @author: Thomas Stockx
// @copyright: OKFN Belgium

// Node.js entry point

var express = require("express");
var utils = require("./utils");
// bind spot requests to spots.js
var spots = require("./urlroutes/spots");
var routes = require("./urlroutes/routes");

var app = express();
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// define the spots API url routes.
// requires latitude & longitude as url params
app.get("/spots", spots.findSpotsByLatLong);
// requires id
app.get("/spots/:id", spots.findById);

// define the routes API url routes.
// requires spot_id as url param
app.get("/routes", routes.findRoutesStartingAtSpot);
// requires ID
app.get("/routes/:id", routes.findById);

console.log("Listening on port 1337...");
// start server
app.listen(1337);