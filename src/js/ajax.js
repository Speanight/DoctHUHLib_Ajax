//------------------------------------------------------------------------------
//--- ajaxRequest --------------------------------------------------------------
//------------------------------------------------------------------------------
// Perform an Ajax request.
// \param type The type of the request (GET, DELETE, POST, PUT).
// \param url The url with the data.
// \param callback The callback to call where the request is successful.
// \param data The data associated with the request.
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

//------------------------------------------------------------------------------
//--- Page event redirection block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// Call the correct function to load the clicked page
document.getElementById("acButton").addEventListener("click", ajaxRequest("GET", "/accueil", loadAccueil));
document.getElementById("titleButton").addEventListener("click", loadAccueil)
document.getElementById("esButton").addEventListener("click", loadSantePage)
document.getElementById("epButton").addEventListener("click", loadMedecinPage)

function displayPage(data) { //Group header+footer and load the user datas
  let page = data["header"] + data["html"];
  let user = data["user"];
  console.log(user);
  document.open();
  document.write(page);
  document.close();

  hideElementUser(data); //hide the corresponding elements
}

function hideElementUser(data) {
  user = data["user"];

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
    if (user["place"] === undefined) {
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
//--- Loading page block ---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads the corresponding page
function loadSantePage(data){

}

//TODO Fixer la fonciton loadAccueil. Le problème est que la page d'acceuil et la page par défaut !! Il faut donc créer une page index.html qui contient la page accueil
function loadAccueil(data){
  console.log(data);
  displayPage(data);
}

function loadMedecinPage(data){

}

ajaxRequest("GET", "/user", hideElementUser);
ajaxRequest("GET", "/accueil", loadAccueil);
console.log("prout");