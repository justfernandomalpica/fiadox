<?php

namespace App\Controllers;

use App\Models\TransactionModel;
use Core\Log\Logger;
use Core\Response;

class TransactionController {
    public static function addNew() {
        self::validate();

        $transaction = new TransactionModel($_POST);
        $transaction->validate();

        $errors = $transaction->getErrors();
        if(!empty($errors)) Response::error($errors);

        $status = $transaction->save();
        if($status === false) Response::error("Un error ocurrió al guardar el cliente. Intente nuevamente",500);

        start_session();
        Logger::entry("Se agregó una transacción a la base de datos", "[admin:".$_SESSION["user_id"].", cliente:".$transaction->client_id.", transacción:".$transaction->id."]");
        Response::success(["La Transacción se guardó correctamente.", $transaction],201);
    }

    private static function validate(){
        if( !isset($_POST["client_id"]) ||
            !isset($_POST["type"]) ||
            !isset($_POST["amount"])
        ) Response::error("Uno o mas argumentos necesrios no fueron recibidos");

        if($_POST["client_id"] === "") Response::error("El identificador de cliente es obligatorio");
    }
}