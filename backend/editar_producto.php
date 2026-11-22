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
    // Actualizar datos del producto
    $stmt = $conn->prepare(
        "UPDATE PRODUCTO 
         SET nombre = :nombre, 
             descripcion = :descripcion, 
             precio_unitario = :precio,
             id_categoria = :id_categoria
         WHERE id_producto = :id_producto"
    );
    $stmt->bindParam(":nombre",       $data->nombre);
    $stmt->bindParam(":descripcion",  $data->descripcion);
    $stmt->bindParam(":precio",       $data->precio_unitario);
    $stmt->bindParam(":id_categoria", $data->id_categoria);
    $stmt->bindParam(":id_producto",  $data->id_producto);
    $stmt->execute();

    // Actualizar stock en INVENTARIO
    if (isset($data->stock)) {
        $invStmt = $conn->prepare(
            "UPDATE INVENTARIO SET stock_actual = :stock WHERE id_producto = :id_producto"
        );
        $invStmt->bindParam(":stock", $data->stock);
        $invStmt->bindParam(":id_producto", $data->id_producto);
        $invStmt->execute();
    }

    echo json_encode(["success" => true, "message" => "Producto actualizado correctamente"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>