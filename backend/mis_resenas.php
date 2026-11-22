<?php
// backend/mis_resenas.php - SOLO PARA RESEÑAS DEL USUARIO
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$id_usuario = $_GET['id_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode(["error" => "id_usuario requerido"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT r.id_resena, r.calificacion, r.comentario, r.fecha,
               p.nombre AS producto, p.imagen_principal,
               t.nombre_tienda
        FROM RESENA r
        LEFT JOIN PRODUCTO p ON p.id_producto = r.id_producto
        LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
        WHERE r.id_usuario = :id_usuario AND r.tipo = 'reseña'
        ORDER BY r.fecha DESC
    ");
    $stmt->bindParam(":id_usuario", $id_usuario);
    $stmt->execute();
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>