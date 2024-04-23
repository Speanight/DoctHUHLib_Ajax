
//------------------------------------------------------------------------------
//--- onLoad block function---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads immediatly after the DOM is generated
console.log("vmedinjs loaded");
ajaxRequest("GET", "/espacedoc/context", insertContext);
document.getElementById("loadWeek").addEventListener("click", loadWeek);


/**
 * An array used to convert the position of the day in a week to its prefix.
 * As the getDay() method starts from Sunday (Sunday => 0), a negative index is implemented to correct the starting number and allow
 * a more casual display form Monday to Sunday.
 * @type {any[]}
 */
if (!window.dayArray) { //Stored in the global variable window because it is reloaded mutliple time causing a redifinition error otherwise
    window.dayArray = Array(7);
    window.dayArray[-1] = "Dimanche";
    window.dayArray[0] = "Lundi";
    window.dayArray[1] = "Mardi";
    window.dayArray[2] = "Mercredi";
    window.dayArray[3] = "Jeudi";
    window.dayArray[4] = "Vendredi";
    window.dayArray[5] = "Samedi";
    window.dayArray[6] = "Dimanche";
}

//------------------------------------------------------------------------------
//--- eventListener functions---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that adds listener to inserted element such as delete buttons etc...
/**
 * This function apply an event listener to every delete meeting button. On click, it gathers the information of the meeting
 * stored in a hidden input and then sends them to the database for the processing. Refresh the context of the page immediately after
 * to apply the changes to the user's page
 * @returns {void}
 */
function activateDeleteButton(){
    let buttons = Array.from(document.getElementsByClassName("delMeetingButton"))
    buttons.forEach((b) => {
        b.addEventListener("click", () => {
            let selectZoneValue = document.getElementById("selectWeek").value; //used for the persistence of the selected week
            let idDoc = b.parentNode.getElementsByTagName("input")[0].value;
            let idMeeting = b.parentNode.getElementsByTagName("input")[1].value;
            ajaxRequest("POST", "/espacedoc/delete", checkErrorMessage, "idDoc="+idDoc+"&idMeeting="+idMeeting); //Send the delete request
            ajaxRequest("GET", "/espacedoc/context", insertContext, "selectedWeek="+selectZoneValue); //Reload the page context

        });
    });
}

/**
 * This function apply an event listener to every create meeting button. On click, it gathers the information of the meeting
 * stored in a hidden input and then sends them to the database for the processing. Refresh the context of the page immediately after
 * to apply the changes to the user's page
 * @returns {void}
 */
function activateCreateMeetingButton(){
    let buttons = Array.from(document.getElementsByClassName("createMeeting"))
    buttons.forEach((b) => {
        b.addEventListener("click", () => {
            let selectZoneValue = document.getElementById("selectWeek").value; //used for the persistence of the selected week
            let date = b.parentNode.getElementsByTagName("input")[0].value;
            let timeStart = b.parentNode.getElementsByTagName("input")[1].value;
            let timeEnd = b.parentNode.getElementsByTagName("input")[2].value;
            ajaxRequest("POST", "/espacedoc/result", checkErrorMessage, "date="+date+"&timeStart="+timeStart+"&timeEnd="+timeEnd);
            ajaxRequest("GET", "/espacedoc/context", insertContext, "selectedWeek="+selectZoneValue); //Reload the page context
        });
    });
}

//------------------------------------------------------------------------------
//--- Insert functions---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that treat databases result and insert the correct html
/**
 * This function inserts in the page every future week in the <select> tag and the days of the selected week in the <table> agenda.
 * @param {array} weeks - The JSON array containing the future weeks.
 * @param {array} currentWeek - The JSON object reflecting the selected week by the user.
 * @param {number} selectedWeek - The number corresponding to the selected week's value in the select menu (-1 is the default).
 * @returns {void}
 */
function insertWeeks(weeks, currentWeek, selectedWeek){
    let selectZone = document.getElementById("selectWeek");
    selectZone.innerHTML = "";
    weeks.forEach((w, j) => {
        let begin = new Date(w.begin.date)
        let end = new Date(w.end.date)
        let week = `<option value="${j}">${window.dayArray[begin.getDay()-1].slice(0,3)+". "+begin.getDate().toString().padStart(2, '0')+"/"+((begin.getMonth()+1).toString().padStart(2, '0'))+"/"+begin.getFullYear()  + " - "  +  window.dayArray[end.getDay()].slice(0,3)+". "+end.getDate().toString().padStart(2, '0')+"/"+(end.getMonth()+1).toString().padStart(2, '0')+"/"+end.getFullYear()}</option>`
        selectZone.insertAdjacentHTML("beforeend", week);
    });

    //insert the day and the date for each <th> of the tables
    Array.from(document.getElementsByTagName("th")).forEach((elem, j) => {
        let day = new Date(currentWeek.days[j].date);
        elem.innerHTML = window.dayArray[j] + " " +day.getDate().toString().padStart(2, '0') + "/" + (day.getMonth()+1).toString().padStart(2, '0');
    });

    //Retrieve the selected week in the menu
    if(selectedWeek !== -1){
        selectZone.value = selectedWeek;
    }

    //Insert the meeting creation space
    let target = document.getElementById("meetingCreationZone");
    target.innerHTML = ""; //Empty the zone each time it is reloaded
    currentWeek.days.forEach((d) => {
        let day = new Date(d.date);
        console.log(day);
        let opt = `
                <div id="subcontainer">
                        <div class="form-outline mb-4">
                            <input type="text" id="form2Example17" value="${window.dayArray[day.getDay() -1].slice(0,3)+". "+day.getDate().toString().padStart(2, '0')+"/"+((day.getMonth()+1).toString().padStart(2, '0'))+"/"+day.getFullYear()}" class="form-control form-control-sm" name="date" readonly/>
                        </div>
        
                        <div class="form-outline mb-3">
                            <input type="time" id="timeStart"  name="timeStart" class="form-control form-control-sm" />
                        </div>
                        <div class="form-outline mb-4">
                            <input type="time" id="timeEnd"  name="timeEnd" class="form-control form-control-sm" />
                        </div>
                        <button type="submit" class="btn btn-outline-secondary btn-sm createMeeting">Enregistrer</button>
                    </div>
        `
        target.insertAdjacentHTML("beforeend", opt);
    });
    activateCreateMeetingButton();

}

