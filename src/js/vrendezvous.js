
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
            printDoctors(elem.name, elem.surname, elem.picture, elem.speciality.type, elem.phone, elem.mail, elem.place.name, elem.place.num_street, elem.place.street, elem.place.city.code_postal, elem.place.city.city)
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