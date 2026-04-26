<?php declare(strict_types=1);

namespace Core\Database;

class Database {
    private ?\mysqli $connection;

    public function __construct(\mysqli $connection) {
        $this->connection = $connection;
    }

    public function query(string $query, array $params = []) : \mysqli_result | bool {
        if($this->connection === null) throw new \Exception("No database connection setted");
        return $this->connection->execute_query($query, $params);
    }

    public function lastInsertId() : string | int {
        if($this->connection === null) throw new \Exception("No database connection setted");
        return $this->connection->insert_id;   
    }
}
