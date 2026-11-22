<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));
$id_tienda = $data->id_tienda ?? null;
$logo_base64 = $data->logo ?? null;

if (!$id_tienda || !$logo_base64) {
    echo json_encode(["success" => false, "message" => "Faltan datos"]);
    exit;
}

try {
    $stmt = $conn->prepare("UPDATE TIENDA SET logo_url = :logo WHERE id_tienda = :id");
    $stmt->bindParam(":logo", $logo_base64);
    $stmt->bindParam(":id", $id_tienda);
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Logo actualizado"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>