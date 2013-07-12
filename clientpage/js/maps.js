/**
* @author: Mathias Raets
* @copyright: OFKN Belgium
*/




var googleMap;
var myMarker;
var taskID;
var nearbySpotOpened = false;

var visitedSpots = [];



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
    dirDisplay = new google.maps.DirectionsRenderer({suppressMarkers : true});
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
       optimizeWaypoints:$("#optimizeSwitch").val() == 1,
       travelMode: google.maps.DirectionsTravelMode.WALKING
     };
    
    //generate the route using Google Directions API
    dirService.route(dirRequest, onRouteCalculated );   
    
    navigator.geolocation.getCurrentPosition( function (position) {
            var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var circle = {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: "lightblue",
                  fillOpacity: 0.8,
                  scale: 5,
                  strokeColor: "black",
                  strokeWeight: 1
                };

            
            
            var markerOptions = 
            {   
                position: latLong,
                title:"My Position",
                icon: circle

            }   
            myMarker = new google.maps.Marker(markerOptions);
            myMarker.setVisible(true);
            myMarker.setMap(googleMap);
            
        });
};

/**
* callback function: after the route has been generated
*/
function onRouteCalculated (directionsResult, directionsStatus){

    // imagenames for the markerimages
    var markerArray = ["dd-start","markerA","markerB","markerC","markerD","markerE","markerF","markerG","markerH","markerI","markerJ","markerK"];
    
    // the last spot gets also a special icon
    markerArray[directionsResult.routes[0].waypoint_order.length + 1] = "dd-end";
    dirDisplay.setDirections(directionsResult);
    
    // add markers to mark the spots
    $.each(routeData.spots, function(index, value) {
        var wparray = directionsResult.routes[0].waypoint_order;
        var newWpArray = [];
        newWpArray = newWpArray.concat([-1],wparray, [wparray.length]);
        var markerIndex = newWpArray[index] + 1;

        var iconString = "http://www.google.com/mapfiles/" + markerArray[markerIndex] + ".png";

        var markerOptions = 
        {   
            position: new google.maps.LatLng(value.response.latitude, value.response.longitude),
            title: "Location:" + value.response.name,
            animation: google.maps.Animation.DROP,
            clickable: true,
            icon: iconString
            
        }   
        var marker = new google.maps.Marker(markerOptions);
        marker.setVisible(true);
        marker.setMap(googleMap);
        var infoWindow = new google.maps.InfoWindow();
        
        // add a infowindow with the name of the spot
        infoWindow.setContent("<b>Location:</b>" + value.response.name + "<br /><b>Description:</b>" + value.response.description);
        
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(googleMap, marker);
        });
    });
    
    
    
    
    //console.log(JSON.stringify(directionsResult.routes));
    
    window.clearInterval(taskID);
    /* Check each 3 seconds for an update of the position */
    taskID = window.setInterval(function(){
            navigator.geolocation.getCurrentPosition( function (position) {
                var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                myMarker.setPosition(latLong);
                checkSpotsOnRoute(latLong);
            }, function (error) {alert("Error while acquiring current location");},{enableHighAccuracy:true});
    },3000);
    
    showRouteMetaInfo(directionsResult.routes[0].waypoint_order);
};

/**
* Show extra information in the route view
* @param the order of the waypoints
**/
function showRouteMetaInfo(waypoints){
    $("#routeSpots").slideDown();
    $("#routeSpotsMeta").html("Routename: " + routeData.name + "<br />Description:<br />" + routeData.description + "<br /><br /><b>Spots: </b>");
    $("#routeSpotsList").html("");
    
    //add start point
    $("#routeSpotsList").append("<li>" + routeData.spots[0].response.name + "</li>");    
    
    // add waypoints
    for (var i = 0; i < waypoints.length; ++i ){
          $("#routeSpotsList").append("<li>" + routeData.spots[waypoints[i] + 1].response.name + "</li>");
    }
    
    //add last point
    $("#routeSpotsList").append("<li>" + routeData.spots[waypoints.length + 1].response.name + "</li>");
};


/**
* compare your current position with the position of the spots on the route
* @param currentPosition your current position
*/
function checkSpotsOnRoute ( currentPosition ) {
    $.each( routeData.spots, function (index, value) {
        var distance = haversine( currentPosition.lat(), value.response.latitude, currentPosition.lng(), value.response.longitude);
        if (!nearbySpotOpened && distance <= 0.100) {
            if ( $.inArray( value, visitedSpots ) < 0 ) {
                showSpotInfo(value);
                visitedSpots.push(value);
                nearbySpotOpened = true;                
            }      
        }
        });
};

/**
* show information about a nearby spot
* @param spot the nearby spot
*/
function showSpotInfo (spot) {
    $("#spotInfo").hide();
       
    var latitude = spot.response.latitude;
    var longitude = spot.response.longitude;
    
    var url =  "http://" + config_serverAddress + "/spots?latitude=" + latitude + "&longitude=" + longitude;
    
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        cache: false,
        success: function (data, textStatus, jqXHR) {
            if (data.meta.code == 200) {
                $("#spotInfo").html("<b> Spot: </b> " + spot.response.name + "</br> <b>Description:</b>" + spot.response.description +
                    "<br /> <img src ='" + spot.response.images.cover.link +  "' width = '200' height='200'/>");
                 $("#spotInfo").append("<input type='button' value='Check in here' onclick=checkinAtNearSpot('" + spot.response.id + "') /><input type='button' value='Close' onclick= $('#spotInfo').slideUp();nearbySpotOpened = false; />");
                 $("#spotInfo").append("<div onclick=$('#nearbyList').slideToggle()> Show/Hide nearby spots </div>");
                    
                $("#spotInfo").append("<div  id = 'nearbyList' class='nearbySpots';/>");
                $.each(data.response.data.items, function (index, value) {
                    if (value.link.params.id != spot.response.id)
                        //$("#spotInfo").append("<li>" + value.title + "</li>");
                        $("#nearbyList").append("<div>" + value.title + "<br/><img width='150' height='150' src='" + value.mapspng + "'</div>");
                });          
                $('#nearbyList').hide();
                $("#spotInfo").slideDown();
            } else {
                alertAPIError(data.meta.message);
            }
        },
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });    
};

function checkinAtNearSpot (spotID) {
    var url =  "http://" + config_serverAddress + "/spots/checkin?spot_id=" + spotID + "&token=" + $.cookie("token");
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        cache: false,
        success: onCheckedInAtNearSpot,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

function onCheckedInAtNearSpot ( data, textStatus, jqXHR ) {
    alert ("You are checked in!");
    $('#spotInfo').slideUp();
    nearbySpotOpened = false;
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
    googleMap = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);    
    
    generateRoute();
};

/**
* a function to calculate the distance between points based on lat/long coordinates
* @param latA latitude of the first point
* @param longA longitude of the first point
* @param latB latitude of the second point
* @param longB longitude of the second point
* @return the distante in m between the two points
*/
function haversine(latA, latB, lonA, lonB){
    var R = 6371; // km
    var dLat = toRad(latB-latA);
    var dLon = toRad(lonB-lonA);
    var latA = toRad(latA);
    var latB = toRad(latB);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(latA) * Math.cos(latB); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d ;
};

/**
* convert degrees to Radians
* @param value input degrees to be converted
* @return the value in tadians
*/
function toRad(value) {
    /** Converts numeric degrees to radians */
    return value * Math.PI / 180;
};



/**
* load google maps
*/
function loadMaps() {
  google.load("maps", "3", {"callback" : onMapsLoaded,"other_params" :"key=" + googleKey + "&sensor=true"});
};
