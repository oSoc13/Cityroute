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

    // check for url parameters, spot_id should be defined
    if (request.query.spot_id != undefined) {

    }
    else {
        // bad request
        response.statusCode = 400;
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

    response.send({
        "meta": utils.createOKMeta(),
        "response":
            {
                id: request.params.id, name: "route1", description: "description"
            }
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
    var errorThingy = "";

    collection.insert({"name":"Testroute", "points":[ 
                                                   {"item": 33629},
                                                   {"item": 7},
                                                   {"item": 430},
                                                   { "item": 134 }]
    }), function(err, docs) {errorThingy = err; };

    response.statusCode = 200;
    response.send(errorThingy + " Route added");

};