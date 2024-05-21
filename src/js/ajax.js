
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
function ajaxRequest(type, url, callback, data = null, sendFile = false)
{
  let xhr;
  console.log(url + "?" + data);

  // Create XML HTTP request.
  xhr = new XMLHttpRequest();
  if (type == 'GET' && data != null)
    url += '?' + data;
  xhr.open(type, url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('Pragma', 'no-cache');

  if (sendFile) {
    xhr.setRequestHeader('X-File-Name', data.name);
    xhr.setRequestHeader('X-File-Size', data.size);
  }

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

function displayDatas(data, profile="user") {
  let user = data[profile];
  console.log(user);
  if (user != null) {
    let fullname = document.getElementsByClassName(profile + "-fullname");
    for (let i = 0; i < fullname.length; i++) {
      fullname[i].innerHTML = user.surname + " " + user.name;
    }

    let photo = document.getElementsByClassName(profile + "-picture");
    for (let i = 0; i < photo.length; i++) {
      photo[i].src = "/assets/img/" + user.picture;
    }

    let street = document.getElementsByClassName(profile + "-place-street");
    for (let i = 0; i < street.length; i++) {
      street[i].innerHTML = user["place"]["num_street"] + " | " + user["place"]["street"]["street"];
    }

    let city = document.getElementsByClassName(profile + "-place-city");
    for (let i = 0; i < street.length; i++) {
      console.log("|----------|");
      console.log(user["place"]["city"]["code_postal"] + " " + user["place"]["city"]["city"]);
      city[i].innerHTML = user["place"]["city"]["code_postal"] + " " + user["place"]["city"]["city"];
    }

    for (const key in user) {
      if (key == ("place" || "meetings" || "speciality")) {
        for (const subKey in user[key]) {
          displayUserData(user[key], subKey, profile + "-" + key);
        }
      }
      displayUserData(user, key, profile);
    }
  }

  hideElementUser(user);
}

function displayNextMeeting(data) {
  console.log("displaynextmeeting!");
  let elements = document.getElementsByClassName("meeting-not-none");
  if (data === null) {
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.display = "none";
    }
  }
  else {
    console.log(elements);
    for (let i = 0; i < elements.length; i++) {
      elements[i].innerHTML = `
      Votre prochain rendez-vous est le ${data.beginning} à ${data.beginning} avec le médecin ${data.medecin.name} ${data.medecin.surname}, ${data.medecin.speciality.type}.
      Il s'effectuera à ${data.medecin.place.street} ${data.medecin.place.num_street} ${data.medecin.place.city.city}. 
      `;
    }
  }
}

function displayMedecinMeetings(data) {
  displayPage(data);
  document.addEventListener("DOMContentLoaded", function() {
    displayDatas(data, "medecin");
    displayMeetingsToUser(data);
  })
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
function displayUserData(user, data, name) {
  let elements = document.getElementsByClassName(name + "-" + data);
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].nodeName === "INPUT") {
      elements[i].value = user[data];
    }
    else {
      elements[i].innerHTML = user[data];
    }
  }
}

function hideElementUser(user) {
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
    if (user.speciality === undefined) {
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
  // TODO: Voir pourquoi erreur sur string.charAt qui n'est pas une fonction.
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

function isUserConnected(user){
    if(user["user"] == null){
      window.location.href = document.location.origin+"/login"; //http:\//localhost/login
    }
    else{
        ajaxRequest("GET", "/rendezvous", loadSantePage);
    }
}

//------------------------------------------------------------------------------
//--- Loading page block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads the corresponding page
function onceDisconnected(data){
  ajaxRequest("GET", "/accueil", loadAccueil);
  checkErrorMessage(data);
}

/**
 * Load the html and header from the health search space into the current page
 * - Uses the function showMeetingsIntable() to display the meetings below.
 * @param data
 */
function loadSantePage(data){
  displayPage(data)
  document.addEventListener("DOMContentLoaded", () => {
    if ("futureMeetings" in data) {
      let area = document.getElementById("futureMeetings");
      let content = `
      <h3>Vos prochains rendez-vous</h3>
      <hr>
      `
      content += showMeetingsInTable(data["futureMeetings"]);
      console.log(content);
      area.innerHTML += content;
    }

    if ("pastMeetings" in data) {
      let area2 = document.getElementById("pastMeetings");
      let content2 = `
      <h3>Vos rendez-vous passés</h3>
      <hr>
      `
      content2 += showMeetingsInTable(data["pastMeetings"]);
      area2.innerHTML += content2;
    }

    let buttons = document.getElementsByClassName("btn-rdv-medecin");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => {
            ajaxRequest("GET", "/rendezvous/medecin/disponibilites", displayMedecinMeetings, "id=" + buttons[i].previousElementSibling.value);
        })
    }

    let buttons_cancel = document.getElementsByClassName("btn-rdv-cancel");
    for (let i = 0; i < buttons_cancel.length; i++) {
      buttons_cancel[i].addEventListener("click", refreshButtonCancelMeeting);
    }
  });
}

/**
 * Load the html and header for the welcome page
 * @param data
 */
function loadAccueil(data){
  displayPage(data);
  
  document.addEventListener("DOMContentLoaded", function() {
    displayDatas(data);
  }, false);
}
function loadMedecinPage(data){
  displayPage(data)
  hideElementUser(data)
}

//Carefull, as this is a "vaccueil" related function, it should be in a separate js file. This function is currently executed when the right context is not present, thus creating an error
document.addEventListener("DOMContentLoaded", function() {
  ajaxRequest("GET", "/meeting/next", displayNextMeeting);
  ajaxRequest("GET", "/user", displayDatas);
})

//Avoid recursive load of ajax.js hence an epileptic loading page
if (document.getElementById("initialLoad") !== null) {
  ajaxRequest("GET", "/accueil", loadAccueil);
}

//------------------------------------------------------------------------------
//--- Functions for getting a meeting ---------------------------------------------------------------
//------------------------------------------------------------------------------



//------------------------------------------------------------------------------
//--- Page event block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// A list of event listeners that needs to be reloaded each refresh or page redirection
document.getElementById("acButton").addEventListener("click", () => {
    ajaxRequest("GET", "/accueil", loadAccueil);
});
document.getElementById("titleButton").addEventListener("click", () => {
    ajaxRequest("GET", "/accueil", loadAccueil);
});
document.getElementById("esButton").addEventListener("click", () => {
  //TODO Check if user is connected. If not, redirect directly to the vconnectioN.php page to execute the php code. If connected, launch the request below
  ajaxRequest("GET", "/user", isUserConnected);
});
document.getElementById("epButton").addEventListener("click", () => {
    ajaxRequest("GET", "/espacedoc", loadMedecinPage);
});
document.getElementById("disconnect").addEventListener("click", () => {
    ajaxRequest("POST", "/disconnect", onceDisconnected);
});


//------------------------------------------------------------------------------
//------- Function used by eventListeners (used to remove to refresh) ----------
//------------------------------------------------------------------------------
function refreshButtonCancelMeeting() {
  ajaxRequest("GET", "/rendezvous/cancel", checkErrorMessage, "id=" + this.id.slice(-1));
  document.getElementById("tableRow-" + this.id.split("-")[2]).remove();

  let buttons_cancel = document.getElementsByClassName("btn-rdv-cancel");
  for (let i = 0; i < buttons_cancel.length; i++) {
    buttons_cancel[i].addEventListener("click", refreshButtonCancelMeeting);
  }
}