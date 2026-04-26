<?php declare(strict_types=1);

function debug(mixed $var, bool $kill=true) : void {
    echo "<pre>";
    var_dump($var);
    echo "</pre>";
    if($kill) exit;
}

function jsonRes(array $data, int $status = 200) : void {
    $jsonSettings = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, $jsonSettings);
    exit;
}

function htmlRes(string $html, int $status = 200) : void {
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo $html;
    exit;
}

function start_session(){
    if(session_status() !== PHP_SESSION_ACTIVE ){
        session_start();
    }
}