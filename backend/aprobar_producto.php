<?php
// backend/aprobar_producto.php
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

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_producto) || empty($data->estado_admin)) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

try {
    $estado = $data->estado_admin;
    $motivo = $data->motivo ?? null;
    
    $sql = "UPDATE PRODUCTO SET estado_admin = :estado, fecha_aprobacion = NOW()";
    
    if ($motivo) {
        $sql .= ", rechazo_motivo = :motivo";
    }
    
    $sql .= " WHERE id_producto = :id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":estado", $estado);
    $stmt->bindParam(":id", $data->id_producto);
    if ($motivo) {
        $stmt->bindParam(":motivo", $motivo);
    }
    $stmt->execute();
    
    echo json_encode(["success" => true, "message" => "Producto " . ($estado === 'Aprobado' ? 'aprobado' : 'actualizado')]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>