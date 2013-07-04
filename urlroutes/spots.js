/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

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

    // check for url parameters, lat and long should be defined for a location query.
    if (request.query.latitude != undefined && request.query.longitude != undefined) {
        
        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        // add the post parameters required for City Life API
        var post_data = querystring.stringify({
            "longitude" : request.query.longitude,
            "latitude" : request.query.latitude,
            "time" : "" + now
        });

        // set City Life API POST options
        var post_options = {
            host: "alpha.vikingspots.com",
            path: "/en/api/4/channels/discover/",
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
        }
        };

        // create POST request, return result of POST request as result of this API call.
        var post_req = https.request(post_options, function (res) {
            res.setEncoding("utf8");
            res.on('data', function (chunk) {
                response.send(chunk);
            });
        });

        // do POST request to City Life API
        post_req.write(post_data);
        post_req.end();

        /*response.send({
            "meta": utils.createOKMeta(),
            "response": { time: now, latitude: request.query.latitude, longitude: request.query.longitude }
        });*/

    }
    else {
        // bad request
        response.statusCode = 400;
        response.send({
            "meta": utils.createErrorMeta(400, "X_001", "The 'longtiude' or 'latitude' field has no data and doesn't allow a default or null value."),
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

    response.send({
        "meta": utils.createOKMeta(),
        "response":
        { id: request.params.id, name: "spot1", description: "description" }
    });
};