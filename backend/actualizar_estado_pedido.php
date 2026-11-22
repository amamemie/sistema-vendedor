<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_compra) || empty($data->estado)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$id_compra = (int)$data->id_compra;
$estado = $data->estado;

$estadosPermitidos = ['Pendiente', 'Pagada', 'Enviado', 'Entregado', 'Cancelado'];

if (!in_array($estado, $estadosPermitidos)) {
    echo json_encode(["success" => false, "message" => "Estado no válido"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE COMPRA SET estado = :estado WHERE id_compra = :id_compra");
    $stmt->bindParam(":estado", $estado);
    $stmt->bindParam(":id_compra", $id_compra);
    $stmt->execute();
    
    echo json_encode(["success" => true, "message" => "Estado actualizado"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>