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

    public static function getByNamePaginated(string $name, int $page = 1, int $per_page = 10,) : array {
        $offset = ($page>1) ? ($page-1)*$per_page : 0;
        self::initialValidation();
        $table = static::$table;

        $term = "%".$name."%";
        $query = "SELECT * FROM $table WHERE name LIKE ? LIMIT ? OFFSET ?";

        return self::fetchAll($query, [$term, $per_page, $offset]);
    }
}