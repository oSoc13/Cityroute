/**
* @author: Mathias Raets
* @copyright: OFKN Belgium
*/

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