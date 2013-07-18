/**
* @author: Mathias Raets
* @copyright: OFKN be
* This file provides nearby spot and check-in functionality
*/

/**
* acquire geolocation
*/
var googleKey = "";
var dirService;
var dirDisplay;
var routeData;


/**
* get the geo location
*/
function getGeolocation() {
    $.getScript("/js/auth/apikey.js",function(){googleKey = mapsapikey});
    
    navigator.geolocation.getCurrentPosition(onLocationKnown,function(err){
        alert("Could not request geolocation");
        },
        {timeout:10000});
};

/**
* callback function for the geolocation API
* @param position: the current position
*/
function onLocationKnown(position) {
    $("#geolocationPar").html("Latitude: " + position.coords.latitude +  "</br>Longitude: " + position.coords.longitude);   
    
   // send a request to the nodeJS API to acquire the nearby spots
   // parameters: latitude and longitude
   // returns: list of spots
    var url =  "http://" + config_serverAddress + "/spots?latitude=" + position.coords.latitude + "&longitude=" + position.coords.longitude;
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        cache: false,
        success: onGetSpots,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

/**
* callback function after the call in showPosition
* parse the list of nearby spots and show them
*/
function onGetSpots(data, textStatus, jqXHR) {
    if (data.meta.code == 200) {
        // clear the list of spots for the routebuilder
        routeBuilderClearSpots();
        $.each(data.response.data.items, function(index, value) {
            $('#spotListTable').append('<tr><td>' + value.title + '</td><td>' + value.meta_info.distance_str + 
                '</td><td> <input type="button" onclick=checkIn("' + value.link.params.id + '") value="Check In" /></tr>');
            $("#geolocationPar").hide();
            $("#spotList").show();
            routeBuilderAddSpot(value);
        });
    } else {
        alertAPIError(data.meta.message);
    }
};

/**
* check in at a given spot
* @param spotID the id of the spot where you want to check in
*/
function checkIn( spotID ) {

    // send a request to the nodeJS API to check in at a spot
    // parameters: the bearer token and the spot id
    // returns: confirmation of the check-in, spot ID
    var url =  "http://" + config_serverAddress + "/spots/checkin?spot_id=" + spotID + "&token=" + $.cookie("token");
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        cache: false,
        success: onCheckedIn,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
    
    // set the start spot for a route
    routeBuilderSetFirstSpot(spotID);
     $("#map-canvas").height(0);
};

/**
* callback function when checked in
*/
function onCheckedIn(data, textStatus, jqXHR) {
    if (data.meta.code == 200) {
        $("#generateTab").show();
        showRoute(data.response.data.spot_id);
    } else {
        alert("The Citylife API returned an error. This could be caused by an expired session. Please log in again");
        logOut();
    }    
};