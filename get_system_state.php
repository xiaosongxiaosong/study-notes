<?php
/* 提供获取设备状态的接口，逐步完善 */

class SystemState{
    private $m_cpuState = 0;
    private $m_memState = 0;
    private $m_top = 'top -n 1';

    public function __construct(){
        $this->printState();
    }

    public function topResultHandle(){
            unset($output);
            exec($this->m_top, $output);
            $this->m_cpuState = round(100 - substr($output[2], 79, 4), 1);
            $this->m_memState = round(100 * substr($output[3], 42, 9) / substr($output[3], 13, 9), 1);
    }

    function printState(){
        $argc = func_num_args();
        $argv = func_get_args();
        if (1 == $argc){
            $interval = $argv[0];
        }
        else{
            $interval = 5;
        }
        while (true) {
            $this->topResultHandle();
            echo "CPU: ".$this->m_cpuState."%\t\tMEM: ".$this->m_memState."%\n";
            sleep($interval);
        }
    }

    public function getCpuState(){
        $this->topResultHandle();
        return $this->m_cpuState;
    }

    public function getMemState(){
        $this->topResultHandle();
        return $this->m_memState;
    }
}

$state = new SystemState();
?>