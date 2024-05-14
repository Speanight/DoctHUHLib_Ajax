
function insertSpecialities(data){
    console.log(data);
    let menu = document.getElementById("selectSpe");
    data.forEach((elem) => {
       menu.innerHTML += '<option name="' + elem["type"] +'" value="'+ elem["type"] +'">' + elem["type"] + '</option>'
    });
}

//TODO Hide the HTML table when no doctor is found
function insertDoctors(data){
    document.getElementById("cardZone").innerHTML = ""; //Empty the card for each new request
    if(checkErrorMessage(data)){
        document.getElementById("baseTable").classList.add("d-none"); //Hide the base table when no doctor is found
    }
    else {
        document.getElementById("baseTable").classList.remove("d-none"); //Show the table where the doctor's card will be inserted
        data.forEach((elem) => {
            printDoctors(elem.id, elem.name, elem.surname, elem.picture, elem.speciality.type, elem.phone, elem.mail, elem.place.name, elem.place.num_street, elem.place.street, elem.place.city.code_postal, elem.place.city.city)
        });
    }

    let buttons = document.getElementsByClassName("btn-rdv-medecin");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => {
            ajaxRequest("GET", "/rendezvous/medecin/disponibilites", displayMedecinMeetings, "id=" + buttons[i].previousElementSibling.value);
        })
    }
}

function printDoctors(id, name, surname, picture, speciality, phone, mail, facilityName, streetNumber, street, postalCode, cityName){
    let cardZone = document.getElementById("cardZone");
    let fullName = capitalizeFirstLetter(name) + " " + surname.toUpperCase();
    let fullStreet = streetNumber + " " + capitalizeFirstLetter(street)
    let fullCity = postalCode + " " + capitalizeFirstLetter(cityName);

    let card = `         <tr>
        <td>
            <div class="d-flex align-items-center">
                <img
                    src="/assets/img/${picture}"
                    alt=""
                    style="width: 45px; height: 45px"
                    class="rounded-circle"
                />
                <div class="ms-3">
                    <p class="fw-bold mb-1">${fullName}</p>
                    <p class="text-muted mb-0">${mail}</p>
                </div>
            </div>
        </td>
        <td>
            <p class="fw-normal mb-1">${speciality}</p>
        </td>
        <td>
            ${phone}
        </td>
        <td>
            <p class="fw-normal mb-1">${facilityName}</p>
            <p class="fw-normal mb-0">${fullStreet}</p>
            <p class="text-muted mb-0">${fullCity}</p>
        </td>
        <td>
            <input type="text" name="idMedecin" value="${id}" hidden>
            <button type="submit" class="btn btn-primary btn-rdv-medecin">Prendre rendez-vous</button>
        </td>
    </tr> `

    cardZone.innerHTML += card;
}



//------------------------------------------------------------------------------
//--- onLoad block function---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads immediatly after the DOM is generated
document.addEventListener("DOMContentLoaded", () => {
    ajaxRequest("GET", "/specialities", insertSpecialities);
});

document.getElementById("searchDoc").addEventListener("click", () => {
    let spe = document.getElementById("selectSpe").value;
    let name = document.getElementById("inputName").value;
    ajaxRequest("GET", "/rendezvous/result", insertDoctors, "specialite="+spe+"&nom="+name);
});


//------------------------------------------------------------------------------
//------------------- Functions used to display meetings -----------------------
//------------------------------------------------------------------------------
function displayMeetingsToUser(data) {
    let meetings = data["medecin"]["meetings"];
    for (const day in meetings) {
        printMeetingInList(day, meetings[day]);
      }
  
    // Make the buttons word and book a meeting.
    let buttons = document.getElementsByClassName("reserve-meeting");
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].removeEventListener("click", bookMeetingButton);
      buttons[i].addEventListener("click", bookMeetingButton);
    }
}

