/**
* @author: Mathias Raets
* @copyright: OFKN Belgium
*/




var googleMap;
var myMarker;



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
    dirDisplay.setDirections(directionsResult);
    
    window.setInterval(function(){
        navigator.geolocation.getCurrentPosition( function (position) {
            var latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            myMarker.setPosition(latLong);    
        });
    },3000);
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
* load google maps
*/
function loadMaps() {
  google.load("maps", "3", {"callback" : onMapsLoaded,"other_params" :"key=" + googleKey + "&sensor=true"});
};
