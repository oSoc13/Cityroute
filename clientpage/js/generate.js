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
    $("#generate").hide();
    $("#loader").show();
};

/**
* callback function after generating a route 
*/
function onGetGeneratedRoute(data, textStatus, jqXHR) {
    $("#loader").hide();
    if (data.meta.code == 200) {
        selectRoute(data.response.id);
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

/**
* add a channel for the patterned generator
*/
function addChannel() {
    if (document.getElementById("channels").getElementsByTagName("li").length < 9) {
        var channelname = $('#channelList_add').find(":selected").val();
        var channelText = $('#channelList_add').find(":selected").html();
        
        $("#channels").append("<li data= '" + channelname + "'>" + channelText + "</li>");
    } else {
        alert("You can add maximum 9 channels!");
    }
};

/**
* generate a route based on the channel pattern
*/
function addGeneratedChannel(){
    var spot = spots[0];
    var token = $.cookie("token");
    var latitude = spot.meta_info.latitude;
    var longitude = spot.meta_info.longitude;
    var channels = document.getElementById("channels").getElementsByTagName("li");
    var channelString = "";
    var token = $.cookie("token");
    var id = spot.link.params.id;
    
    for (var i = 0; i < channels.length; ++i){
        if (i < (channels.length - 1))
            channelString += channels[i].getAttribute('data') + "|";
        else
            channelString += channels[i].getAttribute('data');
    }
    
    // structure for channel parameter: <channel1>|<channel2>|<channel3>|.....|<channel9>
    var url = "http://" + config_serverAddress + "/routes/generate/?channels=" + channelString + "&token=" + token + 
        "&latitude=" + latitude + "&longitude=" + longitude + "&spot_id=" + id + "&radius=" + RADIUS;
    
    // send a request to the nodeJS API to get an automatically generated route
    // parameters: latitude and longitude, a list of channels, bearer token, spot ID and a radius
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
    $("#generate").hide();
    $("#loader").show();    
    
};