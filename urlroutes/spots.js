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
    var requestlib = require('request');

    // check for url parameters, lat and long should be defined.
    if (request.query.latitude != undefined && request.query.longitude != undefined) {
        
        // date time is also required for the City Life API, so get it in the right format
        var time = new Date();
        var now = "" + time.getFullYear() + "-" + utils.addZero(time.getMonth()) + "-" + utils.addZero(time.getDay()) + " " + utils.addZero(time.getHours()) + ":" + utils.addZero(time.getMinutes()) + ":" + utils.addZero(time.getSeconds());

        requestlib({
            uri: "https://alpha.vikingspots.com/en/api/4/channels/discoverchannel/",
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
            var jsonResult = JSON.parse(body);

            console.log(jsonResult);

            response.send(body);
        });

       

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
    var https = require('https');

    // set City Life API GET options
    var get_options = {
        host: "alpha.vikingspots.com",
        path: "/en/api/4/spots/getbyid/?spot_id=" + request.params.id,
        method: "GET",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    var get_req = https.request(get_options, function (res) {
        res.setEncoding("utf8");
        res.on('data', function (chunk) {
            response.send(chunk);
        });
    });

    get_req.end();
};