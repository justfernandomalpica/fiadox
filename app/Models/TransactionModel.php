<?php

namespace App\Models;

use Core\Database\ActiveRecord;

class TransactionModel extends ActiveRecord {
    protected static string $table = "transactions";
    protected static array $columns = ["id", "client_id", "type", "amount", "description", "created_at", "updated_at"];
    protected static array $columnsToSync = ["client_id", "type", "amount", "description"];

    public ?int $id;
    public ?int $client_id;
    public string $type;
    public string $rAmount;
    protected float $amount = 0;
    public ?string $description;

    public function __construct(array $args = []) {
        $this->id = $args["id"] ?? null;
        $this->client_id = $args["client_id"] ?? null;
        $this->type = $args["type"] ?? "";
        $this->rAmount = $args["amount"] ?? "";
        $this->description = $args["description"] ?? null;
    }

    public function getAmount() {
        return $this->amount;
    }
    
    public function validate() {
        if($this->client_id === null || $this->client_id <= 0) $this->setError("Argumento Inválido", "Es necesario ingresar un número de cliente válido");
        if(!in_array($this->type,["payment", "charge"], true)) $this->setError("Argumento Inválido", "El tipo de transacción es inválido o está vacío");
        if($this->rAmount === "" || !preg_match("/^\d+(\.\d*)?$|^\.\d+$/", $this->rAmount)) $this->setError("Argumento Inválido", "La cantidad de la transacción debe tener formato ##.##");
        else if ((float)$this->rAmount <= 0) $this->setError("Argumento Inválido", "La cantidad de la transaccion no puede ser menor o igual a cero");
        else $this->amount = (float)$this->rAmount;
    }

    public static function getBalance(?int $client_id = null){
        $query = "SELECT 
            COALESCE(SUM(CASE WHEN type = 'charge' THEN amount ELSE 0 END), 0) AS total_charged,
            COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) AS total_paid,
            COALESCE(SUM(CASE WHEN type = 'charge' THEN amount ELSE -amount END), 0) AS balance
        FROM transactions";
        
        $params = [];
        if(!is_null($client_id)) {
            $query .= " WHERE client_id = ?";
            $params[] = $client_id;
        }

        $result = self::query($query,$params);
        
        $total_paid = (float) $result["total_paid"];
        $total_charged = (float) $result["total_charged"];
        $balance = (float) $result["balance"];

        return [
            'Total fiado' => $total_charged,
            'Total pagado' => $total_paid,
            'Gran total' => $balance
        ];
    }
}