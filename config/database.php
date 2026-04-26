<?php

use Core\Database\Database;

$mysqli = mysqli_connect(
    $_ENV["DB_HOST"],
    $_ENV["DB_USER"],
    $_ENV["DB_PASS"],
    $_ENV["DB_NAME"],
    $_ENV["DB_PORT"]
);

if(!$mysqli) {
    $errMsg = "An error occourred during database connection: ";
    $error = mysqli_connect_error();
    $errNo = mysqli_connect_errno();
    throw new \Exception($errMsg . $error . " | " . $errNo);
    exit;
}

$db = new Database($mysqli);