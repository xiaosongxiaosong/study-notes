<?php 
function test_master_error(){
    $change0 = 'curl -v -X PUT -d groupId=0 http://192.168.1.236:8080/rest/v1/nvcr/nvrList/b6598dc0-1760-494a-acb6-e610689176a8';
    $change1 = 'curl -v -X PUT -d groupId=1 http://192.168.1.236:8080/rest/v1/nvcr/nvrList/b6598dc0-1760-494a-acb6-e610689176a8';
    $ipcReblance = 'curl -v -X POST -d id=0 -d scope=GroupId http://192.168.1.236:8080/rest/v1/nvcr/ipcRebalance';
    $nvcrStates = 'curl -v -X GET http://192.168.1.236:8080/rest/v1/nvcr';
    $count = 0;
    while (true) {
        unset($match);
        unset($output);
        /* 将23组id修改为0 */
        $res = exec($change0." 2>/dev/null;", $output);
        if ("</reason>" == $res){
            echo "change nvr(192.168.1.236) to group 0(default) faild\t\treson: ".$output[2]."\n";
            return false;
        }
        else{
            echo "change nvr to group 0 success\n";
        }
        unset($match);
        unset($output);
        sleep(1);

        /* group 0 重分配 */
        $res = exec($ipcReblance." 2>/dev/null;", $output);
        if ("</reason>" == $res){
            echo "group 0(default) reblance faild\t\treson: ".$output[2]."\n";
            return false;
        }
        else{
            echo "group 0 reblance success\n";
        }
        unset($match);
        unset($output);
        sleep(10);

        /* 循环检测集群状态，判断master节点是否为Working，是则判断未分配的IPC数量是否为100，等于100则进行下一步操作 */
        while (true){
            $res = exec($nvcrStates." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "get nvcr states faild\t\treson: ".$output[2]."\n";
                return false;
            }

            preg_match('/^\s*<masterState>(.+)<\/masterState>$/', $output[2],$match);
            if ($match[1] != "Working"){
                echo "master state:".$match;
                return false;
            }
            unset($match);

            preg_match('/^\s*<undispatchIpcNum>([0-9]+)<\/undispatchIpcNum>$/', $output[15],$match);
            if ($match[1] <= 500){
                echo "reblance finished\n";
                break;
            }
            unset($match);
            unset($output);
            sleep(10);
        }
        unset($match);
        unset($output);
        sleep(1);

        /* 将23组id修改为1 */
        $res = exec($change1." 2>/dev/null;", $output);
        if ("</reason>" == $res){
            echo "change nvr(192.168.1.236) to group 1(group) faild\t\treson: ".$output[2]."\n";
            return false;
        }
        else{
            echo "change nvr to group 1 success\n";
        }
        unset($match);
        unset($output);
        sleep(10);

        /* 循环检测集群状态，判断master节点是否为error，不是判断未分配的IPC数量是否为0，等于0则进行下一步操作 */
        while (true){
            $res = exec($nvcrStates." 2>/dev/null;", $output);
            if ("</reason>" == $res){
                echo "get nvcr states faild\t\treson: ".$output[2]."\n";
                return false;
            }

            preg_match('/^\s*<masterState>(.+)<\/masterState>$/', $output[2],$match);
            if ($match[1] != "Working"){
                echo "master state:".$match;
                return false;
            }
            unset($match);

            preg_match('/^\s*<undispatchIpcNum>([0-9]+)<\/undispatchIpcNum>$/', $output[15],$match);
            if ($match[1] == 0){
                echo "dispatch finished\n";
                break;
            }
            unset($match);
            unset($output);
            sleep(10);
        }
        unset($match);
        unset($output);
        sleep(1);
    }
    
}
test_master_error();

?>