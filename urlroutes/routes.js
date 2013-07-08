/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

/**
 * Returns a list of Routes starting or ending at a Spot
 * @param spot_id id of the Spot
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
        var spot_id_safe = parseInt(request.query.spot_id);
        // find all routes which have item x as starting point.
        collection.find({ 'points.0': { item: parseInt(request.query.spot_id) } })
            .toArray(function (err, docs) {
                // the list of routes starting at Spot is stored in the docs array
                collection.find({ $where: 'this.points[this.points.length-1].item == ' + spot_id_safe })
                    .toArray(function (err, docs2) {
                        // the list of routes ending at Spot is stored in the docs2 array
                        // concat these arrays, and return the JSON.
                        response.send(docs.concat(docs2));
                    });
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
 * Returns the details of of a route, including details of each Spot on the Route.
 * @param id the id of a Route
 * @return json representation of the Route
 */
exports.findById = function (request, response) {
    var utils = require("../utils");
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var citylife = require('../auth/citylife');
    var querystring = require('querystring');
    var https = require('https');
    var requestlib = require('request');

    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);
    var ObjectId = mongojs.ObjectId;

    // find the route by its id.
    collection.find({ '_id': ObjectId(request.params.id) })
        .forEach(function (err, docs) {
            if (!docs) {
                // we visited all docs in the collection
                return;
            }

            // this contains the JSON array with spots
            var spotArray = docs.points;
            // initialize parse variables
            var count = 0;
            var resultArray = [];
            var spotsIdArray = [];

            // create a basic array (with no JSON content) containing the spot urls in the right order
            for (var i = 0; i < spotArray.length; ++i) {
                spotsIdArray[i] = spotArray[i].item
            }

            // for each spot, do a query to the CityLife API for more info about that spot
            for (var i = 0; i < spotArray.length; ++i) {
                requestlib({
                    uri: citylife.getSpotByIdCall + spotArray[i].item,
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }, function (error, responselib, body) {
                    // on result of a query, parse the result to a JSON
                    var jsonResult = JSON.parse(body);

                    // insert the results in the correct order as they are defined by a route.
                    resultArray[spotsIdArray.indexOf(jsonResult.response.id)] = jsonResult;
                    // if all external API calls are returned, respond with the ordered JSON array.
                    // also included are the name and the id of the route.
                    if (count == spotArray.length-1)
                        response.send(
                            {
                                "name": docs.name,
                                "id": docs._id,
                                "spots": resultArray
                            });
                    count++;
                    
                });
            }
        });
};


/**
 * Add a route to the mongoDB database
 * @param a list of ids of spots
 * @param a name for the route
 * @param a description for the route
 @return the route id
 */
exports.addRoute = function (request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);    

    collection.insert({
        "name": request.body.name,
        "description": request.body.description,
        "points": request.body.points
    }), function (err, docs) {
        response.send(" Route added");
    };
};