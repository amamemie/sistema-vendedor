<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$id_usuario = $_GET['id_usuario'] ?? null;
$ultima_revision = $_GET['ultima_revision'] ?? null;
$action = $_GET['action'] ?? 'ver';

if (!$id_usuario) {
    echo json_encode(["error" => "id_usuario requerido"]);
    exit;
}

try {
    if ($action === 'ver') {
        // Obtener notificaciones no leídas
        $stmt = $conn->prepare("
            SELECT COUNT(*) as total, MAX(fecha_creacion) as ultima 
            FROM NOTIFICACION_TEMP 
            WHERE id_usuario = :id AND leida = 0
        ");
        $stmt->bindParam(":id", $id_usuario);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "total" => (int)$result['total'],
            "ultima" => $result['ultima'],
            "mensajes" => [] // Por ahora vacío, se puede expandir
        ]);
    } elseif ($action === 'marcar_leidas') {
        $stmt = $conn->prepare("UPDATE NOTIFICACION_TEMP SET leida = 1 WHERE id_usuario = :id");
        $stmt->bindParam(":id", $id_usuario);
        $stmt->execute();
        echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>