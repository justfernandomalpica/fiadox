# FiaDOX

Aplicación web privada para administración de clientes, registros de fiado, pagos y balances generales en un entorno comercial pequeño.

**Release oficial:** https://fiadox.domcloud.dev

FiaDOX es una herramienta de uso privado. Por esa razón, la versión pública del sitio solo permite visualizar la pantalla de inicio de sesión.

## Descripción general

FiaDOX fue desarrollado como una solución web para centralizar el control de clientes y movimientos de fiado. El proyecto busca resolver una necesidad operativa concreta: registrar cargos, pagos y balances de forma estructurada, manteniendo la información disponible desde un entorno web privado.

El trabajo se enfocó principalmente en la construcción del backend, la definición de la arquitectura interna, la conexión con base de datos y la exposición de endpoints para operar la información desde la interfaz web.

## Alcance del proyecto

El sistema contempla las siguientes funciones principales:

- Inicio y cierre de sesión para acceso privado.
- Consulta de sesión activa.
- Registro, consulta, actualización y eliminación de clientes.
- Registro de transacciones asociadas a clientes.
- Consulta paginada de clientes y transacciones.
- Búsqueda de clientes por nombre.
- Cálculo de balance por cliente.
- Cálculo de balance general del sistema.
- Respuestas estructuradas en formato JSON.
- Registro básico de eventos relevantes mediante logs.

## Trabajo realizado

- Diseño de una estructura MVC propia en PHP.
- Implementación de rutas para métodos GET, POST, PUT y DELETE.
- Creación de controladores para autenticación, clientes y transacciones.
- Desarrollo de modelos para usuarios, clientes y movimientos.
- Modelado de base de datos MySQL con relaciones entre clientes y transacciones.
- Implementación de una capa Active Record personalizada para operaciones CRUD.
- Validación de datos desde modelos y controladores.
- Manejo de sesiones para proteger rutas privadas.
- Definición de una clase centralizada para respuestas JSON.
- Pruebas de endpoints y flujo de datos con Postman.
- Despliegue en hosting mediante Git y SSH.

## Tecnologías utilizadas

- PHP
- MySQL
- HTML
- CSS
- JavaScript
- Composer
- Dotenv
- Git
- Postman

## Arquitectura general

El proyecto está organizado en capas para separar responsabilidades:

- `app/Controllers`: lógica de entrada para autenticación, clientes y transacciones.
- `app/Models`: representación de entidades principales del sistema.
- `app/Middleware`: protección de rutas privadas.
- `core/Database`: conexión a base de datos y Active Record personalizado.
- `core/Routing`: sistema de rutas propio.
- `core/Response.php`: respuestas JSON centralizadas.
- `public/`: punto de entrada público, recursos estáticos e interfaz web.
- `config/`: configuración general del proyecto.

## Base de datos

La base de datos está compuesta por tres entidades principales:

- `users`: usuarios administradores del sistema.
- `clients`: clientes registrados.
- `transactions`: movimientos de cargo o pago asociados a clientes.

La relación principal se establece entre clientes y transacciones, permitiendo calcular balances individuales y globales a partir de los movimientos registrados.

## Enfoque técnico

El proyecto fue desarrollado con énfasis en comprender y controlar la estructura interna de una aplicación web hecha en PHP. En lugar de partir de un framework externo, se implementaron componentes propios para rutas, modelos, controladores, middleware, respuestas y acceso a datos.

Esto permitió trabajar de forma directa conceptos como separación de responsabilidades, flujo de petición y respuesta, persistencia de datos, validación, sesiones, endpoints y despliegue de una aplicación funcional en entorno web.

## Estado del proyecto

Aplicación funcional desplegada en entorno web privado.
