<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_compra) || empty($data->motivo)) {
    echo json_encode(["success" => false, "message" => "id_compra y motivo requeridos"]);
    exit;
}

try {
    $stmt = $conn->prepare(
        "UPDATE COMPRA 
         SET solicita_devolucion = 'Pendiente', 
             devolucion_motivo = :motivo, 
             devolucion_fecha_solicitud = NOW() 
         WHERE id_compra = :id"
    );
    $stmt->bindParam(":motivo", $data->motivo);
    $stmt->bindParam(":id", $data->id_compra);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Solicitud de devolución enviada correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>