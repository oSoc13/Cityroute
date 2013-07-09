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
                    parseRouteSpots(error, responselib, body, resultArray, spotArray, spotsIdArray, count, docs, response);
                    count++;
                });
            }
        });
};

/**
 * Callback for spotid call of citylife for route details
 * @param error standard callback variable of request library
 * @param responselib standard callback variable of request library
 * @param body standard callback variable of request library
 * @param resultArray array that will be filled with all spot data
 * @param spotArray array containing all spot data
 * @param spotsIdArray array containing all spot id's of the route in the right order
 * @param count variable which hold the amount of completed requests
 * @param docs result of the route query in mongoDB
 * @param response used to create a response to the client
 */
parseRouteSpots = function (error, responselib, body, resultArray, spotArray, spotsIdArray, count, docs, response) {
    var requestlib = require('request');
    var gm = require('googlemaps');

    // on result of a query, parse the result to a JSON
    var jsonResult = JSON.parse(body);

    // insert the results in the correct order as they are defined by a route.
    resultArray[spotsIdArray.indexOf(jsonResult.response.id)] = jsonResult;
    // if all external API calls are returned, respond with the ordered JSON array.
    // also included are the name and the id of the route.
    if (count == spotArray.length - 1) {
        // create necessary data for Google Maps Directions and Static Maps
        var markers = [];
        var points = [];

        // fill markers array with long and lat, and include a label based on route order.
        for (var j = 0; j < spotArray.length; ++j) {
            markers[j] = { 'label': j+1, 'location': resultArray[j].response.latitude + " " + resultArray[j].response.longitude };
        }
                              
        var numSpots = resultArray.length - 1;
        var waypoints = "";

        // define location of start and endpoint
        var originLat = resultArray[0].response.latitude;
        var originLong = resultArray[0].response.longitude;
        var destLat = resultArray[numSpots].response.latitude;
        var destLong = resultArray[numSpots].response.longitude;

        var latLong = originLat + ", " + originLong;
        var destLatLong = destLat + ", " + destLong;

        // fill waypoint array with spots between start and endpoint
        for (var i = 1; i < numSpots; ++i) {
            waypoints += resultArray[i].response.latitude + ", " + resultArray[i].response.longitude + "|";
        }

        // Do a query to the Google Maps Directions API
        requestlib({
            uri: gm.directions(
                latLong,
                destLatLong,
                null,
                false,
                'walking',
                waypoints,
                null,
                null,
                'metric',
                null),
            method: "GET"
        }, function (error, responselib, body) {
            parseDirectionResults(error, responselib, body, resultArray, markers, docs, response);
        });
    }
}

/**
 * Callback for query of Google Maps Direction API
 * @param error standard callback variable of request library
 * @param responselib standard callback variable of request library
 * @param body standard callback variable of request library
 * @param resultArray array that will be filled with all spot data
 * @param markers contains all markers for the creation of a static map
 * @param docs result of the route query in mongoDB
 * @param response used to create a response to the client
 */
parseDirectionResults = function (error, responselib, body, resultArray, markers, docs, response) {
    var polyline = require('polyline');
    var gm = require('googlemaps');

    var jsonResult = JSON.parse(body);

    // decode the polyline representation of the route to a readable array of lat and longs.
    var points = polyline.decodeLine(jsonResult.routes[0].overview_polyline.points);
    var paths = [];
    paths[0] = { 'points': points };

    // send the response to the user, it contains a link to a static png with a map view on Google Maps
    response.send(
        {
            "name": docs.name,
            "id": docs._id,
            "spots": resultArray,
            "png": gm.staticMap(
                '',
                '',
                '250x250',
                false,
                false,
                'roadmap',
                markers,
                null,
                paths)
        }
    )
}



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
    }, function (err, docs) {
        response.send(JSON.stringify(docs));
    });
};