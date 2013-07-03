// Node.js entry point

var express = require("express");
var spots = require("./urlroutes/spots");

var app = express();

app.get("/spots", spots.findAll);
app.get("/spots/:id", spots.findById);


console.log("Listening on port 1337...");
app.listen(1337);