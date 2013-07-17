/**
* @author Mathias Raets
* @copyright: OKFN Belgium
**/

function autoGenerateRoute() {
    var spot = spots[0];
    var token = $.cookie("token");
    var channelname = $('#channelList').find(":selected").val();
    var latitude = spot.meta_info.latitude;
    var longitude = spot.meta_info.longitude;
    var id = spot.link.params.id;
    

    var url = "http://" + config_serverAddress + "/routes/generate/" + channelname + "?token=" + token + 
        "&latitude=" + latitude + "&longitude=" + longitude + "&spot_id=" + id + "&radius=5";
    
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
}

