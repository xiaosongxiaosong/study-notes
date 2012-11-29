<?php
//require_once('get_system_state.php');
/* 此文件用于rtspProxy压力测试，必须跑在含有‘/root/src/live/testProgs/openRTSP’文件的设备上 */
function test_rtspProxy(){
    $total = 0;
    $cmd = array('rtsp://192.168.1.146:8554/v1/nvcr/22be0860-3ea9-11e1-b6a4-3dd218602de6/0',
                 'rtsp://192.168.1.146:8554/v1/nvcr/0a98d540-b086-11e1-ab3f-fbba2b3ffbba/0',
                 'rtsp://192.168.1.146:8554/v1/nvcr/c2b4e5b4-1dd1-11b2-b8c1-dbe0597c3db5/0',
                 'rtsp://192.168.1.146:8554/v1/nvr/c2b4e5b4-1dd1-11b2-b8c1-dbe0597c3db5/0');
    while ($total < 200){
        foreach ($cmd as $key => $value) {
            $total++;
            echo "###############################################################\n\t\t\t".$total."\n###############################################################\n";


            $res = exec('/root/src/live/testProgs/openRTSP -d 1 '.$value.' 2>>a.txt &', $output);
            if (0 == $res){
                echo $key."\tSuccess\t".$value."\n";
            }else{
                echo $key."\tFaild  \t".$value."\n";
                if (1 != $key){
                    echo "ERROR\n";
                    //return false;
                }
            }

        }
    }
}

test_rtspProxy();

?>