<?php 
class IPC{
    /* 通用参数 */
    public $id = '3f58019f-9738-5c80-c7ca-f41f4fd';
    public $name = 'ipc';
    public $master = '192.168.1.238';
    public $system = 'nvcr';
    public $index = 0;
    public $num = 1000;
    public $url = null;

    /* 添加IPC */
    public $groupId = '0';
    public $ip = '192.168.1.145';
    public $controlPoint ='rtsp://192.168.1.238:8561/video';
    public $type = 'rtsp';
    public $model = 'unknown';
    public $vendor = 'unknown';
    public $addParam = null;

    /* 修改通道信息参数 */
    public $protocol = 'RTPoverUDP';
    public $relayEnable = 'Disable';
    public $storageEnable = 'Disable';
    public $audioEnable = 'Disable';
    public $storageStrategy = 'Default';
    public $modUrl = null;
    public $modParam = null;


    /* 删除IPC */
    public $delParam = null;

    public $help = false;

    public function __construct($params){
        $count = count($params);
        for ($i = 0; $i < $count - 1; $i++) {
            switch ($params[$i]) {
                case '--master':                            //nvr host ip or nvcr master ip
                    $this->master = $params[++$i];
                    break;
                case '--system':                            //'nvr' or nvcr
                    $this->system = $params[++$i];
                    break;
                case '--index':                             //first ipc index
                    $this->index = $params[++$i];
                    break;
                case '--num':                               //ipc total number
                    $this->num = $params[++$i];
                    break;
                case '--groupId':                           //ipc group id
                    $this->groupId = $params[++$i];
                    break;
                case '--ip':                                //ipc ip
                    $this->ip = $params[++$i];
                    break;
                case '--controlPoint':                      //onvif controlPoint or rtsp url
                    $this->controlPoint = $params[++$i];
                    break;
                case '--relayEnable':                       //'Disable' or 'Manual'
                    $this->relayEnable = $params[++$i];
                    break;
                case '--storageEnable':                     //'Disable' or 'Manual'
                    $this->storageEnable = $params[++$i];
                    break;
                case '--storageStrategy':                   //'Default', 'Single', 'Dual' or 'Backup'
                    $this->storageStrategy = $params[++$i];
                    break;
                case '--help':
                    echo "add: --master --system --index --num --groupId  --ip --controlPoint\n";
                    echo "mod: --master --system --index --num --relayEnable --storageEnable --storageEnable\n";
                    echo "del: --master --system --index --num\n";
                    $this->help = true;
                    break;     
                default:
                    break;
            }
        }
        $this->url = ' http://'.$this->master.':8080/rest/v1/'.$this->system.'/ipcList';
        $this->addParam = 'curl -v -X POST -d type='.$this->type.' -d model='.$this->model.' -d vendor='.$this->vendor.' -d ipAddr='.$this->ip.' -d groupId='.$this->groupId.' -d controlPoint='.$this->controlPoint.' ';
        $this->modParam = 'curl -v -X PUT -d protocol='.$this->protocol.' -d relayEnable='.$this->relayEnable.' -d storageEnable='.$this->storageEnable.' -d audioEnable='.$this->audioEnable.' -d storageStrategy='.$this->storageStrategy.' ';
        $this->delParam = 'curl -v -X DELETE ';
    }

    /* 添加IPC */
    public function addIpc(){
        for($i = $this->index; $i < $this->num + $this->index; $i++){
            if($i < 10)
            {
                $ipcName = $this->name.'0000'.$i;
                $ipcId = $this->id.'0000'.$i;
            }
            else if ($i < 100) {
                $ipcName = $this->name.'000'.$i;
                $ipcId = $this->id.'000'.$i;
            }
            else if ($i < 1000) {
                $ipcName = $this->name.'00'.$i;
                $ipcId = $this->id.'00'.$i;
            }
            else if ($i < 10000) {
                $ipcName = $this->name.'0'.$i;
                $ipcId = $this->id.'0'.$i;
            }
            else if ($i <= 99999) {
                $ipcName = $this->name.$i;
                $ipcId = $this->id.$i;
            }
            $cmd = $this->addParam.' -d id='.$ipcId.' -d name='.$ipcName.$this->url;
            $res = exec($cmd." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "add ipc(".$ipcName.") faild\t\treson: ".$output[2]."\n";
                return false;
            }
            unset($output);

            $cmd = $this->modParam.$this->url.'/'.$ipcId.'/channels/0';
            $res = exec($cmd." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "mod ipc(".$ipcName.") faild\t\treson: ".$output[2]."\n";
                return false;
            }
            unset($output);
        }
    }

    /* 修改IPC */
    public function  modIpc(){
        for($i = $this->index; $i < $this->num + $this->index; $i++){
            if($i < 10)
            {
                $ipcName = $this->name.'0000'.$i;
                $ipcId = $this->id.'0000'.$i;
            }
            else if ($i < 100) {
                $ipcName = $this->name.'000'.$i;
                $ipcId = $this->id.'000'.$i;
            }
            else if ($i < 1000) {
                $ipcName = $this->name.'00'.$i;
                $ipcId = $this->id.'00'.$i;
            }
            else if ($i < 10000) {
                $ipcName = $this->name.'0'.$i;
                $ipcId = $this->id.'0'.$i;
            }
            else if ($i <= 99999) {
                $ipcName = $this->name.$i;
                $ipcId = $this->id.$i;
            }

            $cmd = $this->modParam.$this->url.'/'.$ipcId.'/channels/0';
            $res = exec($cmd." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "mod ipc(".$ipcName.") faild\t\treson: ".$output[2]."\n";
                return false;
            }
            unset($output);
        }
    }

    /* 删除IPC */
    public function delIpc(){
        for($i = $this->index; $i < $this->num + $this->index; $i++){
            if($i < 10)
            {
                $ipcName = $this->name.'0000'.$i;
                $ipcId = $this->id.'0000'.$i;
            }
            else if ($i < 100) {
                $ipcName = $this->name.'000'.$i;
                $ipcId = $this->id.'000'.$i;
            }
            else if ($i < 1000) {
                $ipcName = $this->name.'00'.$i;
                $ipcId = $this->id.'00'.$i;
            }
            else if ($i < 10000) {
                $ipcName = $this->name.'0'.$i;
                $ipcId = $this->id.'0'.$i;
            }
            else if ($i <= 99999) {
                $ipcName = $this->name.$i;
                $ipcId = $this->id.$i;
            }

            $cmd = $this->delParam.$this->url.'/'.$ipcId;
            $res = exec($cmd." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "del ipc(".$ipcName.") faild\t\treson: ".$output[2]."\n";
                return false;
            }
            unset($output);
            sleep(1);
        }
    }

    public function isForHelp(){
        return $this->help;
    }
}

function dispatch($params){
    switch ($params[1]) {
        case 'addIpc':
            $newIpc = new IPC($params);
            if ($newIpc->isForHelp() === false){
                $newIpc->addIpc();
            }
            break;
        case 'modIpc':
            $newIpc = new IPC($params);
            if ($newIpc->isForHelp() === false){
                $newIpc->modIpc();
            }
            break;
        case 'delIpc':
            $newIpc = new IPC($params);
            if ($newIpc->isForHelp() === false){
                $newIpc->delIpc();
            }
            break;
        default:
            echo "first params must be 'addIpc','addIpc'or'delIpc'\n";
            break;
    }
}

dispatch($argv);

?>
