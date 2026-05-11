<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

// Validaciones
if (empty($data->nombre) || empty($data->precio_unitario) || empty($data->id_tienda) || empty($data->id_categoria)) {
    echo json_encode(["success" => false, "message" => "Nombre, precio, tienda y categoría son requeridos"]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Insertar producto
    // id_ubicacion = 1 por defecto (Almacén Central), ajustable después
    $stmt = $conn->prepare(
        "INSERT INTO PRODUCTO (id_tienda, id_categoria, id_ubicacion, nombre, descripcion, precio_unitario, estado)
         VALUES (:id_tienda, :id_categoria, 1, :nombre, :descripcion, :precio, 'Activo')"
    );
    $descripcion = $data->descripcion ?? '';
    $stmt->bindParam(":id_tienda",    $data->id_tienda);
    $stmt->bindParam(":id_categoria", $data->id_categoria);
    $stmt->bindParam(":nombre",       $data->nombre);
    $stmt->bindParam(":descripcion",  $descripcion);
    $stmt->bindParam(":precio",       $data->precio_unitario);
    $stmt->execute();

    $id_producto = $conn->lastInsertId();

    // 2. Insertar inventario
    $stock = $data->stock ?? 0;
    $invStmt = $conn->prepare(
        "INSERT INTO INVENTARIO (id_producto, stock_actual, stock_minimo)
         VALUES (:id_producto, :stock, 5)"
    );
    $invStmt->bindParam(":id_producto", $id_producto);
    $invStmt->bindParam(":stock",       $stock);
    $invStmt->execute();

    $conn->commit();

    echo json_encode([
        "success"     => true,
        "message"     => "Producto creado correctamente",
        "id_producto" => $id_producto
    ]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
