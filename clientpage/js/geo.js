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
  

// callback function
function showPosition(position) {
    $("#geolocationPar").html("Latitude: " + position.coords.latitude +  "</br>Longitude: " + position.coords.longitude);
   // var request = "http://localhost:1337/spots?" + "latitude=" +  position.coords.latitude + "&longitude=" +  position.coords.longitude;
   
   
    var url =  "http://10.129.129.67:1337/spots?latitude=12&longitude=12";
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


function successSpots(data, textStatus, jqXHR) {
    alert("Success");
    $("#geolocationPar").html(data);
}
