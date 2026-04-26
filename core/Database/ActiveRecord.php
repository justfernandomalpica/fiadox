<?php declare(strict_types=1);

namespace Core\Database;

use Core\Database\Database;

class ActiveRecord {
    
    private static ?Database $db = null;
    protected static string $table = '';
    protected static array $columns = [];
    protected static array $columnsToSync = [];
    protected ?int $id = null;
    protected array $errors = [];
    public ?string $created_at = null;
    public ?string $updated_at = null;

    // Entablish database instance
    public static function setDB(Database $database) : void { self::$db = $database; }

    // Save 
    public function save() : static | bool{
        if(is_null($this->id)) {
            $this->created_at = PROJECT_DATE_TIME;
            $this->updated_at = PROJECT_DATE_TIME;
            return $this->create();
        }
        else {
            $this->updated_at = PROJECT_DATE_TIME;
            return $this->update();
        }
    }

    // Create
    private function create() : static | bool {
        self::initialValidation();
        $table = static::$table;
        $attrs = $this->getAttributes();
        if(empty($attrs)) return false;

        $columns = implode(", ", array_keys($attrs));
        $params = array_values($attrs);

        $values = self::buildPlaceholdersChain($params);
        $query = "INSERT INTO $table ($columns) VALUES ($values)";
        $result = self::$db->query($query, $params);

        if(!$result) return false;
        $this->id = self::$db->lastInsertId();

        return $this;
    }
    
    // Read
    public static function all(int $page = 1, int $per_page = 10) : array {
        $offset = ($page>1) ? ($page-1)*$per_page : 0;
        self::initialValidation();
        $table = static::$table;
        $query = "SELECT * FROM $table LIMIT ? OFFSET ?";

        return self::fetchAll($query, [$per_page, $offset]);
    }

    public static function allNoPaginated() {
        $table = static::$table;
        $query = "SELECT * FROM $table";
        return self::fetchAll($query);
    }

    public static function find(int $id) : ?static {
        self::initialValidation();
        if($id <= 0) return null;
        $table = static::$table;
        $query = "SELECT * FROM $table WHERE id = ? LIMIT 1";

        return self::fetch($query, [$id]);
    }

    public static function get(int $lim) : array {
        self::initialValidation();
        $table = static::$table;
        if($lim <= 0) return [];
        $query = "SELECT * FROM $table LIMIT ?";
        $result = self::fetchAll($query,[$lim]);

        return $result;
    }

    public static function where(string $column, mixed $value, int $page = 1, int $per_page = 10) : array {
        $offset = ($page>1) ? ($page-1)*$per_page : 0;
        self::initialValidation();
        $table = static::$table;
        if (!in_array($column, static::$columns,true)) return [];
        $query = "SELECT * FROM $table WHERE $column = ? LIMIT ? OFFSET ?";
        $result = self::fetchAll($query, [$value, $per_page, $offset]);

        return $result;
    }

    public static function findBy(string $column, mixed $value) : ?static {
        self::initialValidation();
        $table = static::$table;
        if (!in_array($column, static::$columns,true)) return null;
        $query = "SELECT * FROM $table WHERE $column = ? LIMIT 1";

        return self::fetch($query, [$value]);
    }

    public static function count() : int {
        self::initialValidation();
        $table = static::$table;
        $query = "SELECT COUNT(*) as total FROM $table";
        $result = self::$db->query($query);
        if($result === false) return 0;

        return (int) $result->fetch_assoc()['total'];
    }

    // Update
    public function sync(array $data) : static {
        self::initialValidation();
        self::syncValidation();
        if(empty($data)) throw new \InvalidArgumentException("Cannot sync with empty data");
        if(array_is_list($data)) throw new \InvalidArgumentException("Data array must be associative");
        foreach ($data as $key => $value) {
            if(!in_array($key, static::$columnsToSync)) continue;
            if($key==='id') continue;
            call_user_func([$this,$key], $value);
        }

        return $this;
    }

