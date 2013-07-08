/**
* @author: Mathias Raets
* @copyright: OFKN Belgium
*/

$(document).ready( function() {
    if ($.cookie("token") != null) {
        $("#login").hide();
        $("#geolocationPar").show();
        getGeolocation();
        }
    else {
        $("#geolocationPar").hide(),
        $("#map-canvas").hide();
        $("#routes").hide();
        $("#spotlist").hide();
        $("#spotlistTable").html("");
        $("#login").show();
     }
});

function loginuser(){
    var psw = $("#password").val();
    var userName = $("#username").val();
    var encoded = $.base64('btoa',userName + ":" + psw, false);
    var url =  "http://" + config_serverAddress + "/users/login/" + encoded;
    $.ajax({
       type: 'GET',
       crossDomain:true,
        url: url,
        success: onLoggedIn,
        error: function(jqXHR, errorstatus, errorthrown) {
           alert("Error: " + errorstatus);
        }
    });
};

function onLoggedIn(data, textStatus, jqXHR) {
    if (data != ""){
        $.cookie("token", data.response.token);
        location.reload();
    }
    else
        alert("Incorrect username or password");
};