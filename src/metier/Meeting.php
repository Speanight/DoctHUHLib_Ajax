<?php
class Meeting {
    private int $id;
    private DateTime $beginning;
    private DateTime $ending;
    private Place $place;
    private User $medecin;
    private ?User $user;
    public function __construct(int $id, DateTime $beginning, DateTime $ending, Place $place, User $medecin, ?User $user) {
        $this->id           = $id;
        $this->beginning    = $beginning;
        $this->ending       = $ending;
        $this->place        = $place;
        $this->medecin      = $medecin;
        $this->user         = $user;
    }

    public function meetingToArray() : array {
        $meeting = [];

        $meeting["id"] = $this->id;
        $meeting["beginning"] = $this->beginning->format("Y-m-d H:i:s");
        $meeting["ending"] = $this->ending->format("Y-m-d H:i:s");;
        $meeting["place"] = $this->place->placeToArray();
        $meeting["medecin"] = $this->medecin->userToArray();
        if(!empty($this->user)){
            $meeting["user"] = $this->user->userToArray();
        }

        return $meeting;
    }

    public function get_id() : int {
        return $this->id;
    }

    public function get_beginning() : DateTime {
        return $this->beginning;
    }

    public function get_ending() : DateTime {
        return $this->ending;
    }

    public function get_place() : Place {
        return $this->place;
    }

    public function get_medecin() : User {
        return $this->medecin;
    }

    public function get_user() : ?User {
        return $this->user;
    }


    public function set_id(int $id) {
        $this->id = $id;
    }

    public function set_beginning(DateTime $beginning) {
        $this->beginning = $beginning;
    }

    public function set_ending(DateTime $ending) {
        $this->ending = $ending;
    }

    public function set_place(Place $place) {
        $this->place = $place;
    }

    public function set_medecin(User $medecin) {
        $this->medecin = $medecin;
    }

    public function set_user(User $user) {
        $this->user = $user;
    }

}