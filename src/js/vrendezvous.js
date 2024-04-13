

function insertSpecialities(data){
    console.log(data);
    let menu = document.getElementById("selectSpe");
    data.forEach((elem) => {
       menu.innerHTML += '<option name="' + elem["type"] +'" value="'+ elem["type"] +'">' + elem["type"] + '</option>'
    });
}

function insertDoctors(data){
    console.log(data)
    data.forEach((elem) => {
        console.log(elem);
    });
    //TODO The searched doctors are correctly returned. Check how to obtain each attributes and the insert them with the corresponding html card
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
    ajaxRequest("POST", "/rendezvous/result", insertDoctors, "specialite="+spe+"&nom="+name);
});