    public function update() : static | bool {
        self::initialValidation();

        $table = static::$table;
        $id = $this->id;
        $attrs = $this->getAttributes();
        if(is_null($id) || empty($attrs)) return false;
        
        $columns = array_keys($attrs);
        $params = array_values($attrs);

        $values = self::buildPlaceholderPairsChain($columns);
        $query = "UPDATE $table SET $values WHERE id = ? LIMIT 1";
        $params[] = $id; // Esto aqui asegura que id siempre sea el ultimo parámetro antes de ejecutar el query
        $result = self::$db->query($query, $params);

        return $result ? $this : false;
    }

    // Delete
    public function delete() : bool {
        self::initialValidation();
        $table = static::$table;
        $id = $this->id;
        if(is_null($id)) return false;

        $query = "DELETE FROM $table WHERE id = ? LIMIT 1";
        $result = self::$db->query($query, [$id]);
        if ($result === false) return false;

        $this->id = null;
        return $result;
    }

    public function hasErrors() : bool {
        return !empty($this->errors);
    }

    public function getErrors() : array {
        $errors = $this->errors;
        return $errors;
    }

    public function getErrorsByHead(string $head) : array {
        if(empty($this->errors)) return [];
        $head = trim($head);
        if(trim($head) === '') throw new \InvalidArgumentException("Empty head provided. cannot resolve");
        if(!in_array($head,array_keys($this->errors))) return [];

        return $this->errors[$head];
    }

    public function getId() : ?int {
        return $this->id;
    }

    protected function setError(string $head, string $body) : void {
        if($head === '' || $body === '') throw new \InvalidArgumentException("A model error cannot be empty");
        $this->errors[$head][] = $body;
    }


    private function getAttributes() : array {
        $attrs = [];
        foreach(static::$columns as $column) {
            if(!property_exists($this, $column)) continue;
            if($column === "id") continue;
            $attrs[$column] = $this->$column; 
        }
        
        return $attrs;
    }

    private static function buildPlaceholdersChain(array $attrs) : string {
        $array = array_fill(0,count($attrs),'?');
        $chain = implode(", ", $array);
        return $chain;
    }

    private static function buildPlaceholderPairsChain(array $columns) : string {
        $array = [];
        foreach($columns as $column) {
            $array[] = $column . " = ?";
        }
        $chain = implode(", ", $array);
        return $chain;
    }

    private static function objectify(array $array) : static {
        $object = new static;
        foreach ($array as $key => $val) {
            if(!property_exists($object,$key)) continue;
            if($key === "id") $val = (int) $val;
            if(is_float($object->$key)) $val = (float) $val;
            $object->$key = $val;
        }

        return $object;
    }

    protected static function fetch(string $query, array $params = []) : ?static {
        $result = self::$db->query($query, $params);
        if($result === false) return null;
        if($result->num_rows === 0) return null;
        $result = self::objectify($result->fetch_assoc());

        return $result;
    }

    protected static function fetchAll(string $query, array $params = []) : array {
        $results = [];
        $result = self::$db->query($query, $params);
        if($result === false) return [];
        while ($res = $result->fetch_assoc()) {
            $results[] = self::objectify($res);
        }

        return $results;
    }

    protected static function query(string $query, array $params = []) {
        return self::$db->query($query, $params)->fetch_assoc();
    }

    private static function initialValidation() : void {
        $baseErrorMsg = "Active Record error: ";
        if(is_null(self::$db)) throw new \Exception($baseErrorMsg."An instance of \\mysqli must be setted before any operation");
        if(trim(static::$table) === '') throw new \Exception($baseErrorMsg."Table name cannot be empty");
        if(empty(static::$columns)) throw new \Exception($baseErrorMsg."At least one column must be declared");
        foreach(static::$columns as $column) {
            if(!property_exists(static::class, $column)) throw new \Exception($baseErrorMsg."Declared column '{$column}' does not have a matching model property.");   
        }
        return;
    }

    private static function syncValidation() : void {
        $baseErrorMsg = "Active Record error: ";
        if(empty(static::$columnsToSync)) throw new \Exception($baseErrorMsg."At least one column must be syncable");
        foreach(static::$columnsToSync as $columnToSync) {
            if(!in_array($columnToSync, static::$columns)) throw new \Exception($baseErrorMsg."Only declared columns with matching attributes can be synced. [{$columnToSync}]");
            if(!method_exists(static::class, $columnToSync)) throw new \Exception($baseErrorMsg."Declared syncable column '{$columnToSync}' does not have a matching setter.");
        }
        return;
    }
}