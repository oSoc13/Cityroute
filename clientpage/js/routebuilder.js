/*** @author Mathias Raets* @copyright OFKN Belgium */var spots = [];/**show the routebuilder using the spots[] variable*/function showRouteBuilder()  {    acquireSuggestedSpots(spots[0]);    acquireRecommendedSpots(spots[0].link.params.id);    $.each(spots, function (index, value) {        var toAdd = "<li id='spot_" + value.link.params.id + "' class='ui-state-default'>" + value.title + "</li>";        $("#sortable").append(toAdd);    });    $("#routes").hide();        /**    Form to add a name and description    */    $("#sortableInput").html("<table><tr><td>Route Name:</td> <td><input type='text' id='routeName' value='NewRoute1'/></td></tr>" +    "<tr><td> Route Description:</td> <td><input type='text' id='routeDescription' value='New Awesome Route'/></td></tr></table>" +     "<p><input type='button' onclick = 'addNewRoute()' value='Add this new route'/></p>");        $("#routeBuilder").show();    $("#searchform").show();
    $("#tabs").show();};/*** @param spotID the ID of the first spot* sets a spot as startspot*/function routeBuilderSetFirstSpot(spotID){    var startSpot;    $.each(spots, function(index,value){        if(value.link.params.id == spotID)            startSpot = value;    });    spots = [];    spots.push(startSpot);};/*** find relevant matches for a location* @param spot the spot you want to find relevant matches for*/function acquireSuggestedSpots(spot){    var latitude = spot.meta_info.latitude;    var longitude = spot.meta_info.longitude;    var url =  "http://" + config_serverAddress + "/spots/relevant/?token=" + $.cookie("token") + "&latitude=" + latitude + "&longitude=" + longitude;        $.ajax({       type: 'GET',       crossDomain:true,        url: url,        cache: false,        success: onGetSuggestedSpots,        cache: false,        error: function(jqXHR, errorstatus, errorthrown) {           alert(errorstatus + ": " + errorthrown);        }    });  };/** * find relevant spots for a location and a search term * @param latitude he latitude of the location * @param longitude the longitude of the location * @param searchTerm the search term */ function acquireSuggestedSpotsBySearch( latitude, longitude, searchTerm) {    var url = "http://" + config_serverAddress + "/spots/search/?token=" + $.cookie("token") + "&latitude=" + latitude + "&longitude=" + longitude + "&search_term=" + searchTerm;        $.ajax({        type: 'GET',        crossDomain:true,        url: url,        cache: false,        success: onGetSearchedSpots,        error: function(jqXHR, errorstatus, errorthrown) {            alert(errorstatus + ": " + errorthrown);        }    }); }/*** find relevant matches for a location* @param latitude the latitude of the location* @param longitude the longitude of the location*/function acquireSuggestedSpotsByLatLong( latitude, longitude){    var url =  "http://" + config_serverAddress + "/spots/relevant/?token=" + $.cookie("token") + "&latitude=" + latitude + "&longitude=" + longitude;        $.ajax({       type: 'GET',       crossDomain:true,        url: url,        cache: false,        success: onGetSuggestedSpots,        error: function(jqXHR, errorstatus, errorthrown) {           alert(errorstatus + ": " + errorthrown);        }    });  };/** * callback function after acquiring a list of searched spots */function onGetSearchedSpots(data, textStatus, jqXHR) {    //data=JSON.parse(data);            if (data.meta.code == 200) {        // clear the searched list        $("#searchresults").html("");        $.each(data.response.data.items, function(index,value) {            $("#searchresults").append("<li onclick='addSearchedSpot(" + index + ")' id='searchedSpot_" + value.link.params.id + "'>" +                "<span class='ui-icon ui-icon-plus'></span> " + value.title + "<br/>" + value.description + "</li>");                            // add latlong data to the DOM elements (prevent requesting the spotinfo again)            // $("#searchedSpot_" + value.link.params.id).data('latlong',{latitude: 20, longitude: 20});        });    } else {        alertAPIError(data.meta.message);    }};/*** callback function ater acquiring a list of relevant spots*/function onGetSuggestedSpots(data, textStatus, jqXHR) {    if (data.meta.code == 200) {        $("#suggestions").html("");        $("#recommended").html("");        $.each(data.response.data.items,function(index,value){                        $("#suggestions").append("<li onclick='addSuggestedSpot(" + index + ")' id='suggestedSpot_" + value.link.params.id + "'>" +                    "<span class='ui-icon ui-icon-plus'></span> " + value.description);                        $("#suggestedSpot_" + value.link.params.id).append("</li>");            // add latlong data to the DOM elements (prevent requesting the spotinfo again)            $("#suggestedSpot_" + value.link.params.id).data('latlong',{latitude: value.meta_info.latitude, longitude: value.meta_info.longitude});        });    } else {        alertAPIError(data.meta.message);    }};/** * add a searched spot as next stop in the route * @param the position in the list of searched spots */function addSearchedSpot( listID ) {    var listitems = document.getElementById("searchresults").getElementsByTagName("li");
    var sortItems = document.getElementById("sortable").getElementsByTagName("li");  
    
    if (sortItems.length >= 10) {
        alert("The current API allows maximum 8 intermediate points.");
    } else {        var spotID = listitems[listID].id.split('_')[1];        var spotName = listitems[listID].innerHTML;        var toAdd = "<li id='spot_" + spotID + "' class='ui-state-default'>" + spotName + "</li>";        $("#sortable").append(toAdd);        acquireRecommendedSpots(spotID);
        
    }    $("#searchresults").html("");};/*** add a suggested spot as next stop in the route* @param the position in the list of suggested spots*/function addSuggestedSpot( listID ) {    var listitems = document.getElementById("suggestions").getElementsByTagName("li");  
    var sortItems = document.getElementById("sortable").getElementsByTagName("li");  
    
    if (sortItems.length >= 10) {
        alert("The current API allows maximum 8 intermediate points.");
    } else {        var spotID = listitems[listID].id.split('_')[1] ;        var spotName = listitems[listID].innerHTML;        var toAdd = "<li id='spot_" + spotID + "' class='ui-state-default'>" + spotName + "</li>";        //$("#sortable").append("<li id='spot_" + spotID + "'>" + spotName + "</li>");        $("#sortable").append(toAdd);
    }    var latlong = $("#" + listitems[listID].id).data("latlong");    acquireSuggestedSpotsByLatLong(latlong.latitude, latlong.longitude);    acquireRecommendedSpots(spotID);};/*** Get a recommended spot based on the VikingPatterns API* @param the spot ID*/function acquireRecommendedSpots(spotID) {    var url = config_WhatsNextAddress + $.cookie("token") + "/whatsnext/" +spotID + "/";        $.ajax({       type: 'GET',        url: url,        success: onGetRecommendedSpots,        dataType:"json",        error: function(jqXHR, errorstatus, errorthrown) {           alert(errorstatus + " :" + errorthrown);        }    });  };/*** callback function after requesting recommended spots*/function onGetRecommendedSpots(data, textStatus, jqXHR) {    if (data.meta.code == 200) {        if (data.response.count > 0) {            $("#recommended").html("");            $.each(data.response.spots,function(index,value){                            $("#recommended").append("<li onclick='addRecommendedSpot(" + index + ")' id='recommendedSpot_" + value.id + "'>" +                        "<span class='ui-icon ui-icon-plus'></span> " + value.name);                                $("#recommendedSpot_" + value.id).append("</li>");                // add latlong data to the DOM elements (prevent requesting the spotinfo again)                $("#recommendedSpot_" + value.id).data('latlong',{latitude: value.latitude, longitude: value.longitude});            });        }        else            $("#recommended").html("There are no recommended spots for this spot.");            } else {        alertAPIError(data.meta.message);    }};/*** add a the selected recommended spot to the list* @param the id of the selected spot*/function addRecommendedSpot( listID ) {    var listitems = document.getElementById("recommended").getElementsByTagName("li");      var sortItems = document.getElementById("sortable").getElementsByTagName("li");          if (sortItems.length >= 10) {        alert("The current API allows maximum 8 intermediate points.");    } else {        var spotID = listitems[listID].id.split('_')[1] ;        var spotName = listitems[listID].innerHTML;        var toAdd = "<li id='spot_" + spotID + "' class='ui-state-default'>" + spotName + "</li>";        $("#sortable").append(toAdd);    }    var latlong = $("#" + listitems[listID].id).data("latlong");    acquireSuggestedSpotsByLatLong(latlong.latitude, latlong.longitude);    acquireRecommendedSpots(spotID);};/**Add a spot for the routeBuilder*/function routeBuilderAddSpot( spot ){    spots.push(spot);};/**clear the routebuilder spots*/function routeBuilderClearSpots() {    spots.length = 0;     $("#sortable").html("");};/**add a new route to the database*/function addNewRoute() {    var items = document.getElementById("sortable").getElementsByTagName("li");         var points = [];    $.each(items, function (index, value) {                                if (index <= 10 ){ // API allows max. 8 waypoints                                    var id = parseInt((value.id.split('_')[1]));                                    points.push({'item': id});                                                               }                            });        var newRoute = {                    name: $("#routeName").val(),                    description: $("#routeDescription").val(),                    points: points                     };    var url =  "http://" + config_serverAddress + "/routes/";    $.ajax({        url: url,        data: newRoute,        success: onRouteAdded,        dataType: "json",        type: "POST"        });};/**callback function after adding a route*/function onRouteAdded(data, textStatus, jqXHR) {    if (data.meta.code == 200)    {        selectRoute(data.response.id);        $("#routeBuilder").hide();        $("#searchform").hide();        $("#sortableInput").html("");        $("#sortable").html("");        $("#suggestions").html("");        $("#recommended").html("");        $("#searchresults").html("");
        $("#tabs").hide();    } else {        alertAPIError(data.meta.message);    }    };function search(){    var searchTerm = $("#searchTerm").val();    navigator.geolocation.getCurrentPosition( function (position) {                    acquireSuggestedSpotsBySearch( position.coords.latitude, position.coords.longitude, searchTerm);                });};function alertAPIError(message) {    alert("The CityLife API returned the following error message: " + message.msg_text);};