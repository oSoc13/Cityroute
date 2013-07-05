//@author: Mathias Raets
//@copyright: OFKN be

//acquire geolocation
$(document).ready(function(){
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        $("#geolocationPar").text("Geolocation is not supported by this browser."   );
    }
  });
  

// callback function for the geolocation API
function showPosition(position) {
    $("#geolocationPar").html("Latitude: " + position.coords.latitude +  "</br>Longitude: " + position.coords.longitude);   
   
   // send a request to the nodeJS API to acquire the nearby spots
   // parameters: latitude and longitude
   // returns: list of spots
    var url =  "http://localhost:1337/spots?latitude=" + position.coords.latitude + "&longitude=" + position.coords.longitude;
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        success: successSpots,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
}

// callback function after the call in showPosition
function successSpots(data, textStatus, jqXHR) {
    alert("Success");
    //$("#geolocationPar").html(data);
    parseSpotList(data);
}


function parseSpotList( spotList ){
    var parsedSpotlist = JSON.parse(spotList);
    $.each(parsedSpotlist, function(index, value) {
        $('#spotListTable').append('<tr><td>' + value.title + '</td><td>' + value.meta_info.distance_str + '</td></tr>');
    });    
}
