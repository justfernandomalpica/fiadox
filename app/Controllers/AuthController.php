<?php

namespace App\Controllers;

use App\Models\UserModel;
use Core\Log\Logger;
use Core\Response;

class AuthController {
    public static function login() {
        $admin = UserModel::findBy("email",$_POST["email"]);

        if(is_null($admin)) Response::error("El usuario no existe",404);
        if(!password_verify($_POST["password"], $admin->password_hash)) Response::error("La contraseña es incorrecta",401);

        start_session();

        $_SESSION["user_id"] = $admin->id;
        $_SESSION["last_activity"] = time();

        start_session();
        Logger::entry("Nuevo inicio de sesión","[administrador:".$_SESSION["user_id"].", desde:".$_SERVER["REMOTE_ADDR"]."]");

        Response::success("Sesión iniciada correctamente",202);
    }

    public static function logout(){
        start_session();
        $lastId = $_SESSION["user_id"];
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }

        session_destroy();
        Logger::entry("Se ha cerrado la ultima sesión activa","[administrador:".$lastId."]");

        Response::success("Se ha cerrado sesión correctamente");
    }

    public static function check() {
        Response::success("Active Session");
    }
}