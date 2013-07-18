/**
* @author Mathias Raets
* @copyright: OKFN Belgium
* this file contains the logic to automatically generate routes
**/

var RADIUS = 5; // the maximum distance for a next spot in a generated route(in km)

/**
* generate a route based on a channel and a current spot
*/
function autoGenerateRoute() {
    var spot = spots[0];
    var token = $.cookie("token");
    var channelname = $('#channelList').find(":selected").val();
    var latitude = spot.meta_info.latitude;
    var longitude = spot.meta_info.longitude;
    var id = spot.link.params.id;
    

    var url = "http://" + config_serverAddress + "/routes/generate/" + channelname + "?token=" + token + 
        "&latitude=" + latitude + "&longitude=" + longitude + "&spot_id=" + id + "&radius=" + RADIUS;
    
    // send a request to the nodeJS API to get an automatically generated route
    // parameters: latitude and longitude, channel name, bearer token, spot ID and a radius
    // returns: a fully generated route
    
     $.ajax({
        type: 'GET',
        crossDomain:true,
        url: url,
        cache: false,
        success: onGetGeneratedRoute,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert(errorstatus + ": " + errorthrown);
        }
    });  
};

/**
* callback function after generating a route 
*/
function onGetGeneratedRoute(data, textStatus, jqXHR) {
    if (data.meta.code == 200) {
        selectRoute(data.response.id);
        $("#generate").hide();
        $("#routeBuilder").hide();
        $("#searchform").hide();
        $("#sortableInput").html("");
        $("#sortable").html("");
        $("#suggestions").html("");
        $("#recommended").html("");
        $("#searchresults").html("");
        $("#tabs").hide();
    } else {
        alertAPIError(data.meta.message);
    }
};

/**
* function that shows/hides the correct divs when generating a route 
*/
function showGenerate() {
    $("#geolocationPar").hide(),
    $("#map-canvas").hide();
    $("#map-canvas").height(0);
    $("#routes").hide();
    $("#spotlist").hide();
    $("#routeBuilder").hide();
    $("#sortableInput").html("");
    $("#spotListTable").html("");
    $("#suggestions").html("");
    $("#recommended").html("");
    $("#spotInfo").hide();
    $("#routeSpots").hide();
    $("#searchform").hide();
    $("#tabs").hide();
    $("#searchresults").html("");
    window.clearInterval(taskID);
    nearbySpotOpened = false;
    $("#generate").show();
};