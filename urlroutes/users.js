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
                response.send(JSON.stringify(docs));
            });
        });
    } else {
        response.send("You are not SQLrillex.");
    }
}