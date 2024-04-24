<?php
require_once "Speciality.php";
require_once "Place.php";
require_once "Meeting.php";

class User {
    private int $id;
    private string $name;
    private string $surname;
    private string $phone;
    private string $mail;
    private string $picture = " ";
    private ?Place $place;
    private ?Speciality $speciality;
    private array $meetings;

    public function __construct(int $id, string $name, string $surname, string $phone, string $mail, string $picture, ?Place $place = NULL, ?Speciality $speciality = NULL, array $meetings = []) {
        $this->id           = $id;
        $this->name         = $name;
        $this->surname      = $surname;
        $this->phone        = $phone;
        $this->mail         = $mail;
        $this->picture      = $picture;
        if ($speciality != NULL) $this->speciality   = $speciality;
        if ($place != NULL) $this->place = $place;
        $this->meetings = $meetings;
    }

    public function get_id() : int {
        return $this->id;
    }

    public function get_name() : string {
        return $this->name;
    }

    public function get_surname() : string {
        return $this->surname;
    }

    public function get_phone() : string {
        return trim(strrev(chunk_split(strrev($this->phone),2, ' ')));
    }

    public function get_mail() : string {
        return $this->mail;
    }

    public function get_picture() : string {
        return $this->picture;
    }

    public function get_place() : Place {
        return $this->place;
    }

    public function get_speciality() : ?Speciality {
        return $this->speciality;
    }

    public function get_meetings() : array {
        return $this->meetings;
    }

    public function set_id($id) {
        $this->id = $id;
    }

    public function set_name(string $name) {
        $this->name = $name;
    }

    public function set_surname(string $surname) {
        $this->surname = $surname;
    }

    public function set_phone(string $phone) {
        $this->phone = $phone;
    }

    public function set_mail(string $mail) {
        $this->mail = $mail;
    }

    public function set_picture(string $picture) {
        $this->picture = $picture;
    }

    public function set_place(Place $place) {
        $this->place = $place;
    }

    public function set_speciality(?Speciality $speciality) {
        $this->speciality = $speciality;
    }

    public function set_meetings(array $meetings) {
        $this->meetings = $meetings;
    }
    public function isSpeInit(){
        if(isset($this->speciality)){
            return true;
        }
        else return false;
    }

    public function userToArray() : array {
        $user = [];
        $allMeetings = [];

        $user["id"] = $this->id;
        $user["name"] = ucfirst($this->name);
        $user["surname"] = strtoupper($this->surname);
        $user["phone"] = $this->phone;
        $user["mail"] = $this->mail;
        $user["picture"] = $this->picture;
        if (isset($this->place)) $user["place"] = $this->place->placeToArray();
        if (isset($this->speciality)) $user["speciality"] = $this->speciality->specialityToArray();
        // print_r($this->meetings);
        foreach($this->meetings as $day => $meetings) {
            foreach ($meetings as $meeting) {
                // $allMeetings[key($date)] = $meeting->get_id();
                if (!isset($allMeetings[$day])) $allMeetings[$day] = [];
                array_push($allMeetings[$day], $meeting->meetingToArray(false));
            }
        }
        $user["meetings"] = $allMeetings;

        return $user;
    }
}