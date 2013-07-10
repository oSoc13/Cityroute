Cityroute
=========

This is the CityLife Routing API.
It includes both the back-end as a front-end responsive website for demo purposes.

Requirements
------------
A Node.js server with the following packages installed:
* Express.js
* MongoDB
* Mongojs
* Request
* Polyline
* Querystring

    npm install express
    npm install mongodb
    npm install mongojs
    npm install request
    npm install polyline
    npm install querystring

The GoogleMaps package is included in the lib folder due to some changes to its source code.

A MongoDB database.

API Documentation
=================
Users
-----
First and foremost, authentication is required.
* GET /users/login/:base64

Returns information about that user, including a token needed for API calls which require authentication.
*:base64* should be a Base64 encoding of *username:password*.

Spots
-----
There are 5 calls possible to the Spots API:
* GET /spots

Returns a list of nearby Spots.
Requires *latitude* and *longitude* as URL parameters.
* GET /spots/:id

Returns detailed information about a Spot.
*:id* should be the Spot id as included in the json results of other API calls.
* GET /spots/checkin

Checks a user in at a specific Spot
Requires *token* and *spot_id* as URL parameters.
* GET /spots/relevant

Returns a list of spots relevant to a user and his location.
Requires *token*, *latitude* and *longitude* as URL parameters.
* GET /spots/search

Returns a list of spots relevant to a user and his location when provided with a search term.
Requires *token*, *latitude*, *longitude* and *search_term* as URL parameters. 