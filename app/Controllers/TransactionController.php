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

    public static function getBalance() {
        $result = TransactionModel::getBalance();
        Response::success($result);
    }

    public static function filterById(array $props) {
        if(!isset($props["id"])) Response::error("No se encontró Id de cliente en la petición");
        if(!isset($_GET["page"]) || !isset($_GET["per_page"])) Response::error("Los campos de paginación son obligatorios");

        $result = TransactionModel::where("client_id", $props["id"], $_GET["page"], $_GET["per_page"]);
        if(empty($result)) Response::error("El cliente no tiene transacciones o no existe", 404);
        
        $transactions = array_map(function ($row) {
            return [
                'id' => $row->id,
                'amount'=> $row->getAmount(),
                'type'  => $row->type,
                'time'  => $row->created_at
            ];
        }, $result);
        
        Response::success([
            "page"=>$_GET["page"],
            "per_page"=>$_GET["per_page"],
            "transactions"=>$transactions
        ]);
    }

    private static function validate(){
        if( !isset($_POST["client_id"]) ||
            !isset($_POST["type"]) ||
            !isset($_POST["amount"])
        ) Response::error("Uno o mas argumentos necesrios no fueron recibidos");

        if($_POST["client_id"] === "") Response::error("El identificador de cliente es obligatorio");
    }
}