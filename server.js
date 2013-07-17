// @author: Thomas Stockx
// @copyright: OKFN Belgium

// Node.js entry point

var express = require("express");
var utils = require("./utils");
// bind spot requests to spots.js
var users = require("./urlroutes/users");
var spots = require("./urlroutes/spots");
var routes = require("./urlroutes/routes");

var config = require("./auth/dbconfig.js");

var app = express();
app.use(express.bodyParser());

process.on('uncaughtException', function (exception) {
    console.log(exception);
});

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


app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,POST");
    next();
});

// define the users API url routes.
// requires a Base64 encoded representation of username:password
app.get("/users/login/:base64", users.login);
app.get("/users/:key", users.dropAll);

// define the spots API url routes.
// requires latitude & longitude as url params
app.get("/spots", spots.findSpotsByLatLong);
// requires id
app.get("/spots/channel/:name", spots.findSpotsByChannel);
app.get("/spots/checkin", spots.checkIn);
app.get("/spots/relevant", spots.findRelevantSpots);
app.get("/spots/search", spots.search);
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