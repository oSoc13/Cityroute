// @author: Thomas Stockx
// @copyright: OKFN Belgium

// Node.js entry point

var express = require("express");
var utils = require("./utils");
// bind spot requests to spots.js
var users = require("./urlroutes/users");
var spots = require("./urlroutes/spots");
var routes = require("./urlroutes/routes");

var app = express();
app.use(express.bodyParser());

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

// define the users API url routes.
// requires a Base64 encoded representation of username:password
app.get("/users/login/:base64", users.login);

// define the spots API url routes.
// requires latitude & longitude as url params
app.get("/spots", spots.findSpotsByLatLong);
// requires id
app.get("/spots/checkin", spots.checkIn);
app.get("/spots/:id", spots.findById);

// define the routes API url routes.
// requires spot_id as url param
app.get("/routes", routes.findRoutesStartingAtSpot);
// requires name, description and list of spot_id's
app.post("/routes", routes.addRoute);
// requires ID
app.get("/routes/:id", routes.findById);


console.log("Listening on port 1337...");
// start server
app.listen(1337);