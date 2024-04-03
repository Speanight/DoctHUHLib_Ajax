<?php
class Week {
    private DateTime $begin;

    private DateTime $end;

    private array $days = array();

    public function __construct(DateTime $begin) {
        $this->begin = $begin;
        array_push($this->days, clone $begin);
        $tstart = clone $begin;
        for($i = 0; $i < 6; $i++){
            $tplus = $tstart->add(DateInterval::createFromDateString('1 day'));
            array_push($this->days, clone $tplus);
            $tstart = $tplus;
        }
        $this->end = end($this->days);
    }
    public function getBegin() :  DateTime {
        return $this->begin;
    }
    public function getEnd() : DateTime {
        return $this->end;
    }
    public function getDays() : array {
        return $this->days;
    }
    public function setBegin(DateTime $begin) : void {
        $this->begin = $begin;
    }
    public function setEnd($end) : void {
        $this->end = $end;
    }

    public function timeToArray() : array {
        $week = [];
        $week["begin"] = $this->begin->format("Y-m-d H:i:s");       
        $week["end"] = $this->end->format("Y-m-d H:i:s");
        $week["days"] = [];
        foreach($this->days as $day){
            array_push($week["days"], $day->format("Y-m-d H:i:s"));
        }
        return $week;

    }
}