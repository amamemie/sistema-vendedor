<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_usuario) || empty($data->rol)) {
    echo json_encode(["success" => false, "message" => "id_usuario y rol requeridos"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE CUENTA_USUARIO SET rol = :rol WHERE id_usuario = :id");
    $stmt->bindParam(":rol", $data->rol);
    $stmt->bindParam(":id", $data->id_usuario);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Rol actualizado correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>