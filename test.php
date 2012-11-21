<?php 

/***************************************************************************************************/
/* 优化查找录像文件夹 */
function test()
{
    $currentDate = date_create_from_format("Ymd\TH:i:s", "19700101T01:00:00");
    if( $currentDate == FALSE) {
        echo "00\n";
        return array();
    }
    $endDateTime = date_create_from_format("Ymd\TH:i:s", "20991231T23:59:59");
    if( $endDateTime == FALSE) {
        echo "01\n";
        return array();
    }
    $path = '/mnt/fs02/gx02/22be0860-3ea9-11e1-b6a4-3dd218602de6/0/';
    $dateDirArray = scandir($path);
    $dateInterval = new DateInterval('P1D');
    $dirNum = count($dateDirArray);
    for($i = 0; $i < $dirNum; $i++)
    {
        if (8 !== strlen($dateDirArray[$i]) || 
            false === is_numeric($dateDirArray[$i]) || 
            false === is_dir($path.'/'.$dateDirArray[$i]))
        {
            continue;
        }
        $firstDate = date_create_from_format("Ymd\TH:i:s", $dateDirArray[$i]."T00:00:00");
        if( $firstDate == FALSE) {
            continue;
        }
        if ($firstDate > $currentDate)
        {
            $currentDate = date_sub($firstDate, $dateInterval);
        }
        break;
    }
    for($i = $dirNum - 1; $i >= 0; $i--)
    {
        if (8 !== strlen($dateDirArray[$i]) || 
            false === is_numeric($dateDirArray[$i]) || 
            false === is_dir($path.'/'.$dateDirArray[$i]))
        {
            continue;
        }
        $lastDate = date_create_from_format('Ymd\TH:i:s', $dateDirArray[$i].'T23:59:59');
        if( $lastDate == FALSE) {
            continue;
        }
        if ($lastDate < $endDateTime)
        {
            $endDateTime = date_add($lastDate, $dateInterval);
        }
        break;
    }
    var_dump($currentDate);
    var_dump($endDateTime);  
}

//test();

/***************************************************************************************************/
/* 消除录像搜索结果中的允余 */
class FileItem
{
    public $startTime = '1900-01-01T00:00:00';
    public $endTime = '1900-01-01T00:00:00';
    public $filename = '';

    public function init($filename01, $filename02)
    {
        $this->startTime = '2012-11-07T'.$filename01;
        $this->endTime = '2012-11-07T'.$filename02;
        $this->filename = $filename01.'-'.$filename02;
        return $this;
    } 
}

function nvcrFilterOverlapVideoFile(&$fileList)
{
    if(empty($fileList)){
        return;
    }
    
    $lastKey = NULL;
    $lastStartTime = NULL;
    $lastEndTime = NULL;

    
    foreach($fileList as $key=>$entry){
        
        unset($entryStart);
        unset($entryEnd);
        $updateLast = TRUE;
        
        $entryStart = date_create_from_format("Y-m-d\TH:i:s", strval($entry->startTime));
        
        if($entryStart === FALSE){
            continue;
        }
        
        $entryEnd = date_create_from_format("Y-m-d\TH:i:s", strval($entry->endTime));
        if($entryEnd === FALSE){
            continue;
        }

        if(NULL !== $lastKey){
            if($lastStartTime == $entryStart){
                if($lastEndTime >= $entryEnd){
                    unset($fileList[$key]);
                    $updateLast = FALSE;
                }else{
                    unset($fileList[$lastKey]);
                }
                
            }else{
                if($entryEnd <= $lastEndTime){
                    unset($fileList[$key]);
                    $updateLast = FALSE;
                }
            } 
        }
        
        if($updateLast){
            $lastKey = $key;
            $lastStartTime = $entryStart;
            $lastEndTime = $entryEnd;
        }   
    }

    $lastKey = NULL;
    $prevLastKey = NULL;
    $lastEndTime = NULL;
    $min_interval = date_interval_create_from_date_string('5 seconds');
    foreach($fileList as $key=>$entry){
        if (NULL === $prevLastKey || NULL === $lastKey){
            $prevLastKey = $lastKey;
            $lastKey = $key;
            continue;
        }
        unset($entryStart);
        unset($lastEndTime);

        $entryStart = date_create_from_format("Y-m-d\TH:i:s", strval($entry->startTime));
        if($entryStart === FALSE){
            continue;
        }
        $lastEndTime = date_create_from_format("Y-m-d\TH:i:s", strval($fileList[$prevLastKey]->endTime));
        if($lastEndTime === FALSE){
            $prevLastKey = $lastKey;
            $lastKey = $key;
            continue;
        }

        if ($lastEndTime >= date_sub($entryStart, $min_interval))
        {
            unset($fileList[$lastKey]);
        }
        else
        {
            $prevLastKey = $lastKey;
        }
        $lastKey = $key;
    }
    
}

function test_nvcrFilterOverlapVideoFile()
{
    $fileList = array();
    $fileList[0] = (new FileItem)->init('01:00:00', '01:10:00');
    $fileList[1] = (new FileItem)->init('01:00:00', '01:30:00');
    $fileList[2] = (new FileItem)->init('01:20:00', '01:40:00');
    $fileList[3] = (new FileItem)->init('01:30:05', '01:50:00');
    $fileList[4] = (new FileItem)->init('01:45:00', '01:47:00');
    nvcrFilterOverlapVideoFile($fileList);
    var_dump($fileList);
}
test_nvcrFilterOverlapVideoFile();

/***************************************************************************************************/
?>
