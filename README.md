Cityroute
=========

This is the CityLife Routing API.
It includes both the back-end and a front-end responsive website for demo purposes.

Requirements
============
A Node.js server with the following packages installed:
* Express.js
* MongoDB
* Mongojs
* Request
* Polyline
* Querystring

These can all be installed by just running the following command from the source folder.
<pre>
npm install</pre>

The GoogleMaps package is included in the lib folder due to some changes to its source code.

A MongoDB database.

Edit the following files:
* auth/citylife.example.js
* auth/dbconfig.example.js

Replace the X's and hardcoded strings correct strings.

Start your MongoDB database and then start the server with the following command:
<pre>
node server.js
</pre>


API Documentation
=================

GET /users/login/:base64
------------------------

*:base64* should be a Base64 encoding of *username:password*.

Returns information about that user, including a token needed for API calls which require authentication.

Example response:

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "anonymous": false,
        "balance": 0,
        "email": "test@mv.be",
        "first_name": "user",
        "friends_count": 0,
        "image": "",
        "last_name": "test",
        "pending_count": 0,
        "token": "40f4aa62c3526dde90fcf35769155f69adc5749f",
        "user_id": 10004853,
        "vikingspots_channel": "spots"
    }
}
</pre>



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

Routes
------
There are 3 calls possible to the Routes API
* GET /routes

Returns a list of Routes starting or ending a a specific spot including a static Google Maps PNG representation.
Requires *spot_id* as URL parameter.
* GET /routes/:id

Returns the details of a Route, including detailed information about every Spot on the route.
*:id* should be the Route id as included in the json results of a GET or POST to /routes.
* POST /routes

Adds a route to the database and generates a static Google Maps png representation.
Requires form data in a json format, for example:
<pre>
{
    'name':'Example Route',
    'description':'A simple description',
    'points':
    [
        {'item':'137'},
        {'item':'7'}
    ]
}</pre>