function reserveMeetingResult(data) {
    checkErrorMessage(data);
    if ("success" in data) {
        let button = document.getElementById("reserve-button-" + data["success"])
        button.classList = "btn btn-warning";
        button.innerHTML = "Votre horaire";

        let buttons = document.getElementsByClassName("reserve-meeting");
        for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", bookMeetingButton);
        }
    }
}

function printMeetingInList(day, meetings) {
    let elementArea = document.getElementById("meetings-area");
    let today = new Date();
    let dayParsed = new Date(day);
    let planning = `<h1>${dayParsed.toDateString()}</h1>
    <table class="table">
        <thead>
        <tr>
        <th scope="col">Début</th>
        <th scope="col">Fin</th>
        <th scope="col"></th>
        </tr>
        </thead>
        <tbody>`
    for(const meeting of meetings) {
        const beginning = meeting.beginning.date.split(" ")[1].substring(0, 5);
        const ending = meeting.ending.date.split(" ")[1].substring(0, 5);
        const meetingDate = new Date(day+ " " +beginning);
        console.log("day vs beginiing");
        console.log(meetingDate + "\<beg  today\>" + today);
        if(meetingDate > today){
                    planning += `
                <tr>
                <td>${beginning}</td>
                <td>${ending}</td>
                <td>
                `
                    if (meeting.user == null) {
                        planning += `
                <button class="btn btn-primary reserve-meeting" id="reserve-button-${meeting.id}">Réserver</button>`
                    }
                    else {
                        planning += `
                <button class="btn btn-danger" id="reserve-button-${meeting.id}">Occupé</button>
                `
                    }

                }
    }
    planning += `</td>`
    elementArea.innerHTML += planning;
}


/**
 * Collects an array of meetings and returns them in the form of an array. Mainly used
 * for the page "Espace santé" if there is any meeting that meets the requirements.
 * - The function will automatically add (or not) the cancel button depending on the date.
 * @param {array} meetings 
 * @returns string - contains a table with all the arrays.
 */
function showMeetingsInTable(meetings) {
    let content = `
    <table class="table">
    <thead>
    <tr>
        <th scope="col">Date</th>
        <th scope="col">Plage horaire</th>
        <th scope="col">Médecin</th>
        <th scope="col">Spécialité</th>
        <th scope="col" class="text-center">Actions</th>
    </tr>
    </thead>
    <tbody>
    `
  
    let today = new Date();
    let tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  
    for (let i = 0; i < meetings.length; i++) {
      let date = new Date(meetings[i].beginning.date);
      content += `
      <tr id="tableRow-${meetings[i].id}">
          <td>${meetings[i].beginning.date.split(" ")[0]}</td>
          <td>${meetings[i].beginning.date.split(" ")[1].split(".")[0].substring(0, 5)} - ${meetings[i].ending.date.split(" ")[1].split(".")[0].substring(0, 5)}</td>
          <td>${meetings[i].medecin.surname} ${meetings[i].medecin.name}</td>
          <td>${meetings[i].medecin.speciality.type}</td>
          <td class="d-flex flex-row justify-content-around">
              <input type="text" name="idMedecin" value="${meetings[i].medecin.id}" hidden />
              <button type="submit" class="btn btn-info btn-rdv-medecin">Réserver un autre RDV</button>
      `
      if (date >= tomorrow) {
        content += `
          <button type="submit" class="btn btn-danger btn-rdv-cancel" id="cancel-button-${meetings[i].id}">Annuler</button>
        `
      }
      else if (date >= today) {
        content += `
          <button type="submit" class="btn btn-danger" title="Vous ne pouvez annuler un rendez-vous que 24h en avance" disabled>Annuler</button>
        `
      }
  
      content += `
          </td>
        </tr>
      `
    }
  
    content += `
        </tbody>
      </table>
    `
  
    return content;
  }


  
//------------------------------------------------------------------------------
//------- Function used by eventListeners (used to remove to refresh) ----------
//------------------------------------------------------------------------------
function bookMeetingButton() {
    ajaxRequest("POST", "/rendezvous/medecin/reserver", reserveMeetingResult, "id=" + this.id.split("-")[2]);
}