// @author: Thomas Stockx
// @copyright: OKFN Belgium


/**
 * Returns a list of nearby Spots.
 * @param latitude the latitude of the location
 * @param longitude the longitude of the location
 * @return json representation of nearby Spots
 */
exports.findSpotsByLatLong = function (request, response) {
    var utils = require("../utils");

    // check for url parameters, lat and long should be defined for a location query.
    if (request.query.latitude != undefined && request.query.longitude != undefined) {
        
        response.send({
            "meta": utils.createOKMeta(),
            "response": { latitude: request.query.latitude, longitude: request.query.longitude }
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

    response.send({
        "meta": utils.createOKMeta(),
        "response":
        { id: request.params.id, name: "spot1", description: "description" }
    });
};