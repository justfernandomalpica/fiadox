<?php

use App\Controllers\AuthController;
use App\Controllers\ClientController;
use App\Controllers\TransactionController;
use App\Middleware\AuthMiddleware;

require dirname(__DIR__) . "/config/app.php";

$router->post("/auth/login", [AuthController::class, "login"]);
$router->post("/auth/logout", [AuthController::class, "logout"])->middleware(AuthMiddleware::class);
$router->get("/auth/me", [AuthController::class,"check"])->middleware(AuthMiddleware::class);

$router->get("/api/clients",[ClientController::class,"listAll"])->middleware(AuthMiddleware::class);
$router->get("/api/clients/{id}",[ClientController::class,"showDetails"])->where("id","\d+")->middleware(AuthMiddleware::class);
$router->get("/api/clients/{id}/transactions", [TransactionController::class, "filterById"])->where("id","\d+")->middleware(AuthMiddleware::class);
$router->get("/api/transactions/summary", [TransactionController::class, "getBalance"])->middleware(AuthMiddleware::class);

$router->post("/api/clients", [ClientController::class, "addNew"])->middleware(AuthMiddleware::class);
$router->post("/api/transactions", [TransactionController::class, "addNew"])->middleware(AuthMiddleware::class);

$router->put("/api/clients/{id}", [ClientController::class,"updateById"])->middleware(AuthMiddleware::class);
$router->delete("/api/clients/{id}", [ClientController::class,"deleteById"])->middleware(AuthMiddleware::class);

$router->dispatch();