/**
* @author: Mathias Raets
* @copyright: OFKN be
*/

/**
* acquire geolocation
*/
var googleKey = "";
var googleMap;
var dirService;
var dirDisplay;
var routeData;

$(document).ready(function(){ 
/**
 * read the API key from the file
 */
    $.getScript("/js/auth/apikey.js",function(){googleKey = mapsapikey});
    getGeolocation();
});

/**
* get the geo location
*/
function getGeolocation()
{
     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationKnown);
    }
    else {
        $("#geolocationPar").text("Geolocation is not supported by this browser."   );
    }
};

  
  
  
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
        '</td><td> <input type="button" onclick=showRoute("' + value.link.params.id + '") value="Check In" /></tr>');
        $("#geolocationPar").hide();
        $("#spotList").show();
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
   $("#spotList").hide();
   $("#spotListTable").html("");
   
   $("#routes").show();
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
    $("#routes").hide();
    $("#map-canvas").show();
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
    routeData = data;
};

/**
* Generate a given route and show it on the map
*/
function generateRoute( ) {
    var numSpots = routeData.spots.length -1;
    var originLat = routeData.spots[0].response.latitude;
    var originLong = routeData.spots[0].response.longitude;
    var destLat = routeData.spots[numSpots].response.latitude;
    var destLong = routeData.spots[numSpots].response.longitude;
    var latLong = new google.maps.LatLng(originLat, originLong);
    var destLatLong = new google.maps.LatLng(destLat, destLong);    
    

    // initialize google variables
    dirService = new google.maps.DirectionsService();
    dirDisplay = new google.maps.DirectionsRenderer();
    dirDisplay.setMap(googleMap);
    
    // the waypoints will be stored in this array
    var waypoints = [];
    
    //iterate over all the spots in the route
    $.each(routeData.spots, function(index, value) {
                        //the first and the last spot are not waypoints!
                        if (index != 0 && index != numSpots){
                            var coords = new google.maps.LatLng(value.response.latitude, value.response.longitude);
                            waypoints.push({location:coords, stopover:true});
                            }
                        });
    
    // generate the request
    var dirRequest = {
       origin: latLong, 
       destination: destLatLong,
       waypoints: waypoints,
       travelMode: google.maps.DirectionsTravelMode.WALKING
     };
    
    //generate the route using Google Directions API
    dirService.route(dirRequest, onRouteCalculated );   
};

/**
* callback function: after the route has been generated
*/
function onRouteCalculated (directionsResult, directionsStatus){
    dirDisplay.setDirections(directionsResult);
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
    googleMap = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);
    
    generateRoute();
};

/*
* load google maps
*/
function loadMaps() {
  google.load("maps", "3", {"callback" : onMapsLoaded,"other_params" :"key=" + googleKey + "&sensor=true"});
};

/**
* restart the web-application
*/
function restart() {
    getGeolocation();
    $("#geolocationPar").show(),
    $("#map-canvas").hide();
    $("#routes").hide();
    $("#spotlist").hide();
    $("#spotlistTable").html("");
};