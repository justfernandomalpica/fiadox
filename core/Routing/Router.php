<?php declare(strict_types=1);

namespace Core\Routing;

use App\Controllers\NotFoundController;
use App\Middleware;

class Router {
    // *Private atributes
    private array $routes = [];

    // * Public methods
    public function get(string $path, callable|array $handler) : Route { return $this->addRoute('GET', $path, $handler); }
    public function put(string $path, callable|array $handler) : Route { return $this->addRoute('PUT', $path, $handler); }
    public function post(string $path, callable|array $handler) : Route { return $this->addRoute('POST', $path, $handler); }
    public function patch(string $path, callable|array $handler) : Route { return $this->addRoute('PATCH', $path, $handler); }
    public function delete(string $path, callable|array $handler) : Route { return $this->addRoute('DELETE', $path, $handler); }

    public function dispatch() : void {
        [$route, $params] = $this->resolve($_SERVER["REQUEST_METHOD"],$_SERVER["REQUEST_URI"]);
        if ($route === null) call_user_func([NotFoundController::class, "index"]);
        else $this->execute($route,$params);
        return;
    }

    // *Private Methods
    private function resolve(string $method, string $uri) : array {        
        foreach($this->routes as $current) {
            if($current->matches($method, $uri)) {
                $route = $current;
                $params = $current->extractParameters($uri);
                
                return [$route, $params];
            }
        }
        return [null, []];
    }

    private function execute(Route $route, array $params) : void {
        if(!empty($route->middlewares())) {
            foreach($route->middlewares() as $middleware){
                call_user_func([$middleware, 'handle'], $params);
            }
        }
        call_user_func($route->handler(), $params);
    }

    private function addRoute(string $method, string $path, callable|array $handler) : Route {
        $path = $this->normalizePath($path);
        $method = is_array($method) ? $method : [$method];
        $route = new Route($method, $path, $handler);
        $this->routes[] = $route;
        return $route;
    }

    private function normalizePath(string $path): string {
        if ($path !== '/') $path = rtrim($path, '/');
        return $path ?: '/';
    }
}