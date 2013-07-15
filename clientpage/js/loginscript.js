/**
* @author: Mathias Raets
* @copyright: OFKN Belgium
*/

/**
* on document ready: verify if a user is logged in
**/
$(document).ready( function() {
    // User logged in
    if ($.cookie("token") != null) {
        $("#login").hide();
        $("#geolocationPar").show();
        getGeolocation();
        $("#loginLink").show();
        $("#routeBuilder").hide();
        $("#restart").show();
        $("#searchform").hide();
        $("#tabs").hide();
    }
    // User is not logged in
    else {
        $("#geolocationPar").hide(),
        $("#map-canvas").hide();
        $("#routes").hide();
        $("#spotlist").hide();
        $("#routeBuilder").hide();
        $("#spotlistTable").html("");
        $("#login").show();
        $("#loginLink").hide();
        $("#restart").hide();
        $("#searchform").hide();
        $("#tabs").hide();
     }
});

/**
* log a user in
**/
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
           alert(errorstatus + ": " + errorthrown);
        }
    });
};

/**
* callback function when a user is logged in 
**/
function onLoggedIn(data, textStatus, jqXHR) {
    if (data.meta.code == 200){
        $.cookie("token", data.response.token);
        location.reload();
    }
    else if (data.meta.code == 401)
        alert("Incorrect username or password");
    else
        alert("The Citylife API returned an error");
};

/**
* log out
*/
function logOut() {
    $.removeCookie("token");
    location.reload();    
};