<?php

namespace App\Controllers;

use App\Models\ClientModel;
use App\Models\TransactionModel;
use Core\Log\Logger;
use Core\Response;

class ClientController {
    public static function addNew() {
        if(!isset($_POST["name"])) Response::error("Uno o mas argumentos necesrios no fueron recibidos");

        $client = new ClientModel($_POST);
        $client->validate();

        $errors = $client->getErrors();
        if(!empty($errors)) Response::error($errors);
        
        $status = $client->save();
        if($status === false) Response::error("Un error ocurrió al guardar el cliente. Intente nuevamente",500);

        start_session();
        Logger::entry("Se agregó un nuevo cliente a la base de datos","[administrador:".$_SESSION["user_id"].", entidad:".$client->id."]");

        Response::success([
            'message' => "Cliente guardado satisfactoriamente",
            'client' => $client
        ],201);
    }
        
    public static function showDetails(array $props){
        if(!isset($props["id"])) Response::error("No se encontró ID de cliente en la petición");

        $client = ClientModel::find($props["id"]);
        if($client === null) Response::error("No se encontró un cliente con el ID {$props['id']}",404);
        
        $clientId = $client->id;

        $amounts = TransactionModel::getBalance($clientId);
        Response::success([
            "message"=>"Cliente encontrado",
            "client"=>$client,
            "balance"=>$amounts
        ]);
    }

    public static function listAll() {
        if(!isset($_GET["page"]) || !isset($_GET["per_page"])) Response::error("Los campos de paginación son obligatorios");

        $clients = ClientModel::all($_GET["page"], $_GET["per_page"]);

        if(empty($clients)) Response::error("No hay clientes que mostrar",404);
        Response::success([
            "page"=>$_GET["page"],
            "per_page"=>$_GET["per_page"],
            "clients"=>$clients
        ]);
    }

    public static function listAllTransactionsById(array $props) {
        if(!isset($props["id"])) Response::error("No se encontró Id de cliente en la petición");
        if(!isset($_GET["page"]) || !isset($_GET["per_page"])) Response::error("Los campos de paginación son obligatorios");

        $result = TransactionModel::where("client_id", $props["id"], $_GET["page"], $_GET["per_page"]);
        if(empty($result)) Response::error("El cliente no tiene transacciones o no existe", 404);
        $transactions = array_map(function ($row) {
            return [
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

    public static function updateById(array $props) {
        if(!isset($props["id"])) Response::error("No se encontró Id de cliente en la petición");

        $client = ClientModel::find($props["id"]);
        if($client === null) Response::error("No se encontró un cliente con el ID {$props['id']}",404);

        $json = json_decode(file_get_contents("php://input"));  #Guardar los datos recibidos en el arreglo $_PUT

        $_PUT = [
            "name"=>$json->name,
            "phone"=>$json->phone
        ];

        $client->sync($_PUT);
        $client->validate();

        $errors = $client->getErrors();
        if(!empty($errors)) Response::error($errors);

        $status = $client->save();
        if($status === false) Response::error("Un error ocurrió al guardar la información del cliente. Intente de nuevo",500);

        start_session();
        Logger::entry("Se se actualizó la información de un cliente en la base de datos","[administrador:".$_SESSION["user_id"].", entidad:".$client->id."]");

        Response::success([
            'message' => "Cliente actualizado satisfactoriamente",
            'client' => $client
        ],201);
    }
        
    public static function deleteById(array $props) {
        if(!isset($props["id"])) Response::error("No se encontró Id de cliente en la petición");

        $client = ClientModel::find($props["id"]);
        if($client === null) Response::error("No se encontró un cliente con el ID {$props['id']}",404);

        $status = $client->delete();

        if(!$status) Response::error("Ocurrio un error al eliminar el cliente. Intente nuevamente", 500);

        start_session();
        Logger::entry("Se eliminó un cliente de la base de datos","[administrador:".$_SESSION["user_id"].", entidad:".$props["id"]."]");

        Response::success("El cliente se eliminó satisfactoriamente",201);
    }
}