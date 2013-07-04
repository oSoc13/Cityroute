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