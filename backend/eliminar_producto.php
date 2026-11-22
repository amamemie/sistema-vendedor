<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_producto)) {
    echo json_encode(["success" => false, "message" => "id_producto requerido"]);
    exit;
}

try {
    // Cambiar estado a 'Inactivo' (soft delete)
    $stmt = $conn->prepare(
        "UPDATE PRODUCTO SET estado = 'Inactivo' WHERE id_producto = :id_producto"
    );
    $stmt->bindParam(":id_producto", $data->id_producto);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Producto desactivado correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>