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
function insertWeeks(weeks, currentWeek){
    let selectZone = document.getElementById("selectWeek");
    weeks.forEach((w, j) => {
        let begin = new Date(w.begin.date)
        let end = new Date(w.end.date)
        let week = `<option value="${j}">${dayArray[begin.getDay()-1].slice(0,3)+". "+begin.getDate().toString().padStart(2, '0')+"/"+((begin.getMonth()+1).toString().padStart(2, '0'))+"/"+begin.getFullYear()  + " - "  +  dayArray[end.getDay()].slice(0,3)+". "+end.getDate().toString().padStart(2, '0')+"/"+(end.getMonth()+1).toString().padStart(2, '0')+"/"+end.getFullYear()}</option>`
        selectZone.insertAdjacentHTML("beforeend", week);
    });

    //insert the day and the date for each th of the tables
    Array.from(document.getElementsByTagName("th")).forEach((elem, j) => {
        let day = new Date(currentWeek.days[j].date);
        elem.innerHTML = dayArray[j] + " " +day.getDate().toString().padStart(2, '0') + "/" + (day.getMonth()+1).toString().padStart(2, '0');
    });
}

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

function insertMeetings(meetings){

}

//------------------------------------------------------------------------------
//--- onLoad block function---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads immediatly after the DOM is generated
document.addEventListener("DOMContentLoaded", () => {
   ajaxRequest("GET", "/espacedoc/context", insertContext);
   document.getElementById("loadWeek").addEventListener("click", loadWeek);
});

