<?php
// backend/actualizar_perfil_vendedor.php
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

$id_vendedor = $data->id_vendedor ?? null;
$nombres = $data->nombres ?? '';
$apellidos = $data->apellidos ?? '';
$telefono = $data->telefono ?? '';
$nombre_tienda = $data->nombre_tienda ?? '';
$descripcion_tienda = $data->descripcion_tienda ?? '';
$direccion = $data->direccion ?? '';
$ciudad = $data->ciudad ?? '';
$nit_rut = $data->nit_rut ?? '';

if (!$id_vendedor) {
    echo json_encode(["success" => false, "message" => "ID de vendedor requerido"]);
    exit;
}

try {
    $conn->beginTransaction();
    
    // Actualizar datos del vendedor
    $stmt1 = $conn->prepare("
        UPDATE VENDEDOR 
        SET nombres = :nombres, 
            apellidos = :apellidos, 
            telefono = :telefono
        WHERE id_vendedor = :id_vendedor
    ");
    $stmt1->bindParam(":nombres", $nombres);
    $stmt1->bindParam(":apellidos", $apellidos);
    $stmt1->bindParam(":telefono", $telefono);
    $stmt1->bindParam(":id_vendedor", $id_vendedor);
    $stmt1->execute();
    
    // Actualizar datos de la tienda
    $stmt2 = $conn->prepare("
        UPDATE TIENDA 
        SET nombre_tienda = :nombre_tienda,
            descripcion = :descripcion
        WHERE id_vendedor = :id_vendedor
    ");
    $stmt2->bindParam(":nombre_tienda", $nombre_tienda);
    $stmt2->bindParam(":descripcion", $descripcion_tienda);
    $stmt2->bindParam(":id_vendedor", $id_vendedor);
    $stmt2->execute();
    
    // Actualizar perfil del vendedor (dirección)
    $stmt3 = $conn->prepare("
        UPDATE PERFIL_VENDEDOR 
        SET direccion = :direccion,
            ciudad = :ciudad,
            documento_identidad = :nit_rut
        WHERE id_vendedor = :id_vendedor
    ");
    $stmt3->bindParam(":direccion", $direccion);
    $stmt3->bindParam(":ciudad", $ciudad);
    $stmt3->bindParam(":nit_rut", $nit_rut);
    $stmt3->bindParam(":id_vendedor", $id_vendedor);
    $stmt3->execute();
    
    $conn->commit();
    
    echo json_encode(["success" => true, "message" => "Perfil actualizado"]);
    
} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>