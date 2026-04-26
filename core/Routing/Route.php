<?php declare(strict_types=1);

namespace Core\Routing;

use InvalidArgumentException;

final class Route {
    private array $methods;
    private string $path;
    private $handler;

    private array $middlewares = [];
    private ?string $name = null;
    private array $constraints = [];
    private ?string $compiledRegex = null;
    private array $parameterNames = [];

    // * Getters
    public function methods() : array { return $this->methods; }
    public function path() : string { return $this->path; }
    public function handler() : callable | array { return $this->handler; }
    public function middlewares() : array { return $this->middlewares; }
    public function getName() : string { return $this->name; }
    public function parameterNames() : array { return $this->parameterNames; }

    // * Constructor
    public function __construct(array $methods, string $path, callable|array $handler) {
        $this->methods = $this->normalizeMethods($methods);
        $this->path = $this->normalizePath($path);
        $this->handler = $handler;
    }
    
    // * Public methods

    public function middleware(array|string $middleware) : self {
        $items = is_array($middleware) ? $middleware : [$middleware];
        foreach($items as $item) {
            $item = trim($item);
            if($item === '') continue;
            if(!in_array($item,$this->middlewares,true)) {
                $this->middlewares[] = $item;
            }
        }
        return $this;
    }

    public function name(string $name) : self {
        $name = trim($name);
        if($name === '') throw new \InvalidArgumentException("Name cannot be empty.");
        $this->name = $name;

        return $this;
    }
    public function where(string|array $parameter, ?string $pattern = null): self {
        if (is_array($parameter)) {
            foreach ($parameter as $key => $value) {
                $key = trim((string) $key);
                $value = trim((string) $value);

                if ($key === '' || $value === '') continue;

                $this->constraints[$key] = $value;
            }
        } else {
            $parameter = trim($parameter);
            $pattern = trim((string) $pattern);

            if ($parameter === '' || $pattern === '') throw new \InvalidArgumentException('Constraint parameter and pattern cannot be empty.');

            $this->constraints[$parameter] = $pattern;
        }

        $this->compiledRegex = null;
        $this->parameterNames = [];

        return $this;
    }

    public function allowMethod(string $method) : bool {
        return in_array(strtoupper(trim($method)),$this->methods,true);
    }
    
    public function matches(string $method, string $path) : bool {
        if (!$this->allowMethod($method)) return false;

        return $this->matchesPath($path);
    }

    protected function matchesPath(string $uri) : bool {
        $regex = $this->compile();
        $normalizedUri = $this->normalizeUri($uri);
        $result = preg_match($regex, $normalizedUri);
        if($result === false) throw new \RuntimeException("Failed to evaluate route with regex for path <{$this->path}>");

        return $result === 1;
    }

    public function extractParameters(string $uri): array {
        $regex = $this->compile();
        $normalizedUri = $this->normalizeUri($uri);

        $result = preg_match($regex, $normalizedUri, $matches);

        if ($result === false) throw new \RuntimeException("Failed to extract parameters for route [{$this->path}].");
        if ($result !== 1) return [];

        $parameters = [];

        foreach ($this->parameterNames as $name) {
            if (array_key_exists($name, $matches)) {
                $parameters[$name] = (string) $matches[$name];
            }
        }

        return $parameters;
    }

    public function buildUrl(array $params = []) : string {
         $url = preg_replace_callback(
            '/\{([a-zA-Z_][a-zA-Z0-9_-]*)\}/',
            function (array $matches) use ($params): string {
                $parameter = $matches[1];

                if (!array_key_exists($parameter, $params)) {
                    throw new \InvalidArgumentException("Missing route parameter [{$parameter}] for route [{$this->path}].");
                }

                return rawurlencode((string) $params[$parameter]);
            },
            $this->path
        );

        if ($url === null) throw new \RuntimeException("Failed to build URL for route [{$this->path}].");

        return $url;
    }

    // * Private methods

    private function compile() : string {
        if($this->compiledRegex !== null) return $this->compiledRegex;
        $this->parameterNames = [];
        
        $pattern = preg_replace_callback(
            '/\{([a-zA-Z_][a-zA-Z0-9_-]*)\}/',
            function (array $matches): string {
                $parameter = $matches[1];
                $this->parameterNames[] = $parameter;

                $constraint = $this->constraints[$parameter] ?? '[^/]+';

                return '(?P<' . $parameter . '>' . $constraint . ')';
            },
            $this->path
        );

        if ($pattern === null) throw new \RuntimeException("Failed to compile route pattern [{$this->path}].");
        $this->compiledRegex = '#^' . $pattern . '$#';

        return $this->compiledRegex;
    }
    
    private function normalizeMethods(array $methods) : array {
        if ($methods === []) throw new \InvalidArgumentException("A route must define at least one HTTP method");
        $normalized = [];
        foreach ($methods as $method) {
            $method = strtoupper($method);

            if($method === '') continue;
            if(!in_array($method,['GET','POST','PUT', 'PATCH', 'DELETE'])) throw new \InvalidArgumentException("'{$method}' is an unsupported HTTP method in this context.");
            if(in_array($method,$normalized,true)) continue;

            $normalized[] = $method;
        }
        if ($normalized === []) throw new \InvalidArgumentException("A route must define at least one HTTP method");
        return $normalized;
    }

    private function normalizePath(string $path) : string {
        $path = trim($path);

        if($path === '') throw new \InvalidArgumentException("Route path cannot be empty.");
        if($path[0] !== '/') $path = '/' . $path;
        if($path !== '/' && str_ends_with($path,'/')) $path = rtrim($path,'/');

        return $path;
    }

    private function normalizeUri(string $uri) : string {
        $path = parse_url($uri,PHP_URL_PATH);

        if(!is_string($path) || $path === '') $path = '/';
        if($path !== '/' && str_ends_with($path,'/')) $path = rtrim($path,'/');
        
        return $path;
    }
}