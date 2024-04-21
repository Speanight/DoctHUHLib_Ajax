let dayArray = Array(7);
dayArray[0] = "Lundi"
dayArray[1] = "Mardi"
dayArray[2] = "Mercredi"
dayArray[3] = "Jeudi"
dayArray[4] = "Vendredi"
dayArray[5] = "Samedi"
dayArray[6] = "Dimanche"
//------------------------------------------------------------------------------
//--- Insert functions---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that treat databases result and insert the correct html
/**
 * This function inserts in the page every future week in the <select> tag and the days of the selected week in the <table> agenda
 * @param {array} weeks - The JSON array containing the future weeks
 * @param {array} currentWeek - The JSON object reflecting the selected week by the user
 * @returns {void}
 */
function insertWeeks(weeks, currentWeek){
    let selectZone = document.getElementById("selectWeek");
    selectZone.innerHTML = "";
    weeks.forEach((w, j) => {
        let begin = new Date(w.begin.date)
        let end = new Date(w.end.date)
        let week = `<option value="${j}">${dayArray[begin.getDay()-1].slice(0,3)+". "+begin.getDate().toString().padStart(2, '0')+"/"+((begin.getMonth()+1).toString().padStart(2, '0'))+"/"+begin.getFullYear()  + " - "  +  dayArray[end.getDay()].slice(0,3)+". "+end.getDate().toString().padStart(2, '0')+"/"+(end.getMonth()+1).toString().padStart(2, '0')+"/"+end.getFullYear()}</option>`
        selectZone.insertAdjacentHTML("beforeend", week);
    });

    //insert the day and the date for each <th> of the tables
    Array.from(document.getElementsByTagName("th")).forEach((elem, j) => {
        let day = new Date(currentWeek.days[j].date);
        elem.innerHTML = dayArray[j] + " " +day.getDate().toString().padStart(2, '0') + "/" + (day.getMonth()+1).toString().padStart(2, '0');
    });
}

/**
 * This function uses the data retrieved by the ajax request and calls the insert functions to load the context of the page
 * @param {array} data - The JSON array containing the future weeks, the selected week and the meetings of the doctor
 * @returns {void}
 */
function insertContext(data){
    insertWeeks(data["weekArray"], data["currentWeek"]);
    insertMeetings(data["meetings"]);
    //TODO Continue this function to insert the planning and the inputs to insert timeslots
    //TODO Change the deleteMeeting to allow a user to only deletes his own meetings (use userId=1&meetingId=62)
}

function loadWeek(){
    let weekIndex = document.getElementById("selectWeek").value
    ajaxRequest("GET", "/espacedoc/context", insertContext, "selectedWeek="+weekIndex);
}

function clearCalendar(){
    Array.from(document.getElementsByTagName("tbody")).forEach((elem) => {
        elem.innerHTML = "";
    });
}

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
                                            <button type="button" class="btn btn-danger" data-mdb-ripple-init>Supprimer l'horaire</button>
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
                                            <button type="button" class="btn btn-danger" data-mdb-ripple-init>Supprimer l'horaire</button>
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
}

//------------------------------------------------------------------------------
//--- onLoad block function---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads immediatly after the DOM is generated
document.addEventListener("DOMContentLoaded", () => {
   ajaxRequest("GET", "/espacedoc/context", insertContext);
   document.getElementById("loadWeek").addEventListener("click", loadWeek);
});

