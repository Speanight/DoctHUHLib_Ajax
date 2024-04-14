<?php
require_once "utils.php";
require_once "src/dao/DaoUser.php";
require_once "src/dao/DaoSpeciality.php";
require_once "src/dao/DaoMeeting.php";

class cntrlApp {
    public function getAccueil() {
        $cntrlLogin = new cntrlLogin();
        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];
            $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
            $meeting = $daoMeeting->getNextMeeting($user);
            if(isset($meeting)){
                $ajax["meeting"] = $meeting->meetingToArray();
            }
        }
        $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
        $ajax["html"] = file_get_contents(PATH_VIEW . "vaccueil.html");

        print_r(json_encode($ajax));
    }
    public function getRendezVous() {
        if(isset($_SESSION["user"])){
            $user       = $_SESSION['user'];
            $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
            $meetings   = $daoMeeting->getMeetingsOfPatient($user);
            $today      = new DateTime();
            $today->modify("+1 hour");
            $tomorrow   = new DateTime();
            $tomorrow  = $tomorrow->modify('+1 day');

            $pastMeetings   = [];
            $futureMeetings = [];

            foreach ($meetings as $meeting) {
                if ($meeting->get_beginning() < $today) array_push($pastMeetings, $meeting);
                else                                    array_unshift($futureMeetings, $meeting);
            }
            $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
            $ajax["html"] = file_get_contents(PATH_VIEW . "vrendezvous.html");
            print_r(json_encode($ajax));

        }
        else require PATH_VIEW . "vconnection.php";
    }
    public function getDocPage() {

        $DaoTimeslot = new DaoTime(DBHOST, DBNAME, PORT, USER, PASS);
        $DaoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $weekArray = $DaoTimeslot->getFutureWeeks();
        if(isset($_POST["selectedWeek"]) && $_POST["selectedWeek"] != -1){
            $currentWeek = $weekArray[$_POST["selectedWeek"]];
        }
        elseif(isset($_POST["persistWeek"]) && $_POST["persistWeek"] != -1){
            $currentWeek = $weekArray[$_POST["persistWeek"]];
            $_POST["selectedWeek"] = $_POST["persistWeek"];
        }
        else $currentWeek = $weekArray[0];

        $meetings = $DaoMeeting->getMeetingsOfDoctor($_SESSION["user"]);
        if(!isset($utils)){
            $utils = new Utils();
        }
        require PATH_VIEW . "vmedecin.php";
    }
    public function createMeeting(){
        $user = $_SESSION['user'];
        $now = new DateTime();
        $now->modify("+1 hour");
        if ($user->get_speciality() == null) header("Location: /");

        if(!isset($_SESSION)){
            if(session_status() !== PHP_SESSION_ACTIVE){
                session_start();
            }
        }
        $DaoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $utils = new Utils();
        $date = $_POST["date"];
        $ts = $_POST["timeStart"];
        $te = $_POST["timeEnd"];
        if(empty($ts) || empty($te)){
            $utils->echoWarning("Vous devez spécifier un horaire");
            $this->getDocPage();
            return;
        }

        $beg = DateTime::createFromFormat('D. d/m/Y H:i', $date. " ".$ts);
        $end = DateTime::createFromFormat('D. d/m/Y H:i', $date. " ".$te);
        if($beg < $now){
            $utils->echoError("Vous ne pouvez créer de rendez-vous antérieur à aujourd'hui");
            $this->getDocPage();
            return;
        }
        if($beg >= $end){
            $utils->echoError("Cet horaire est incorrect");
            $this->getDocPage();
            return;
        }
        if(!$beg || !$end){
            $utils->echoError("Erreur lors de la création du rendez-vous");
        }
        $isSuccess = $DaoMeeting->insertMeeting($beg, $end, $_SESSION["user"]);
        if($isSuccess){
            $utils->echoSuccess("Rendez-vous enregistré avec succès");
        }
        else {
            $utils->echoError("Cet horaire existe déjà");
        }
        $this->getDocPage();

    }
    public function deleteMeeting(){
        $DaoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $idDoc = $_POST["idDoc"];
        $tbeg = $_POST["tbeg"];
        $DaoMeeting->deleteMeeting($tbeg, $idDoc);
        $this->getDocPage();
    }

    public function getMedecin(){
        $DaoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $utils = new Utils();
        $specialite = $_GET["specialite"];
        $nom = $_GET["nom"];

        if(!empty($nom) && !($utils->isSanitize($nom))){
            $ajax["message"] = $utils->echoWarning("Le champ de recherche ne peut contenir ni caractères spéciaux ni accents");
            print_r(json_encode($ajax));
            return;
        }

        if(!empty($nom)){
            $nom = explode(" ", $nom); //Array that separates the name from the surname. [0] => surname, [1] => name
            if(isset($nom[1])){ //The user inputed a name and a surname
                $users = $DaoUser->getByUserSpe($nom[0], $nom[1], $specialite);
                print_r(json_encode($users)); //The getByUserSpe() function is somewhat called two times when the result is printed inside it's prototype. So i manually print each time the doc array
            }
            else{ //Tests each name and surname in cas the user inputed only one thing
                $u1 = $DaoUser->getByUserSpe(" ", $nom[0], $specialite);
                $u2 = $DaoUser->getByUserSpe($nom[0], " ", $specialite);
                if(!empty($u1)){
                    $users = $u1;
                    print_r(json_encode($users));
                }
                else if (!empty($u2)){
                    $users = $u2;
                    print_r(json_encode($users));
                }
                elseif($specialite == "Sélectionner la spécialité"){
                    $ajax["message"] = $utils->echoInfo("Veuillez sélectionner une spécialité");
                    print_r(json_encode($ajax));
                }
            }
        }

        else {
            if(empty($nom)) {
                $users = $DaoUser->getByUserSpe(" ", " ", $specialite);
                if(empty($users)) { // Check if $users is empty
                    $ajax["message"] = $utils->echoInfo("Aucun praticien trouvé");
                    print_r(json_encode($ajax));
                } else {
                    print_r(json_encode($users));
                }
            }
        }


        $user = $_SESSION['user'];
        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $meetings   = $daoMeeting->getMeetingsOfPatient($user);
        $today      = new DateTime();
        $today->modify("+1 hour");
        $tomorrow   = new DateTime();
        $tomorrow  = $tomorrow->modify('+1 day');

        $pastMeetings   = [];
        $futureMeetings = [];

        foreach ($meetings as $meeting) {
            if ($meeting->get_beginning() < $today) array_push($pastMeetings, $meeting);
            else                                    array_push($futureMeetings, $meeting);
        }
        //TODO If needed (cause the upper section it a duplicata of a bit of code already executed, see getRendezVous() wich already loads the meetings), echo the pastMeetings and futureMeetings array ton insert them later with js.
    }

    public function dispoMedecin() {
        $user = $_SESSION['user'];
        $alerts = [];
        $daoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);

        $idMedecin = $_POST['idMedecin'];

        $medecin = $daoUser->getFullById($idMedecin);
        $meetings = $daoMeeting->getMeetingsOfDoctor($medecin);
        $orderedMeetings = [];
        $today = new DateTime();
        $today->modify("+1 hour");

        foreach ($meetings as $meeting) {
            if ($meeting->get_beginning() > $today) {
                $day = $meeting->get_beginning()->format('D d/m Y');
                if (!isset($orderedMeetings[$day])) $orderedMeetings[$day] = [];
                array_push($orderedMeetings[$day], $meeting);
            }
        }
        $medecin->set_meetings($orderedMeetings);

        require PATH_VIEW . "vhorairesMedecin.php";
    }

    public function userReservation() {
        $alerts = [];
        $user = $_SESSION['user'];
        $idMeeting = $_POST['idMeeting'];

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $utils      = new Utils();

        $meeting = $daoMeeting->getMeetingById($idMeeting);

        if ($meeting->get_user() == null) {
            $daoMeeting->setUserOfMeeting($meeting, $user);
            $utils->echoSuccess("Votre rendez-vous a bien été ajouté");
        }
        else {
            $utils->echoError("Votre rendez-vous n'a pas pu être réservé");
        }

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $meetings   = $daoMeeting->getMeetingsOfPatient($user);
        $today      = new DateTime();
        $today->modify("+1 hour");
        $tomorrow   = new DateTime();
        $tomorrow  = $tomorrow->modify('+1 day');

        $pastMeetings   = [];
        $futureMeetings = [];

        foreach ($meetings as $meeting) {
            if ($meeting->get_beginning() < $today) array_push($pastMeetings, $meeting);
            else                                    array_push($futureMeetings, $meeting);
        }

        require PATH_VIEW . "vrendezvous.php";
    }

    public function getPastMeetings() {
        $alerts = [];
        $user = $_SESSION['user'];

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);

        $yesterday = new DateTime();
        $yesterday = $yesterday->modify('-1 day');
        $meetings = $daoMeeting->getMeetingsOfPatient($user);

        require PATH_VIEW . "vpastmeetings.php";
    }

    public function getCancelMeeting() {
        $alerts = [];
        $user = $_SESSION['user'];
        $meetingId = $_POST['idMeeting'];

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $utils = new Utils();

        $meet = $daoMeeting->getMeetingById($meetingId);
        $daoMeeting->cancelMeetingOfPatient($user, $meet);
        
        $yesterday = new DateTime();
        $yesterday = $yesterday->modify('-1 day');

        $utils->echoSuccess("Votre rendez-vous a bien été annulé");

        $meetings = $daoMeeting->getMeetingsOfPatient($user);

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $meetings   = $daoMeeting->getMeetingsOfPatient($user);
        $today      = new DateTime();
        $today->modify("+1 hour");
        $tomorrow   = new DateTime();
        $tomorrow  = $tomorrow->modify('+1 day');

        $pastMeetings   = [];
        $futureMeetings = [];

        foreach ($meetings as $meeting) {
            if ($meeting->get_beginning() < $today) array_push($pastMeetings, $meeting);
            else                                    array_push($futureMeetings, $meeting);
        }

        require PATH_VIEW . "vrendezvous.php";
    }


    public function getNextMeeting() {
        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $user = $_SESSION['user'];

        print_r(json_encode($daoMeeting->getNextMeeting($user)));
    }

    public function getSpecialities(){
    $daoSpeciality = new DaoSpeciality(DBHOST, DBNAME, PORT, USER, PASS);


    print_r(json_encode($daoSpeciality->getSpeciality()));
    }
}