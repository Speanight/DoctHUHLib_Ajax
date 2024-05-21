<?php
require_once "utils.php";
require_once "src/dao/DaoUser.php";
require_once "src/dao/DaoSpeciality.php";
require_once "src/dao/DaoMeeting.php";

class cntrlApp {
    /**
     * Returns the header and html of the welcome page "vaccueil.html".
     * @return void
     */
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

    /**
     * Returns the header and html of the doctor managing page "vmedecin.html".
     * @return void
     */
    public function getDocPage() : void {
        $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
        $ajax["html"] = file_get_contents(PATH_VIEW . "vmedecin.html");
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
                if ($meeting->get_beginning() < $today) array_push($pastMeetings, $meeting->meetingToArray());
                else                                    array_unshift($futureMeetings, $meeting->meetingToArray());
            }
            $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
            $ajax["html"] = file_get_contents(PATH_VIEW . "vrendezvous.html");
            if (sizeof($futureMeetings) > 0)    $ajax["futureMeetings"] = $futureMeetings;
            if (sizeof($pastMeetings) > 0)      $ajax["pastMeetings"] = $pastMeetings;
            print_r(json_encode($ajax));

        }
        else require PATH_VIEW . "vconnection.php"; // TODO: fix - Pas de require en AJAX!
    }

    /**
     * This function gathers the week selected by the user (current in time week if not specified), the meetings of the user connected,
     * and the incoming weeks.
     * @return void
     */
    public function getDocPlanning() {
        $DaoTimeslot = new DaoTime(DBHOST, DBNAME, PORT, USER, PASS);
        $DaoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $weekArray = $DaoTimeslot->getFutureWeeks();
        if(isset($_GET["selectedWeek"]) && $_GET["selectedWeek"] != -1){
            $currentWeek = $weekArray[$_GET["selectedWeek"]];
            $ajax["selectedWeek"] = $_GET["selectedWeek"]; //persistence of the selected week
        }
        else{
            $currentWeek = $weekArray[0];
            $ajax["selectedWeek"] = -1;
        }

        $meetings = $DaoMeeting->getMeetingsOfDoctor($_SESSION["user"], $currentWeek);
        foreach($meetings as &$m){
            $m = $m->meetingToArray();
        }
        if(!isset($utils)){
            $utils = new Utils();
        }
        foreach($weekArray as &$w){
            $w = $w->weekToArray();
        }
        $ajax["currentWeek"] = $currentWeek->weekToArray();
        $ajax["meetings"] = $meetings;
        $ajax["weekArray"] = $weekArray;
        print_r(json_encode($ajax));
    }

    /**
     * This function gathers the date, beginning and ending of the metting to create, checks different scenarios and ultimatly insert
     * the meeting in the database if every field is correct
     * @return void
     */
    public function createMeeting() : void{
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
        $date = substr($date, 5); //Specific parsing to remove the day prefix because it's specific to the system language allowing
                                        //the date creation to be independent of the user system
        $ts = $_POST["timeStart"];
        $te = $_POST["timeEnd"];

        if(empty($ts) || empty($te)){
            $ajax["message"] = $utils->echoWarning("Vous devez spécifier un horaire");
            print_r(json_encode($ajax));
            return;
        }

        $beg = DateTime::createFromFormat('d/m/Y H:i', $date. " ".$ts);
        $end = DateTime::createFromFormat('d/m/Y H:i', $date. " ".$te);
        if($beg < $now){
            $ajax["message"] = $utils->echoError("Vous ne pouvez créer de rendez-vous antérieur à aujourd'hui");
            print_r(json_encode($ajax));
            return;

        }
        if($beg >= $end){
            $ajax["message"] = $utils->echoError("Cet horaire est incorrect");
            print_r(json_encode($ajax));
            return;
        }
        if(!$beg || !$end){
            $ajax["message"] = $utils->echoError("Erreur lors de la création du rendez-vous");
            print_r(json_encode($ajax));
            return;
        }
        $isSuccess = $DaoMeeting->insertMeeting($beg, $end, $_SESSION["user"]);
        if($isSuccess){
            $ajax["message"] = $utils->echoSuccess("Rendez-vous enregistré avec succès");
            print_r(json_encode($ajax));
        }
        else {
            $ajax["message"] = $utils->echoError("Cet horaire existe déjà");
            print_r(json_encode($ajax));
        }
    }

    /**
     * This function gathers the id of the meeting to delete and then deletes it from the database if the user who
     * threw the call is the correct-connected user
     * @return void
     */
    public function deleteMeeting() : void{
        parse_str(file_get_contents('php://input'), $_DELETE);
        $utils = new Utils();
        $user = $_SESSION["user"];
        $idDoc = $_DELETE["idDoc"];
        if($idDoc != $user->get_id()){ //Malicious user tried to craft a request to delete a non-propretary meeting
            $ajax["message"] = $utils->echoError("Vous n'êtes pas autorisé à faire ceci");
            print_r(json_encode($ajax));
            return;
        }
        $DaoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $idMeeting = $_DELETE["idMeeting"];
        $DaoMeeting->deleteMeeting($idMeeting, $idDoc);
    }

    /**
     * This function gather the name, surname and speciality searched and then checks each combinaison of [^name]/[^surname].
     * If no user found, return an appropriate error message
     * @return void
     */
    public function getMedecin() : void{
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
        $ajax = [];

        $daoUser = new DaoUser(DBHOST, DBNAME, PORT, USER, PASS);
        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);

        $idMedecin = $_GET['id'];

        $medecin = $daoUser->getFullById($idMedecin);
        $meetings = $daoMeeting->getMeetingsOfDoctor($medecin);
        $orderedMeetings = [];
        $today = new DateTime();
        $today->modify("+1 hour");

        foreach ($meetings as $meeting) {
            if ($meeting->get_beginning() > $today) {
                $day = $meeting->get_beginning()->format('Y-m-d');
                if (!isset($orderedMeetings[$day])) $orderedMeetings[$day] = [];
                array_push($orderedMeetings[$day], $meeting);
            }
        }
        $medecin->set_meetings($orderedMeetings);

        
        $ajax["header"] = file_get_contents(PATH_VIEW . "header.html");
        $ajax["html"] = file_get_contents(PATH_VIEW . "vhorairesMedecin.html");
        $ajax["medecin"] = $medecin->userToArray();

        print_r(json_encode($ajax));
    }

    public function userReservation() {
        $alerts = [];
        $user = $_SESSION['user'];
        $idMeeting = $_POST['id'];

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $utils      = new Utils();

        $meeting = $daoMeeting->getMeetingById($idMeeting);

        if ($meeting->get_user() == null) {
            $daoMeeting->setUserOfMeeting($meeting, $user);
            $ajax["message"] = $utils->echoSuccess("Votre rendez-vous a bien été ajouté");
            $ajax["success"] = $idMeeting;
        }
        else {
            $ajax["message"] = $utils->echoError("Votre rendez-vous n'a pas pu être réservé");
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

        // require PATH_VIEW . "vrendezvous.php";
        print_r(json_encode($ajax));
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
        $user = $_SESSION['user'];
        $meetingId = $_GET['id'];

        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        $utils = new Utils();

        $meet = $daoMeeting->getMeetingById($meetingId);
        $daoMeeting->cancelMeetingOfPatient($user, $meet);

        $ajax["message"] = $utils->echoSuccess("Votre rendez-vous a bien été annulé");
        print_r(json_encode($ajax));
    }


    public function getNextMeeting() : void{
        $daoMeeting = new DaoMeeting(DBHOST, DBNAME, PORT, USER, PASS);
        if (isset($_SESSION['user'])) {
            $user = $_SESSION['user'];
            $meeting = $daoMeeting->getNextMeeting($user);

            if ($meeting == null)   print_r(json_encode(null));
            else                    print_r(json_encode($meeting->meetingToArray()));
        }
        else print_r(json_encode(null));
    }

    public function getSpecialities(){
    $daoSpeciality = new DaoSpeciality(DBHOST, DBNAME, PORT, USER, PASS);


    print_r(json_encode($daoSpeciality->getSpeciality()));
    }
}