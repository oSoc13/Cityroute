/**
* @author: Mathias Raets
* @copyright: OFKN be
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
        {timeout:3000});
};

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
        cache: false,
        success: onGetSpots,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

/**
* callback function after the call in showPosition
* parse the list of nearby spots and show them in an (ugly) table
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
    routeBuilderSetFirstSpot(spotID);
};

/**
* callback function when checked in
*/
function onCheckedIn(data, textStatus, jqXHR) { 
    showRoute(data.response.data.spot_id);
}

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
        cache: false,
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
    $("#routes").append("<div style='float:left;' ><input type='button' value='Add new route' onclick='showRouteBuilder()'/> </div>"  + 
        "<div class='optimizeSpan' >Optimize Waypoints: <br /><select id='optimizeSwitch'><option value='1'>On</option><option value='0'>Off</option></select></div>");
        $('#optimizeSwitch').switchify();
    if (data != "") {
        $.each(data, addRouteInformation);
    }
};

function addRouteInformation(index, value) {
    var html = " <div class='routeinfo' > " + value.name + "<br />" + value.description + 
            "<br /><img onclick=selectRoute('" + value._id + "') src='" + value.png + "' width='150' height= '150'/>";
      
    $("#routes").append(html);
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
        cache: false,
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
* restart the web-application
*/
function restart() {
    getGeolocation();
    $("#geolocationPar").show(),
    $("#map-canvas").hide();
    $("#routes").hide();
    $("#spotlist").hide();
    $("#routeBuilder").hide();
    $("#sortableInput").html("");
    $("#spotListTable").html("");
    $("#suggestions").html("");
    $("#spotInfo").hide();
    $("#searchform").hide();
    $("#searchresults").html("");
    window.clearInterval(taskID);
};


