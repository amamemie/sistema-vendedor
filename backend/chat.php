<?php
// backend/chat.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id_comprador = $_GET['id_comprador'] ?? null;
$id_vendedor = $_GET['id_vendedor'] ?? null;
$id_producto = $_GET['id_producto'] ?? null;

if ($method === 'GET') {
    // Obtener mensajes del chat
    if (!$id_producto) {
        echo json_encode(["success" => false, "message" => "Falta id_producto"]);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("
            SELECT id_resena, mensaje, emisor, leido, fecha
            FROM RESENA
            WHERE id_producto = :id_producto 
              AND tipo = 'chat'
            ORDER BY fecha ASC
        ");
        $stmt->bindParam(":id_producto", $id_producto);
        $stmt->execute();
        
        $mensajes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "mensajes" => $mensajes]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Enviar mensaje
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->id_producto) || empty($data->mensaje) || empty($data->emisor)) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }
    
    try {
        // Obtener un id_usuario por defecto si no viene (usar el admin o null)
        $id_usuario = $data->id_usuario ?? null;
        
        // Si no hay id_usuario, buscar un usuario por rol
        if (!$id_usuario) {
            $stmtUser = $conn->prepare("SELECT id_usuario FROM CUENTA_USUARIO WHERE rol = 'Admin' LIMIT 1");
            $stmtUser->execute();
            $user = $stmtUser->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                $id_usuario = $user['id_usuario'];
            }
        }
        
        $stmt = $conn->prepare("
            INSERT INTO RESENA (id_producto, id_usuario, mensaje, emisor, tipo, fecha, leido, calificacion)
            VALUES (:id_producto, :id_usuario, :mensaje, :emisor, 'chat', NOW(), 0, NULL)
        ");
        $stmt->bindParam(":id_producto", $data->id_producto);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":mensaje", $data->mensaje);
        $stmt->bindParam(":emisor", $data->emisor);
        $stmt->execute();
        
        echo json_encode(["success" => true, "message" => "Mensaje enviado"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "Error DB: " . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
?>