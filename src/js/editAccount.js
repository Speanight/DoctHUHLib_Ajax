img.onchange = evt => {
    const [file] = img.files
    if (file) {
        pfp.src = URL.createObjectURL(file)
    }
}

function modifyAccount(data) {
    checkErrorMessage(data);
}


document.getElementById("modifyAccount").addEventListener("click", () => {
    const email = document.getElementsByName("email")[0].value;
    const tel = document.getElementsByName("phone")[0].value;
    const password = document.getElementsByName("pass")[0].value;
    const passwordVerify = document.getElementsByName("passVerify")[0].value;
    const image = document.getElementsByName("img")[0].value.split('\\').pop();
    const oldPassword = document.getElementsByName("oldPass")[0].value;

    ajaxRequest("POST", "/account/result", modifyAccount, "phone=" + tel + "&pass=" + password + "&passVerify=" + passwordVerify + "&oldPass=" + oldPassword + "&email=" + email + "&img=" + image, true);
  });