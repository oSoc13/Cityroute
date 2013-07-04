//@author: Mathias Raets
//@copyright: OFKN be

//acquire geolocation
$(document).ready(function(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        $("#geolocationPar").text("Geolocation is not supported by this browser.");
    }
  });
  

// callback function
function showPosition(position) {
    $("#geolocationPar").html("Latitude: " + position.coords.latitude +  "</br>Longitude: " + position.coords.longitude);
}
