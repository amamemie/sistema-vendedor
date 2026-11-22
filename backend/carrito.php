<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

session_start();

// Inicializar carrito si no existe
if (!isset($_SESSION['carrito'])) {
    $_SESSION['carrito'] = [];
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Obtener carrito
        echo json_encode(["success" => true, "carrito" => array_values($_SESSION['carrito'])]);
        break;

    case 'POST':
        // Agregar producto al carrito
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id_producto) || empty($data->nombre) || empty($data->precio)) {
            echo json_encode(["success" => false, "message" => "Datos del producto incompletos"]);
            exit;
        }

        $encontrado = false;
        foreach ($_SESSION['carrito'] as &$item) {
            if ($item['id_producto'] == $data->id_producto) {
                $item['cantidad'] += ($data->cantidad ?? 1);
                $encontrado = true;
                break;
            }
        }

        if (!$encontrado) {
            $_SESSION['carrito'][] = [
                'id_producto' => $data->id_producto,
                'nombre'      => $data->nombre,
                'precio'      => $data->precio,
                'cantidad'    => $data->cantidad ?? 1,
                'imagen'      => $data->imagen ?? null
            ];
        }

        echo json_encode(["success" => true, "carrito" => array_values($_SESSION['carrito'])]);
        break;

    case 'DELETE':
        // Eliminar producto del carrito
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->id_producto)) {
            foreach ($_SESSION['carrito'] as $key => $item) {
                if ($item['id_producto'] == $data->id_producto) {
                    unset($_SESSION['carrito'][$key]);
                    break;
                }
            }
            $_SESSION['carrito'] = array_values($_SESSION['carrito']);
        }
        
        echo json_encode(["success" => true, "carrito" => array_values($_SESSION['carrito'])]);
        break;

    default:
        echo json_encode(["success" => false, "message" => "Método no permitido"]);
        break;
}
?>