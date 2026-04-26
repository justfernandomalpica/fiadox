<?php

namespace App\Models;

use Core\Database\ActiveRecord;

class ClientModel extends ActiveRecord {
    protected static string $table = "clients";
    protected static array $columns = ["id", "name", "phone", "created_at", "updated_at"];
    protected static array $columnsToSync = ["name", "phone"];

    public ?int $id;
    public string $name;
    public ?string $phone;

    public function __construct(array $args = []) {
        $this->id = $args["id"] ?? null;
        $this->name = $args["name"] ?? '';
        $this->phone = $args["phone"] ?? '';
    }

    public function name(string $name) { $this->name = $name; }
    public function phone(?string $phone) { $this->phone = $phone; }

    public function validate() {
        if($this->name === '') $this->setError("Argumento Inválido", "El nombre del cliente no puede estar vacío");
        if(!preg_match("/^(\d{10})?$/",$this->phone)) $this->setError("Argumento Inválido","El numero de telefono debe ser de 10 digitos");
    }

}