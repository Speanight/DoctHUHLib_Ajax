
//------------------------------------------------------------------------------
//--- ajaxRequest --------------------------------------------------------------
//------------------------------------------------------------------------------
// Perform an Ajax request.
// \param type The type of the request (GET, DELETE, POST, PUT).
// \param url The url with the data.
// \param callback The callback to call where the request is successful.
// \param data The data associated with the request.
/**
 * Perform an AJAX request to the specified URL
 * @param type - Request's verb (GET, POST, PUT, DELETE, UPDATE)
 * @param url - The destination URL
 * @param callback - The function which will treat the returned data's from the backend
 * @param data - Specific data to append at the end of the URL (POST/GET arguments)
 */
function ajaxRequest(type, url, callback, data = null)
{
  let xhr;
  console.log(url);

  // Create XML HTTP request.
  xhr = new XMLHttpRequest();
  if (type == 'GET' && data != null)
    url += '?' + data;
  xhr.open(type, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  // Add the onload function.
  xhr.onload = () =>
  {
    switch (xhr.status)
    {
      case 200:
      case 201:
        console.log(xhr.responseText);
        callback(JSON.parse(xhr.responseText));
        break;
      default:
        httpErrors(xhr.status);
    }
  };

  // Send XML HTTP request.
  xhr.send(data);
}

//------------------------------------------------------------------------------
//--- httpErrors ---------------------------------------------------------------
//------------------------------------------------------------------------------
// Display an error message accordingly to an error code.
// \param errorCode The error code (HTTP status for example).
function httpErrors(errorCode)
{
  let messages = {
    400: 'Requête incorrecte',
    401: 'Authentifiez vous',
    403: 'Accès refusé',
    404: 'Page non trouvée',
    500: 'Erreur interne du serveur',
    503: 'Service indisponible'
  };

  // Display error.
  if (errorCode in messages)
  {
    $('#errors').html('<strong>' + messages[errorCode] + '</strong>');
    $('#errors').show();
    setTimeout(() =>
    {
      $('#errors').hide();
    }, 5000);
  }
}



function displayPage(data) { //Group header+footer and load the user datas
  let page = data["header"] + data["html"];
  let user = data["user"];
  document.open();
  document.write(page);
  document.close();

  // document.addEventListener("DOMContentLoaded", function() {
  //   displayDatas(user);
  // }, false);
}

function displayDatas(data) {
  let user = data["user"];
  let fullname = document.getElementsByClassName("user-fullname");
  for (let i = 0; i < fullname.length; i++) {
    fullname[i].innerHTML = user["surname"] + " " + user["name"];
  }

  let photo = document.getElementsByClassName("user-picture");
  for (let i = 0; i < photo.length; i++) {
    photo[i].src = user["picture"];
  }

  for (const key in user) {
    displayUserData(user, key);
  }

  hideElementUser(user);
}

function displayNextMeeting(data) {
  if (data === null) {
    let elements = document.getElementsByClassName("meeting-not-none");
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
  }
}

/**
Function used by displayUserDatas (with an 'S') to avoid repetition.
It searches the whole page for classes called "user-" + data,
where data is the data it searches for.

A typical use for this would be something like this:
We want to show the name of the user in specific places on the web page.

Therefor we need to get the "name" element from user:
We can call the function with displayUserData(user, "name");
This will cause the function to display the name in every HTML element that has
"user-name" in its class.
*/
function displayUserData(user, data) {
  let elements = document.getElementsByClassName("user-" + data);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].nodeName === "INPUT") {
      elements[i].value = user[data];
    }
    else {
      elements[i].value = user[data];
    }
  }
}

// TODO: fix fonction hide elements.
function hideElementUser(data) {
  // let user = data[0];
  let domNone = document.getElementsByClassName("user-none");
  let domPatient = document.getElementsByClassName("user-patient");
  let domPracticien = document.getElementsByClassName("user-practicien");

  if (user == null) {
    for (let i = 0; i < domPatient.length; i++) {
      domPatient[i].style.display = "none";
    }

    for (let i = 0; i < domPracticien.length; i++) {
      domPracticien[i].style.display = "none";
    }

    for (let i = 0; i < domNone.length; i++) {
      domNone[i].style.display = "block";
    }
  }
  else {
    if (user[0]["speciality"] === undefined) {
      for (let i = 0; i < domPracticien.length; i++) {
        domPracticien[i].style.display = "none";
      }
  
      for (let i = 0; i < domNone.length; i++) {
        domNone[i].style.display = "none";
      }
      
      for (let i = 0; i < domPatient.length; i++) {
        domPatient[i].style.display = "block";
      }
    }
    else {
      for (let i = 0; i < domNone.length; i++) {
        domNone[i].style.display = "none";
      }
      
      for (let i = 0; i < domPatient.length; i++) {
        domPatient[i].style.display = "none";
      }

      for (let i = 0; i < domPracticien.length; i++) {
        domPracticien[i].style.display = "block";
      }
    }
  }
}
//------------------------------------------------------------------------------
//--- Utils func ---------------------------------------------------------------
//------------------------------------------------------------------------------
// A list of specific utilities function that are not natively implemented in JavaScript
/**
 * Return the inputted string with it first letter capitalized.
 * @param str - String to parse
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * This function check if the backend sent back an error/warning/info message and print it to the current page.
 * It can be called each time you expect a potential return message. Don't forget to do an early return
 * @param {array} data - The JSON decoded array returned by the backend.
 * @returns {boolean} True if there is a message, False otherwise
 */
function checkErrorMessage(data){
  if('message' in data){
    document.body.insertAdjacentHTML("afterend", data["message"]);
    setTimeout( () => {
      Array.from(document.getElementsByClassName("errorWrapper")).forEach((elem) => {
        elem.remove();
      });
    }, 3000);

  }
  return 'message' in data;
}

//------------------------------------------------------------------------------
//--- Loading page block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads the corresponding page
/**
 * Load the html and header from the health search space into the current page
 * @param data
 */
function loadSantePage(data){
  displayPage(data)
  hideElementUser(data)
}

/**
 * Load the html and header for the welcome page
 * @param data
 */
function loadAccueil(data){
  displayPage(data);
  
  document.addEventListener("DOMContentLoaded", function() {
    // displayDatas(data);
  }, false);
}
function loadMedecinPage(data){
  displayPage(data)
  hideElementUser(data)
}

document.addEventListener("DOMContentLoaded", function() {
  ajaxRequest("GET", "/user", displayDatas);
  ajaxRequest("GET", "/meeting/next", displayNextMeeting);
})

//Avoid recursive load of ajax.js hence an epileptic loading page
if (document.getElementById("initialLoad") !== null) {
  ajaxRequest("GET", "/accueil", loadAccueil);
}

//------------------------------------------------------------------------------
//--- Page event redirection block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// Call the correct function to load the clicked page
document.getElementById("acButton").addEventListener("click", () => {
    ajaxRequest("GET", "/accueil", loadAccueil);
});
document.getElementById("titleButton").addEventListener("click", () => {
    ajaxRequest("GET", "/accueil", loadAccueil);
});
document.getElementById("esButton").addEventListener("click", () => {
  //TODO Check if user is connected. If not, redirect directly to the vconnectioN.php page to execute the php code. If connected, launch the request below
  ajaxRequest("GET", "/rendezvous", loadSantePage);
});
document.getElementById("epButton").addEventListener("click", () => {
    ajaxRequest("GET", "/espacedoc", loadMedecinPage);
});

