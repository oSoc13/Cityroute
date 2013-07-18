/**
* @author: Mathias Raets
* @copyright: OKFN belgium
* This file provides the main functionality 
*/


/**
* on document ready: verify if a user is logged in, show and hide the correct views
**/
$(document).ready( function() {
    // if a user is logged in
    if ($.cookie("token") != null) {
        $("#login").hide();
        $("#geolocationPar").show();
        $("#loginLink").show();
        $("#restart").show();
        
        getGeolocation();
    }
    // if a user is not is not logged in
    else {
        $("#geolocationPar").hide(),
        $("#map-canvas").hide();
        $("#routes").hide();
        $("#spotlist").hide();        
        $("#spotlistTable").html("");
        $("#login").show();
        $("#loginLink").hide();
        $("#restart").hide();
    }
    
    // this happens always, logged in or not
    $("#routeBuilder").hide();
    $("#searchform").hide();
    $("#tabs").hide();
    $("#generate").hide();
    $("#generateTab").hide();    
    $("#loader").hide();    
});



/**
* restart the web-application: hide all the views, clear necessary data and refresh the page.
*/
function restart() {
    getGeolocation();
    $("#geolocationPar").show(),
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
    $("#generate").hide();
    $("#generateTab").hide();   
    $("#loader").hide();   
    
    // stop the location tracking
    window.clearInterval(taskID);
    nearbySpotOpened = false;
};

/**
* show an arror when something goes wrong with an API call
* @param message: the error message that will be shown
*/
function alertAPIError(message) {
    alert("The CityLife API returned the following error message: " + message.msg_text);
};