/**
 * This function uses the data retrieved by the ajax request and calls the insert functions to load the context of the page
 * @param {array} data - The JSON array containing the future weeks, the selected week and the meetings of the doctor
 * @returns {void}
 */
function insertContext(data){
    insertWeeks(data["weekArray"], data["currentWeek"], data["selectedWeek"]);
    insertMeetings(data["meetings"]);
}

/**
 * This function preload the week selector with the incoming weeks right after the DOM loading time.
 * @returns {void}
 */
function loadWeek(){
    let weekIndex = document.getElementById("selectWeek").value
    ajaxRequest("GET", "/espacedoc/context", insertContext, "selectedWeek="+weekIndex);
}

/**
 * This function clears the planning when a new context is loaded. i.e: a new week has been selected
 * @returns {void}
 */
function clearCalendar(){
    Array.from(document.getElementsByTagName("tbody")).forEach((elem) => {
        elem.innerHTML = "";
    });
}

/**
 * Load the correct cards and fill them with the information from the meetings array.
 * Then insert them in the DOM and when finished, activate every button to delete its respective meeting
 * @param {array} meetings - JSON array containing every meeting of the user
 * @returns {void}
 */
function insertMeetings(meetings){
    clearCalendar();
    meetings.forEach((m, j) => {
        let begin = new Date(m.beginning);
        let end = new Date(m.ending);
        let timestamp = begin.getHours().toString().padStart(2, '0')+"h"+begin.getMinutes().toString().padStart(2, "0") + " - " + end.getHours().toString().padStart(2, '0')+"h"+end.getMinutes().toString().padStart(2, "0");
        if (m.user != null){ //Non-affected meeting
            let fullName = capitalizeFirstLetter(m.user.name) + " " + m.user.surname;
            var bubble = ` 
                    <tr>
                        <td>
                            <!-- Button trigger modal -->
                            <button type="button" class="colorPatient btn btn-primary" data-toggle="modal" data-target="${"#Modal"+j}">
                                <b><u><p style="color: #FDFBF6">${timestamp}</p></u></b>
                                <b><p>${fullName}</p></b>
                            </button>

                                    <!-- Modal -->
                            <div class="modal fade" id="${"Modal"+j}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Informations complémentaires</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <img
                                                    src="/assets/img/${m.user.picture}"
                                                    alt=""
                                                    style="width: 90px; height: 90px; margin-bottom: 5%"
                                                    class="rounded-circle"
                                            />
                                            <span class="fbContainer"><p class="frontText"> Horaire:</p> <p class="backText">${timestamp}</p></span>
                                            <span class="fbContainer"><p class="frontText"> Patient:</p> <p class="backText">${fullName}</p></span>
                                            <span class="fbContainer"><p class="frontText"> Numéro de téléphone:</p> <p class="backText">${m.user.phone}</p></span>
                                            <span class="fbContainer"><p class="frontText"> Adresse mail:</p> <p class="backText">${m.user.mail}</p></span>
                                        </div>
                                  
                                        <div class="modal-footer">
                                            <div class="d-none">
                                                <input value=${m.medecin.id}>
                                                <input value="${m.id}">
                                            </div>
                                            <button type="button" class="btn btn-danger delMeetingButton" data-dismiss="modal" data-mdb-ripple-init>Supprimer l'horaire</button>
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>`
        }
        else { //Unaffected meeting
            var bubble = `
                  <tr>
                        <td>
                            <button type="button" class="colorFree btn btn-primary" data-toggle="modal" data-target="${"#subModal"+j}">
                                <b><u><p>${timestamp}</p></u></b>
                                <b><p>Libre</p></b>
                            </button

                                    <!-- Modal -->
                            <div class="modal fade" id="${"subModal"+j}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title">Informations complémentaires</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Aucun patient n'a réservé ce créneau</p>
                                        </div>
                                        <div class="modal-footer">
                                            <div class="d-none">
                                                <input value=${m.medecin.id}>
                                                <input value="${m.id}">
                                            </div>
                                            <button type="button" class="btn btn-danger delMeetingButton" data-dismiss="modal" data-mdb-ripple-init>Supprimer l'horaire</button>
                                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fermer</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
            `
        }
        let target = document.getElementById("target"+begin.getDay());
        target.insertAdjacentHTML("beforeend", bubble)
    });
    activateDeleteButton(); //Once all the bubbles have been inserted, activate the delete buttons
}

