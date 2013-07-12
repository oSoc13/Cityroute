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


Users API Documentation
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

Spots API Documentation
=======================

GET /spots
----------
Requires *latitude* and *longitude* as URL parameters.

Returns a list of nearby Spots.

Example response: 

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "data": {
            "items": 
            [
                {
                    "description": "Nearby spots",
                    "icon": {
                        "image": "http://xxxx.png",
                        "name": "nearby"
                    },
                    "link": {
                        "channel": "spots",
                        "login_required": false,
                        "params": {
                            "id": xxxxx
                        },
                        "type": "spotdetail",
                        "view": "SpotDetail"
                    },
                    "meta_info": {
                        "distance": 0.023540002559,
                        "distance_str": "24m",
                        "latitude": xxxxxx,
                        "longitude": xxxxx,
                        "score": 0.748237
                    },
                    "title": "Spot Name",
                    "mapspng": "http://xxxx.png"
                }
            ]
        },
        "html": "",
        "title": "Nearby spots",
        "type": "list"
    }
}
</pre>

GET /spots/:id
--------------
*:id* should be the Spot id as included in the json results of other API calls.

Returns detailed information about a Spot.

Example response:

<pre>
{
    "meta":{
        "code":200,
        "message":{}
    },
    "response":{
        "always_closed":true,
        "always_open":false,
        "categories":
        [
            {
                "id":xxxx,
                "sub_categories":[xx]
            }
        ],
        "city":"xxxxx",
        "country":"BE",
        "creator_id":xxxx,
        "description":"Sample description",
        "email":"xx@xx.xx",
        "id":xxxx,
        "images":{
            "cover":{
                "id":xxx,
                "link":"http://xxxx.jpg"
            },
            "images":[]
        },
        "latitude":xxxx,
        "longitude":xxxx,
        "name":"Spot name",
        "no_opening_hours":false,
        "opening_hours":[],
        "opening_hours_extra":"Closed in July",
        "owner_id":xxxx,
        "phone_number":"xxxxxxxxxx",
        "postal_code":"xxxx",
        "private":false,
        "slug":"xxxxx",
        "street":"Street name",
        "street_number":"1",
        "street_number_bus":"",
        "website":"http://xxxx.com"
    }
}
</pre>

GET /spots/checkin
------------------
Requires *token* and *spot_id* as URL parameters.

Checks a user in at a specific Spot.

Example response:
<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "background": false,
        "data": {
            "color": "15a4da",
            "message": "Yay, you've just checked in",
            "status": "ok",
            "spot_id": "xxxxxx"
        },
        "html": "",
        "needs_long_poll": false,
        "title": "xxxxx",
        "type": "?"
    }
}
</pre>

GET /spots/relevant
-------------------
Requires *token*, *latitude* and *longitude* as URL parameters.

Returns a list of spots relevant to a user and his location.

Example response:

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "data": {
            "items": 
            [
                {
                    "description": "Spot Name",
                    "icon": {
                        "color": "222222",
                        "image": "http://xxx.png",
                        "name": "xxx"
                    },
                    "left_link": {
                        "channel": "builtin",
                        "login_required": false,
                        "params": {
                            "channel": "xxxxxxxx"
                        },
                        "type": "list",
                        "view": "Discover"
                    },
                    "link": {
                        "channel": "spots",
                        "login_required": false,
                        "params": {
                            "id": xxxxxx
                        },
                        "type": "spotdetail",
                        "view": "SpotDetail"
                    },
                    "meta_info": {
                        "distance": 1.57320408075,
                        "distance_str": "1km",
                        "latitude": xxxxxx,
                        "longitude": xxxxxx,
                        "score": 1.651258
                    },
                    "title": "xxxxx",
                    "mapspng": "http://xxxx.png"
                }
            ]
        },
        "html": "",
        "title": "Hi xxxxxxx!",
        "type": "overviewlist"
    }
}
</pre>

GET /spots/search
-----------------
Requires *token*, *latitude*, *longitude* and *search_term* as URL parameters.

Returns a list of spots relevant to a user and his location when provided with a search term.

Example response:

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "background": false,
        "data": {
            "actions": 
            [
                {
                    "description": "Can't find it? Create it!",
                    "icon": {
                        "color": "ffffff",
                        "image": "http://xxxx.png",
                        "name": "spot"
                    },
                    "link": {
                        "channel": "spots",
                        "login_required": false,
                        "params": {},
                        "type": "createspot",
                        "view": "CreateSpot"
                    },
                    "title": "Create a new spot"
                }
            ],
            "items": 
            [
                {
                    "description": "Spot description",
                    "icon": {
                        "color": "ffffff",
                        "image": "http://xxx.png",
                        "name": "xxxx"
                    },
                    "link": {
                        "channel": "spots",
                        "login_required": false,
                        "params": {
                            "id": xxxx
                        },
                        "type": "spotdetail",
                        "view": "SpotDetail"
                    },
                    "title": "Spot Name"
                },
            ]
        },
        "html": "",
        "needs_long_poll": false,
        "title": "Search",
        "type": "?"
    }
}
</pre>

Routes API Documentation
=======================

GET /routes
-----------
Requires *spot_id* as URL parameter.

Returns a list of Routes starting or ending at a specific spot.

Example response:

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "routes": 
        [
            {
                "_id": "xxxxxxxxxxxxxxxxxxxxxx",
                "description": "Another awesome route",
                "name": "Route name",
                "png": "http://xxx.png",
                "points": 
                [
                    {
                        "item": "xxxx"
                    },
                    {
                        "item": "xxxx"
                    },
                    {
                        "item": "xxxx"
                    }
                ]
            }
        ]
    }
}
</pre>

GET /routes/:id
---------------
*:id* should be the Route id as included in the json results of a GET or POST to /routes.

Returns the details of a Route, including detailed information about every Spot on the route.

Example response:

<pre>
{
    "meta": {
        "code": 200,
        "message": {}
    },
    "response": {
        "name": "Thé route ;-)",
        "id": "51de7b2bcf0abdfa3a000001",
        "description": "Route description",
        "spots": 
        [
            // Array of GET /spots/:id
        ],
        "png": "http://xxx.png"
    }
}
</pre>

POST /routes
------------
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
}
</pre>

Adds a route to the database and generates a static Google Maps png representation.

Example response:

<pre>
see GET /routes/:id
</pre>
