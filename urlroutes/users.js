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
        console.log(responselib.statusCode);
        if (( responselib.statusCode != 200 && responselib.statusCode != 401 ) || error) {
            response.send({
                "meta": utils.createErrorMeta(400, "X_001", "The CityLife API returned an error. Please try again later. " + error),
                "response": {}
            });
        } else {
            if (responselib.statusCode == 401) {
                response.send({
                    "meta": utils.createErrorMeta(401, "X_001", "Credentials are not valid."),
                    "response": {}
                });
            }
            else {
                response.send(body);
            }
        }
    });
}


/**
 * Temporary function to drop everything from database and start from scratch.
 */
exports.dropAll = function (request, response) {
    var mongojs = require('mongojs');
    var config = require('../auth/dbconfig');
    var server = require('../server');
    var db = mongojs(config.dbname);
    var collection = db.collection(config.collection);
    if (request.params.key == config.secret) {
        require('mongodb').connect(server.mongourl, function (err, conn) {
            collection.drop(function (err, docs) {
                if (err) {
                    response.send({
                        "meta": utils.createErrorMeta(400, "X_001", "Something went wrong with the MongoDB :( : " + err),
                        "response": {}
                    });
                } else {
                    response.send(JSON.stringify(docs));
                }
            });
        });
    } else {
        response.send({
            "meta": utils.createErrorMeta(403, "X_001", "Incorrect key" + err),
            "response": {}
        });
    }
}