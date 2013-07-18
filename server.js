/*
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 *
 * Node.js entry point
 */

// declare external files
var express = require("express");
var utils = require("./utils");
var users = require("./urlroutes/users");
var spots = require("./urlroutes/spots");
var routes = require("./urlroutes/routes");
var config = require("./auth/dbconfig.js");

// use express and its bodyParser for POST requests.
var app = express();
app.use(express.bodyParser());

// prevent server death in case of uncaught exceptions
process.on('uncaughtException', function (exception) {
    console.log(exception);
});

/**
 * Our hosting service provides database information in the VCAP_SERVICES environment variable.
 * If it does not exist, we'll connect to a localhost MongoDB.
 */
if (process.env.VCAP_SERVICES) {
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else {
    var mongo = {
        "hostname": "localhost",
        "port": 27017,
        "username": "",
        "password": "",
        "name": "",
        "db": config.dbname
    }
}

/**
 * Building the URL to the MongoDB.
 */
var generate_mongo_url = function (obj) {
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if (obj.username && obj.password) {
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else {
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
}


var mongourl = generate_mongo_url(mongo);
exports.mongourl = mongourl;

/**
 * Fix cross-domain requests errors, this should probably be cleaned up before a real release.
 */
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    next();
});


// define the users API url routes.
app.get("/users/login/:base64", users.login);
app.get("/users/logout/:token", users.logout);
app.get("/users/:key", users.dropAll);

// define the spots API url routes.
app.get("/spots", spots.findSpotsByLatLong);
app.get("/spots/checkin", spots.checkIn);
app.get("/spots/relevant", spots.findRelevantSpots);
app.get("/spots/search", spots.search);
app.get("/spots/:id", spots.findById);

// define the routes API url routes.
app.get("/routes", routes.findRoutesStartingAtSpot);
app.post("/routes", routes.addRoute);
app.get("/routes/generate/:channelname", routes.generateRoute);
app.get("/routes/:id", routes.findById);


// start server on port 1337
console.log("Listening on port 1337...");
app.listen(1337);