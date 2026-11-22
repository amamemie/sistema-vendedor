<?php
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

if (empty($data->id_compra)) {
    echo json_encode(["success" => false, "message" => "ID de compra requerido"]);
    exit;
}

$id_compra = (int)$data->id_compra;

try {
    // Verificar que el pedido esté pendiente
    $check = $conn->prepare("SELECT estado FROM COMPRA WHERE id_compra = :id_compra");
    $check->bindParam(":id_compra", $id_compra);
    $check->execute();
    $pedido = $check->fetch(PDO::FETCH_ASSOC);
    
    if (!$pedido) {
        echo json_encode(["success" => false, "message" => "Pedido no encontrado"]);
        exit;
    }
    
    if ($pedido['estado'] !== 'Pendiente') {
        echo json_encode(["success" => false, "message" => "Solo se pueden cancelar pedidos pendientes"]);
        exit;
    }
    
    // Cancelar pedido
    $stmt = $conn->prepare("
        UPDATE COMPRA 
        SET estado = 'Cancelada', cancelada = 1 
        WHERE id_compra = :id_compra
    ");
    $stmt->bindParam(":id_compra", $id_compra);
    $stmt->execute();
    
    // Restaurar stock de productos
    $getProductos = $conn->prepare("
        SELECT id_producto, cantidad FROM DETALLE_COMPRA WHERE id_compra = :id_compra
    ");
    $getProductos->bindParam(":id_compra", $id_compra);
    $getProductos->execute();
    $productos = $getProductos->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($productos as $producto) {
        $updateStock = $conn->prepare("
            UPDATE INVENTARIO 
            SET stock_actual = stock_actual + :cantidad
            WHERE id_producto = :id_producto
        ");
        $updateStock->bindParam(":cantidad", $producto['cantidad']);
        $updateStock->bindParam(":id_producto", $producto['id_producto']);
        $updateStock->execute();
    }
    
    echo json_encode(["success" => true, "message" => "Pedido cancelado"]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>