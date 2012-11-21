<?php 
function test_session_id(){
    $post = 'curl -v -X POST -d aliveTime=600000 -d maxIpcNum=10000 -d preTime=3000 -d type=onvif -d groupId=0 http://192.168.1.146:8080/rest/v1/nvcr/ipcProbes';
    $delete = 'curl -v -X DELETE http://192.168.1.146:8080/rest/v1/nvcr/ipcProbes/';
    $count = 0;
    while (true) {
        unset($match);
        unset($output);
        $res = exec($post." 2>/dev/null;", $output);
        if ("</reason>" == $res){
            echo "creat session faild\t\treson: ".$output[2]."\n";
            return false;
        }
        preg_match('/^\s*<probeId>([0-9]+)<\/probeId>$/', $output[2],$match);
        if ($match[1] >= 65535){
            echo "finished\n";
            return true;
        }
        sleep(5);
        unset($output);
        $res = exec($delete.$match[1]." 2>/dev/null;", $output);
        if ("</reason>" == $res){
            echo "delete session faild\t\treson: ".$output[2]."\n";
            return false;
        }
        sleep(5);
        $count++;
        if (10 == $count){
            var_dump($match[1]);
            $count = 0;
        }
    }
    
}
test_session_id();

?>