<?php
// Setting dateTime configuration;
require realpath(__DIR__ . "/datetime.php");

// Namespacing
use Core\Database\ActiveRecord;
use Core\Log\Logger;
use Dotenv\Dotenv;
use Core\Routing\Router;

// Define project root directory name constatn
require realpath(__DIR__."/constants.php");

// Fundamental requirements
require realpath(dirname(__DIR__)."/vendor/autoload.php");
require realpath(__DIR__ . "/functions.php");

// Environment variables configuration
$dotenv = Dotenv::createImmutable(PROJECT_ROOT);
$dotenv->safeLoad();

// Setting Logging system
Logger::setStream("storage/log");

// Setting ActiveRecord instance with database reference;
require realpath(__DIR__ . "/database.php");
ActiveRecord::setDB($db);

// Router instancing
$router = new Router();

// Setting response global headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

if($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}