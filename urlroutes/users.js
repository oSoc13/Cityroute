/**
 * @author: Thomas Stockx
 * @copyright: OKFN Belgium
 */

/**
 * Returns a StartupInfo object that contains information about the user's identity
 * @param Base64 encoded string of username:password
 * @return info of the user, including bearer_token needed for other queries.
 */
exports.login = function (request, response) {
    var utils = require("../utils");
    var https = require('https');
    var querystring = require('querystring');
    var requestlib = require('request');
    var citylife = require('../auth/citylife');

    requestlib({
        uri: citylife.authenticationCall,
        method: "POST",
        json: {},
        headers: {
            'Authorization': "Basic " + request.params.base64,
            'Content-Type': 'application/json'
        }
    }, function (error, responselib, body) {
        response.send(body);
    });
}