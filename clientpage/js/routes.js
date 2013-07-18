/**
* @author: Mathias Raets
* @copyright: OFKN be
* This file provides route functionality
*/

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
   $("#aside").hide();
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
    $("#routes").append("<div style='float:left;' ><input style='margin-right:50px;' type='button' value='Add new route' onclick='showRouteBuilder()'/> "  + 
        " Optimize Waypoints: <select id='optimizeSwitch'><option value='1'>On</option><option value='0'>Off</option></select></div>");
        $('#optimizeSwitch').switchify();
    if (data.meta.code == 200) {
        $.each(data.response.routes, addRouteInformation);
    } else {
        alertAPIError(data.meta.message);
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
    $("#map-canvas").height(300);
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
    if (data.meta.code == 200) {
        showGoogleMaps();
        routeData = data.response;
    } else {
        alertAPIError(data.meta.message);
    }
};