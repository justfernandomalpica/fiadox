<?php

namespace App\Models;

use Core\Database\ActiveRecord;

class UserModel extends ActiveRecord {
    protected static string $table = 'users';
    protected static array $columns = ["id", "email", "password_hash", "created_at", "updated_at"];
    protected static array $columnsToSync = ["email", "password_hash"];

    public ?int $id;
    public string $email;
    public string $password_hash;

    public function __construct(array $args = []) {
        $this->id = $args["id"] ?? null;
        $this->email = $args["email"] ?? '';
        $this->password_hash = $args["password_hash"] ?? '';
    }
}