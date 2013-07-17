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
                var jsonResult = JSON.parse(body);

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
    } else {
        // bad request
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'latitude', 'longitude' or 'token' parameter has no data and doesn't allow a default or null value."),
            "response": {}
        });
    }
}

/**
 * Find the most relevant spot in a radius for a certain channel and location
 */
function findSpotByChannel (lat, long, name, radius, spot_id, jsonResult, response) {
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');
    var gm = require('../lib/googlemaps');

    // date time is also required for the City Life API, so get it in the right format
    var time = new Date();
    var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

    requestlib({
        uri: citylife.discoverChannelCall,
        method: "POST",
        form: {
            "longitude": long,
            "latitude": lat,
            "time": "" + now,
            "params": '{ "channel": "' + name + '" }'
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
            var body = JSON.parse(body);

            for (var i = 0; i < body.response.data.items.length; ++i) {
                if (parseInt(body.response.data.items[i].meta_info.distance) < radius) {
                    var found = false;
                    for (var j = 0; j < jsonResult.length; ++j) {
                        if (parseInt(jsonResult[j].item) == body.response.data.items[i].link.params.id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        var result = {
                            "item": '' + body.response.data.items[i].link.params.id
                        }
                        jsonResult.push(result);
                        if (jsonResult.length >= 10) {
                            saveGeneratedRoute(jsonResult, name, response);
                        } else {
                            findSpotByChannel(body.response.data.items[i].meta_info.latitude, body.response.data.items[i].meta_info.longitude, name, radius, result.item, jsonResult, response);
                        }
                        return;
                    }
                }
            }
            saveGeneratedRoute(jsonResult, name, response);
        }
    });
};

saveGeneratedRoute = function (jsonResult, name, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var utils = require('../utils');
    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);
    var routesFile = require('./routes');
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
                var jsonResult = JSON.parse(body);

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
                var jsonResult = body;

                response.send(jsonResult);
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
    var utils = require("../utils");
    var https = require('https');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');

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
            var jsonResult = JSON.parse(body);

            response.send(JSON.stringify(jsonResult));
        }
    });
};

exports.findSpotByChannel = findSpotByChannel;