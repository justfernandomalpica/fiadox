<?php

namespace App\Middleware;

use Core\Log\Logger;
use Core\Response;

class AuthMiddleware {
    public static function handle(){
        start_session();
        if(!isset($_SESSION["user_id"])) {
            if($_SERVER["REQUEST_URI"] === "/auth/me") Logger::entry("Nuevo intento de inicio de seisón", "[desde:".$_SERVER["REMOTE_ADDR"]."]");
            else Logger::entry("Un cliente trató de acceder a una página restringida", "[endpoint:'".$_SERVER["REQUEST_URI"]."', desde:".$_SERVER["REMOTE_ADDR"]."]");
            
            Response::error("Es necesario iniciar sesión para acceder a esta página o recurso", 401);
        }
    }
}