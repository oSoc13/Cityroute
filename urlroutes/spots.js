/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

/**
 * Find relevant spots for a user based on his location
 * @param token user token
 * @param latitude latitude of the user
 * @param longitude longitude of the user
 * @return JSON response
 */
exports.findRelevantSpots = function (request, response) {
    // declare external files
    var utils = require('../utils');
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');
    var gm = require('../lib/googlemaps');

    // check for url parameters; lat, long and token should be defined.
    if (typeof request.query.latitude !== undefined && typeof request.query.longitude !== undefined && typeof request.query.token !== undefined) {

        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        // do call to citylife discover API
        requestlib({
            uri: citylife.discoverCall,
            method: "POST",
            form: {
                "bearer_token": request.query.token,
                "longitude": request.query.longitude,
                "latitude": request.query.latitude,
                "time": "" + now
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, responselib, body) {
            if (responselib.statusCode != 200 || error) {
                response.send({
                    "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                    "response": {}
                });
            } else {
                // parse the result to JSON
                var jsonResult = JSON.parse(body);

                // calculate a static map for each relevant spot
                var markers = [];
                for (var i = 0; i < jsonResult.response.data.items.length; ++i) {
                    markers[0] = { 'location': jsonResult.response.data.items[i].meta_info.latitude + " " + jsonResult.response.data.items[i].meta_info.longitude };
                    jsonResult.response.data.items[i].mapspng = gm.staticMap(
                        '',
                        15,
                        '250x250',
                        false,
                        false,
                        'roadmap',
                        markers,
                        null,
                        null);
                }
                // send the result
                response.send(jsonResult);
            }
        });
    } else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'latitude', 'longitude' or 'token' parameter has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
}

/**
 * The main function responsible for generating a route. It is a recursive function which ends when the maximum number of spots is reached, or no relevant spot is found within the radius.
 * @param lat latitude of the previous spot
 * @param long longitude of the previous spot
 * @param name channel name of the channel in which to search for relevant spots
 * @param radius radius (in km) in which to search for relevant spots
 * @param jsonResult contains the list of previous spots already added to the route
 * @param response allows us to return a response from within this function
 * @param token the bearer_token of the user
 */
function findSpotByChannel (lat, long, name, radius, jsonResult, response, token) {
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');
    var gm = require('../lib/googlemaps');

    // date time is also required for the City Life API, so get it in the right format
    var time = new Date();
    var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

    // do call to the CityLife API
    requestlib({
        uri: citylife.discoverChannelCall,
        method: "POST",
        form: {
            "longitude": long,
            "latitude": lat,
            "time": "" + now,
            "params": '{ "channel": "' + name + '" }',
            "bearer_token": token
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, function (error, responselib, body) {
        if (responselib.statusCode != 200 || error) {
            // bad request
            console.log(body);
            response.send({
                "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                "response": {}
            });
        } else {
            // parse the result of the request to JSON
            var body = JSON.parse(body);

            // iterate through the list of spots returned by the API call
            for (var i = 0; i < body.response.data.items.length; ++i) {
                // only continue if the resulted spot is within the radius
                if (parseInt(body.response.data.items[i].meta_info.distance) < radius) {
                    var found = false;
                    // check if the spot is already in the route
                    for (var j = 0; j < jsonResult.length; ++j) {
                        if (parseInt(jsonResult[j].item) == body.response.data.items[i].link.params.id) {
                            found = true;
                        }
                    }
                    // if the spot is not in the route yet
                    if (!found) {
                        // create json of spot id
                        var result = {
                            "item": '' + body.response.data.items[i].link.params.id
                        }
                        // add the spot to the route
                        jsonResult.push(result);
                        // if the route is at its max length, save it
                        if (jsonResult.length >= 10) {
                            saveGeneratedRoute(jsonResult, name, response);
                        } else {
                            // if route can be longer, execute this function again but with parameters from the last spot added
                            findSpotByChannel(body.response.data.items[i].meta_info.latitude, body.response.data.items[i].meta_info.longitude, name, radius, jsonResult, response);
                        }
                        return;
                    }
                }
            }
            // if no other relevant spot is found within the radius, save the route.
            // the route must exist of at least 2 spots
            if (jsonResult.length > 1) {
                saveGeneratedRoute(jsonResult, name, response);
            } else {
                response.send({
                    "meta": utils.createErrorMeta(400, "X_001", "There are no possible routes found for this starting point and channel."),
                    "response": {}
                });
            }
        }
    });
};


/**
 * Stores the generated route in the database
 * @param jsonResult array containing the list of spots in the route
 * @param name name of the channel which was used to create the route
 * @param response allows us to return a response from within this function
 */
saveGeneratedRoute = function (jsonResult, name, response) {
    // declare external files
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');
    var routesFile = require('./routes');

    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);
    
    // insert the generated route in the database
    require('mongodb').connect(server.mongourl, function (err, conn) {
        collection.insert({
            'name': 'Generated ' + name,
            'description': 'This is a generated route.',
            'points': jsonResult
        }, function (err, docs) {
            if (err) {
                response.send({
                    "meta": utils.createErrorMeta(500, "X_001", "Something went wrong with the MongoDB: " + err),
                    "response": {}
                });
            } else {
                // this function is used to return the generated route to the user, and contains a boolean as parameter so it knows a static png still has to be generated and added
                routesFile.searchById(docs[0]._id, response, false);
            }
        });
    });
    
    
}

/**
 * Returns a list of nearby Spots.
 * @param latitude the latitude of the location
 * @param longitude the longitude of the location
 * @return json representation of nearby Spots
 */
exports.findSpotsByLatLong = function (request, response) {
    // declare external files
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');
    var gm = require('../lib/googlemaps');

    // check for url parameters, lat and long should be defined.
    if (typeof request.query.latitude !== undefined && typeof request.query.longitude !== undefined) {
        
        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        // send request to CityLife API
        requestlib({
            uri: citylife.discoverChannelCall,
            method: "POST",
            form: {
                "longitude": request.query.longitude,
                "latitude": request.query.latitude,
                "time": "" + now,
                "params": '{ "channel": "nearbyspots" }'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, responselib, body) {
            if (responselib.statusCode != 200 || error) {
                // bad request
                response.send({
                    "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                    "response": {}
                });
            } else {
                // parse the result to a JSON
                var jsonResult = JSON.parse(body);

                // return the JSON but first add a static map png.
                var markers = [];
                for (var i = 0; i < jsonResult.response.data.items.length; ++i) {
                    markers[0] = { 'location': jsonResult.response.data.items[i].meta_info.latitude + " " + jsonResult.response.data.items[i].meta_info.longitude };
                    jsonResult.response.data.items[i].mapspng = gm.staticMap(
                        '',
                        15,
                        '250x250',
                        false,
                        false,
                        'roadmap',
                        markers,
                        null,
                        null);
                }
                response.send(jsonResult);
            }
        });
    }
    else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'longtiude' or 'latitude' field has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
};

/**
 * Checks the user in at a specific spot
 * @param bearer token the user's token
 * @param spot_id the id of the spot where the user checks in.
 * @return json basic response
 */
exports.checkIn = function (request, response) {
    // declare external files
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');

    // check for url parameters, lat and long should be defined.
    if (typeof request.query.token !== undefined && typeof request.query.spot_id !== undefined) {

        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        // send request to CityLife API
        requestlib({
            uri: citylife.channelCall,
            method: "POST",
            json: {
                "bearer_token": request.query.token,
                "params": '{ "id": "' + request.query.spot_id + '"}',
                "channel": "spots",
                "view": "CheckIn",
                "time": "" + now
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (error, responselib, body) {
            if (responselib.statusCode != 200 || error) {
                console.log(body);
                response.send({
                    "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                    "response": {}
                });
            } else {
                // since the CityLife API does not return the spot_id in its response, add it to our own response
                if (typeof body !== undefined && typeof body.response !== undefined)
                    body.response.data.spot_id = request.query.spot_id;
                response.send(body);
            }
            
        });
    }
    else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'token' or 'spot_id' field has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
};

/**
 * Search for spots
 * @param token the user's bearer_token
 * @param latitude latitude of the user
 * @param longitude longitude of the user
 * @param search_term searchterm
 * @return something
 */
exports.search = function (request, response) {
    // declare external file
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');

    // check for url parameters, lat and long should be defined.
    if (typeof request.query.token !== undefined && typeof request.query.latitude !== undefined && typeof request.query.longitude !== undefined && typeof request.query.search_term !== undefined) {

        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        // send request to CityLife API
        requestlib({
            uri: citylife.channelCall,
            method: "POST",
            json: {
                "bearer_token": request.query.token,
                "params": '{ "term": "' + request.query.search_term + '"}',
                "latitude": request.query.latitude,
                "longitude": request.query.longitude,
                "channel": "spots",
                "view": "SearchResults",
                "time": "" + now
            },
            headers: {
                'Content-Type': 'application/json'
            }
        }, function (error, responselib, body) {
            if (responselib.statusCode != 200 || error) {
                response.send({
                    "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                    "response": {}
                });
            } else {
                // just return the response of the CityLife API
                response.send(body);
            }
        });
    }
    else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'token', 'latitude', 'longitude' or 'search_term' field has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
};


/**
 * Returns the details of a Spot.
 * @param id the id of the Spot
 * @return json representation of the Spot
 */
exports.findById = function (request, response) {
    // declare external files
    var utils = require("../utils");
    var https = require('https');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');

    // send request to the CityLife API
    requestlib({
        uri: citylife.getSpotByIdCall + request.params.id,
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, function (error, responselib, body) {
        if (responselib.statusCode != 200 || error) {
            response.send({
                "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                "response": {}
            });
        } else {
            // parse to JSON but return as string.
            var jsonResult = JSON.parse(body);

            response.send(JSON.stringify(jsonResult));
        }
    });
};

// allow this function to be called from other files
exports.findSpotByChannel = findSpotByChannel;