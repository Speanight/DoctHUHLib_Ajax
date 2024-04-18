//------------------------------------------------------------------------------
//--- onLoad block function---------------------------------------------------------------
//------------------------------------------------------------------------------
// List of functions that loads immediatly after the DOM is generated
function insertWeeks(weeks){
    let selectZone = document.getElementById("selectWeek");
    //TODO Insert the week options in the array
    weeks.forEach((w, j) => {
        let begin = w.begin.date
        let week = `<option value="${j+1}"><!--= $w->getBegin()->format('D. d/m/Y'). " - " . $w->getEnd()->format('D. d/m/Y')--></option>`

    });
}

function insertContext(data){
    insertWeeks(data["weekArray"]);
    //TODO Continue this function to insert the planning and the inputs to insert timeslots
}

document.addEventListener("DOMContentLoaded", () => {
   ajaxRequest("GET", "/espacedoc/context", insertContext);
});