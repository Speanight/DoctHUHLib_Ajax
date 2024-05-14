<?php
require_once "utils.php";
require_once "src/dao/DaoUser.php";
require_once "src/dao/DaoSpeciality.php";
require_once "src/appli/cntrlApp.php";
class  cntrlLogin {
    /*
    Contrôleur possédant toutes les pages en lien avec l'enregistrement et
    la connexion.
    */
    public function getConnectionForm() : void {
        if(session_status() !== PHP_SESSION_ACTIVE){
            session_start();
        }
        if (isset($_SESSION['user'])) {
            $utils = new Utils();
            echo $utils->echoInfo("Vous êtes déjà connecté ! Redirection sur l'accueil");
            // TODO: relocate to accueil
        }
        else {
            require PATH_VIEW . "vconnection.php";
        }
    }

    public function getDocConnectionForm() : void{
        require PATH_VIEW . "vmconnection.php";
    }

    public function getLoginResult() :void {
        $utils = new Utils();
        $mail       = $_POST['mail'];
        $password   = $_POST['password'];
        $daoUser    = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $id = $daoUser->connectUser($mail, $password);

        if ($id == NULL) {
            $needle = "L'adresse email ou le mot de passe renseigné est incorrect";
            echo $utils->echoError($needle);
            require PATH_VIEW . "vconnection.php";

        }
        else {
            $utils->constructSession($id);
            header("Location: ". 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}"); //Sanitize the HTTP_ value in sg $_SERVER
            //echo $utils->echoSuccess("Vous êtes connecté"); Not working because the header have been relocated
        }
    }

    public function getRegisterResult() : void {
        $DaoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $name = $surname = $phone = $mail = $mailVerify = $password = $passwordVerify = "";
        $utils = new Utils();
        $alerts = [];

        $name           = $_POST['name'];
        $surname        = $_POST['surname'];
        $phone          = $_POST['phone'];
        $mail           = $_POST['mail'];
        $mailVerify     = $_POST['mailVerify'];
        $password       = $_POST['password'];
        $passwordVerify = $_POST['passwordVerify'];

        $phone = str_replace(' ', '', $phone);
        if($utils->hasLetters($phone)){
            echo $utils->echoWarning("Un numéro de téléphone ne peut contenir de lettres");
            require PATH_VIEW . "vconnection.php";
            return;
        }
        if(strlen($phone) != 10){
            echo $utils->echoWarning("Veuillez saisir un numéro de téléphone français");
            require PATH_VIEW . "vconnection.php";
            return;
        }
        if(!$utils->isSanitize($name) || !$utils->isSanitize($surname)){
            echo $utils->echoWarning("Le nom et prénom ne peuvent contenir ni caractères spéciaux ni accents");
            require PATH_VIEW . "vconnection.php";
            return;
        }
        if($mail !== $mailVerify){
            echo $utils->echoWarning("La deuxième adresse mail ne correspond pas à la première");
            require PATH_VIEW . "vconnection.php";
            return;
        }
        if($password !== $passwordVerify){
            echo $utils->echoWarning("Le deuxième mot de passe ne correspond pas au premier");
            require PATH_VIEW . "vconnection.php";
            return;
        }
        else{
            $daoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
            $hashedPass = password_hash($password, PASSWORD_BCRYPT);
            $errString = $daoUser->registerUser($name, $surname, $phone, $mail, $hashedPass); //returns a string containing the appropriate warning message if a PDOException is catched. Empty if sucess
        }

        if(empty($errString)){ //No errors, account created, start session and redirect on rendez-vous page
            $id = $DaoUser->connectUser($mail, $password);
            $utils->constructSession($id);
            echo $utils->echoSuccess("Votre compte a bien été créé.");
            $utils->clearAlert();
            header("Location: ". 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}"); //Sanitize the HTTP_ value in sg $_SERVER

        }
        else{ //error, appen error message and reload the page
            echo $utils->echoError($errString);
            $utils->clearAlert();
            require  PATH_VIEW . "vconnection.php";

        }
    }

