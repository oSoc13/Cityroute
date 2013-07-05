/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

/**
 * Returns a list of Routes starting at a Spot
 * @param spot_id id of the starting Spot
 * @return json representation of the Routes
 */
exports.findRoutesStartingAtSpot = function (request, response) {
    var utils = require("../utils");
    var querystring = require('querystring');
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');

    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);

    // check for url parameters, spot_id should be defined
    if (typeof request.query.spot_id !== undefined) {        
        // find all routes which have item x as starting point.
        collection.find({ 'points.0': { item: parseInt(request.query.spot_id) } })
            .toArray(function (err, docs) {
                // return the list of routes
                response.send(docs);
            });

    }
    else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'spot_id' has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
}

/**
 * Retuns the details of a Route.
 * @param id the id of a Route
 * @return json representation of the Route
 */
exports.findById = function (request, response) {
    var utils = require("../utils");
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var querystring = require('querystring');

    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);
    var ObjectId = mongojs.ObjectId;

    // find the route by its id.
    collection.find({ '_id': ObjectId(request.params.id) })
            .toArray(function (err, docs) {
                // return that route.
                response.send(docs);
            });
};


/**
 * Add a route to the mongoDB database
 * @param a list of ids of spots
 * @param a name for the route
 @return the route id
 */
exports.addRoute = function (request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);

    console.log(config.dbname + "," + config.collection);

    collection.insert({"name":"Testroute", "points":[ 
                                                   {"item": 33629},
                                                   {"item": 7},
                                                   {"item": 430},
                                                   { "item": 134 }]
    }), function (err, docs) {
        response.send(" Route added");
    };
};