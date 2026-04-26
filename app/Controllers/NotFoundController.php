<?php

namespace App\Controllers;

use Core\Response;

class NotFoundController {
    public static function index(){
        Response::error("La pagina o recurso al que tratas de acceder no existe", 404);
    }
}