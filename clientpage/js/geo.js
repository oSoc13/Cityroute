/**
* @author: Mathias Raets
* @copyright: OFKN be
*/

/**
* acquire geolocation
*/
var googleKey = "";

$(document).ready(function(){ 
/**
 * read the API key from the file
 */
    $.getScript("/js/auth/apikey.js",function(){googleKey = mapsapikey});
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationKnown);
    }
    else {
        $("#geolocationPar").text("Geolocation is not supported by this browser."   );
    }
  });
  
  
  function loadMaps() {
   var mapOptions = {  
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
}



/**
* callback function for the geolocation API
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
        success: onGetSpots,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

/**
* callback function after the call in showPosition
*/
function onGetSpots(data, textStatus, jqXHR) {
    parseSpotList(data);
};

/**
* parse the list of nearby spots and show them in an (ugly) table
*/
function parseSpotList( spotList ){
    var parsedSpotlist = JSON.parse(spotList);
    $.each(parsedSpotlist, function(index, value) {
        $('#spotListTable').append('<tr><td>' + value.title + '</td><td>' + value.meta_info.distance_str + 
        '</td><td> <input type="button" onclick=showRoute("' + value.link.params.id + '") value="Show route" /></tr>');
    });    
};

/**
* show a list of possible routes for a given spot ID
* @param spotID: the ID of the spot
*/
function showRoute ( spotID ){
   /** 
   * send a request to the nodeJS API to acquire the nearby spots
   * parameters: latitude and longitude
   * returns: list of spots
   */
    var url =  "http://" + config_serverAddress + "/routes/?spot_id=" + spotID;
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        success: onGetRoutes,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

/**
* callback function after requesting the routes for a spot
*/
function onGetRoutes(data, textStatus, jqXHR) {    
    $("#routes").html("");
    // for each route
    $.each(data, function (routeIndex, routeValue) {
        $("#routes").append("<table><th><td>Route " + routeValue.name + 
            "</th><th><input type='button' value='Select Route' onclick=selectRoute('" + routeValue._id + "') /></th></tr>");
        // for each spot
        $.each(routeValue.points, function(spotIndex, spotValue) {
            $("#routes").append("<tr><td>Spot:  " + spotValue.item + "</td></tr>");
        });
        $("#routes").append("</table>");
    });
};

/**
* requests all the information for a given route
* @param routeID the id for the route
*/
function selectRoute(routeID) {
   /**
   * send a request to the nodeJS API to acquire the nearby spots
   * parameters: latitude and longitude
   * returns: list of spots
   */
    var url =  "http://" + config_serverAddress + "/routes/" + routeID;
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        success: onGetRouteByID,
        cache: false,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

/**
* Callback function after receiving route information
*/
function onGetRouteByID(data, textStatus, jqXHR) { 
    showGoogleMaps();
    alert(data.name);
};

/**
* show the route on a google maps view
*/
function showGoogleMaps(){
   loadMaps();
};


/**
* callback function after loading a map
*/
function onMapsLoaded() {
  var mapOptions = {  
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
}

/*
* load google maps
*/
function loadMaps() {
  google.load("maps", "3", {"callback" : onMapsLoaded,"other_params" :"key=" + googleKey + "&sensor=true"});
}




