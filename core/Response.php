<?php declare(strict_types=1);

namespace Core;

class Response {
    public static function success(mixed $data, int $status = 200): void {
        self::send([
            'success' => true,
            'data'    => $data,
            'error'   => null
        ], $status);
    }

    public static function error(mixed $message, int $status = 400): void {
        self::send([
            'success' => false,
            'data'    => null,
            'error'   => $message
        ], $status);
    }

    private static function send(array $body, int $status): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}