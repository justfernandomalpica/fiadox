<?php declare(strict_types=1);

namespace Core\Log;

class Logger {
    protected static string $streamPath;
    protected static string $streamName;
    protected static ?string $streamDirname = null;
    
    public static function setStream(string $path, string $name = '') {
        self::$streamPath = PROJECT_ROOT.DIRECTORY_SEPARATOR.self::validatePath($path);
        self::$streamName = self::createName($name);

        if(!file_exists(self::$streamPath)) $pathStatus = mkdir(self::$streamPath);
        else $pathStatus = true;
        
        if($pathStatus) {
            self::$streamDirname = self::$streamPath.self::$streamName;
            if(!file_exists(self::$streamDirname)) self::entry("Stream Setted correctly");
        }
        else throw new \RuntimeException("An error occurred setting Log stream");
    }

    public static function entry(string $mssg, string $data = '') {
        if(is_null(self::$streamDirname)) throw new \RuntimeException("Log stream not setted");
        $timeMark = "[". PROJECT_DATE_TIME ."]";
        $mssg = trim($mssg);
        if($mssg === "") throw new \RuntimeException("Log entry message cannot be empty.");
        $entryLine = $timeMark." ".$mssg.".".(($data !=='') ? " ".$data : "")."\n";
        file_put_contents(self::$streamDirname, $entryLine,FILE_APPEND);
    }

    private static function validatePath(string $path) : string {
        $baseErrorMsg = "Error on setting log stream path: ";
        $path = trim($path);
        if($path === "") throw new \InvalidArgumentException($baseErrorMsg."Path cannot be empty.");
        $path = preg_replace('/\//', DIRECTORY_SEPARATOR,$path);
        return $path.DIRECTORY_SEPARATOR;
    }

    private static function createName(string $name = "") : string {
        $name_tmp = ($name !== "") ? PROJECT_DATE."_".$name : PROJECT_DATE;
        return $name_tmp.".log";
    }
}