    public function getAccountEdit() {
        $ajax   = [];
        $alerts = [];
        $daoUser        = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $daoSpeciality  = new DaoSpeciality(DBHOST, DBNAME, PORT, USER, PASS);

        if(session_status() !== PHP_SESSION_ACTIVE){
            session_start();
        }
        $user = null;
        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];
            unset($_SESSION['user']);
            $user = $daoUser->getFullById($user->get_id());
            $_SESSION['user'] = $user;
        }

        $specialities = $daoSpeciality->getSpecialities();
        $img_account = "/assets/img/";

        if ($user != null)  $ajax["user"] = $user->userToArray();
        else                $ajax["user"] = null;
        $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
        $ajax["html"] = file_get_contents(PATH_VIEW . "vaccount.html");

        print_r(json_encode($ajax));
        // require_once PATH_VIEW . "vaccount.php";
    }

    public function getAccountEditResult() : void {
        $phone = $_POST['phone'];
        $phone = str_replace(' ', '', $phone);
        $newPass = $_POST['pass'];
        $newPassConf = $_POST['passVerify'];
        $oldPass = trim($_POST['oldPass']);
        $user = $_SESSION['user'];
        $email = $_POST['email'];
        
        $utils      = new Utils();
        $daoUser    = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);

        if($utils->hasLetters($phone)){
            echo $utils->echoWarning("Un numéro de téléphone ne peut contenir de lettres");
            $this->getAccountEdit();
            return;
        }
        if(strlen($phone) != 10){
            echo $utils->echoInfo("Veuillez saisir un numéro de téléphone français");
            $this->getAccountEdit();
            return;
        }
        if ($newPass != $newPassConf) {
            echo $utils->echoError("Les nouveaux mots de passe ne correspondent pas");
        }
        else {
            $photo = null;
            $pfpResult = $utils->savePicture($user->get_id(), "img", "assets/img/");
            if ($pfpResult[1] == true)  $photo = $pfpResult[0];
            $result = $daoUser->getEditUser($user, $email, $phone, $photo, $oldPass, $newPass);
        }
        if ($result == null) {
            echo $utils->echoError("Votre ancien mot de passe est incorrect");
        }
        echo $utils->echoSuccess("Vos informations ont été mises à jour");
        $this->getAccountEdit();
    }

    public function getRegisterDocResult() : void {
        $DaoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $DaoCity = new DaoCity(DBHOST, DBNAME, PORT, USER, PASS);
        $cntrlApp = new cntrlApp();
        $name = $surname = $phone = $mail = $mailVerify = $password = $passwordVerify = "";
        $utils = new Utils();
        $name           = $_POST['name'];
        $surname        = $_POST['surname'];
        $phone          = $_POST['phone'];
        $mail           = $_POST['mail'];
        $password       = $_POST['password'];
        $passwordVerify = $_POST['passwordVerify'];
        $idPraticien = $_POST['id_p'];
        $numStreet = $_POST['num'];
        $street = $_POST['street'];
        $namePlace = $_POST['name_e'];
        $specialite = $_POST['specialite'];

        $city =  strtolower($_POST['city']);
        $city = str_replace("\'", " ", $city);
        $city = str_replace("-", " ", $city);
        $city = str_replace("saint", "st", $city);
        $codeInseeResult = $DaoCity->getCodeInsee($city);
        $codeInsee = $codeInseeResult["code_insee"];

        if(empty($password)){
            echo $utils->echoWarning("Veuillez saisir un mot de passe"),
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        if(empty($mail)){
            echo $utils->echoWarning("Veuillez saisir un email"),
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        if($codeInsee == -1){
            echo $utils->echoWarning("Cette ville n'existe pas");
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        $phone = str_replace(' ', '', $phone);
        if($utils->hasLetters($phone)){
            echo $utils->echoWarning("Un numéro de téléphone ne peut contenir de lettres");
            require PATH_VIEW . "vmconnection.php";
        }
        if(strlen($phone) != 10){
            echo $utils->echoWarning("Veuillez saisir un numéro de téléphone français");
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        if(!$utils->isSanitize($name) || !$utils->isSanitize($surname)){
            echo $utils->echoWarning("Le nom et prénom ne peuvent contenir ni caractères spéciaux ni accents");
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        if(!$utils->isSanitize($street)){
            echo $utils->echoWarning("Le nom de rue ne peut contenir de caractères spéciaux");
            require PATH_VIEW . "vmconnection.php";
            return;
        }
        if(!$utils->isSanitize($namePlace)){
            echo $utils->echoWarning("Le nom d'établissement ne peut contenir de caractères spéciaux");
            require PATH_VIEW . "vmconnection.php";
            return;
        }

        if($password !== $passwordVerify){
            echo $utils->echoWarning("Le deuxième mot de passe ne correspond pas au premier");
            require PATH_VIEW . "vmconnection.php";
            return;
        }

        else{
            $daoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
            $hashedPass = password_hash($password, PASSWORD_BCRYPT);
            $errString = $daoUser->registerDoc($name, $surname, $phone, $mail, $hashedPass, $numStreet, $street, $codeInsee, $namePlace, $specialite); //returns a string containing the appropriate warning message if a PDOException is catched. Empty if sucess
        }

        if(empty($errString)){ //No errors, account created, start session and redirect on rendez-vous page
            $id = $DaoUser->connectUser($mail, $password);
            $utils->constructSession($id);
            header("Location: ". 'http' . (isset($_SERVER['HTTPS']) ? 's' : '') . '://' . "{$_SERVER['HTTP_HOST']}"); //Sanitize the HTTP_ value in sg $_SERVER and relocate to the root document
        }
        else{ //error, appen error message and reload the page
            echo $utils->echoError($errString);
            $utils->clearAlert();
            require  PATH_VIEW . "vmconnection.php";
        }
    }

    public function getUser() : ?array {
        $ajax   = [];
        $daoUser        = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $daoSpeciality  = new DaoSpeciality(DBHOST, DBNAME, PORT, USER, PASS);

        $user = null;
        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];
            unset($_SESSION['user']);
            $user = $daoUser->getFullById($user->get_id());
            $_SESSION['user'] = $user;
        }

        $specialities = $daoSpeciality->getSpecialities();
        $img_account = "/assets/img/";

        if ($user != null)  $ajax["user"] = $user->userToArray();
        else                $ajax["user"] = null;

        print_r(json_encode($ajax));
        return $ajax["user"];
    }
}