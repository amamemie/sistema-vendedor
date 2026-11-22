<?php
// backend/comprar.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

// Validar datos requeridos
if (empty($data->id_comprador) || empty($data->id_tienda) || empty($data->carrito)) {
    echo json_encode([
        "success" => false, 
        "message" => "Datos de compra incompletos",
        "debug" => [
            "id_comprador" => $data->id_comprador ?? 'missing',
            "id_tienda" => $data->id_tienda ?? 'missing',
            "carrito" => empty($data->carrito) ? 'empty' : 'ok'
        ]
    ]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Calcular el total del carrito
    $total = 0;
    foreach ($data->carrito as $item) {
        $cantidad = (int)$item['cantidad'];
        $precio = (float)$item['precio'];
        $total += $precio * $cantidad;
    }

    // 2. Crear la compra con estado 'Pagada' (porque el pago se procesa)
    $estado = 'Pagada';
   // En comprar.php, al insertar la compra:
$stmt = $conn->prepare("
    INSERT INTO COMPRA (id_comprador, id_tienda, fecha_compra, estado, total_bruto) 
    VALUES (:id_comprador, :id_tienda, NOW(), 'Pagada', :total)
");
    $stmt->bindParam(":id_comprador", $data->id_comprador);
    $stmt->bindParam(":id_tienda", $data->id_tienda);
    $stmt->bindParam(":estado", $estado);
    $stmt->bindParam(":total", $total);
    $stmt->execute();
    $id_compra = $conn->lastInsertId();

    // 3. Insertar detalle de compra y actualizar stock
    foreach ($data->carrito as $item) {
        $cantidad = (int)$item['cantidad'];
        $precio = (float)$item['precio'];
        $subtotal = $precio * $cantidad;
        
        // Insertar detalle
        $detalle = $conn->prepare("
            INSERT INTO DETALLE_COMPRA (id_compra, id_producto, cantidad, precio_unitario, subtotal)
            VALUES (:id_compra, :id_producto, :cantidad, :precio, :subtotal)
        ");
        $detalle->bindParam(":id_compra", $id_compra);
        $detalle->bindParam(":id_producto", $item['id_producto']);
        $detalle->bindParam(":cantidad", $cantidad);
        $detalle->bindParam(":precio", $precio);
        $detalle->bindParam(":subtotal", $subtotal);
        $detalle->execute();

        // Actualizar stock en INVENTARIO
        $updateStock = $conn->prepare("
            UPDATE INVENTARIO 
            SET stock_actual = stock_actual - :cantidad, 
                fecha_actualizacion = NOW()
            WHERE id_producto = :id_producto
        ");
        $updateStock->bindParam(":cantidad", $cantidad);
        $updateStock->bindParam(":id_producto", $item['id_producto']);
        $updateStock->execute();
    }

    // 4. Crear registro de pago (exitoso)
    $metodo_pago = $data->metodo_pago ?? 'Tarjeta';
    $pago = $conn->prepare("
        INSERT INTO PAGO (id_compra, metodo_pago, estado, monto_total, fecha_pago, referencia_transaccion)
        VALUES (:id_compra, :metodo, 'Exitoso', :total, NOW(), :referencia)
    ");
    $referencia = 'TXN-' . time() . '-' . rand(1000, 9999);
    $pago->bindParam(":id_compra", $id_compra);
    $pago->bindParam(":metodo", $metodo_pago);
    $pago->bindParam(":total", $total);
    $pago->bindParam(":referencia", $referencia);
    $pago->execute();
    $id_pago = $conn->lastInsertId();

    // 5. Calcular comisión (3%)
    $comision_monto = $total * 0.03;
    $comision = $conn->prepare("
        INSERT INTO COMISION (id_pago, porcentaje, monto) 
        VALUES (:id_pago, 3.00, :monto)
    ");
    $comision->bindParam(":id_pago", $id_pago);
    $comision->bindParam(":monto", $comision_monto);
    $comision->execute();
    $id_comision = $conn->lastInsertId();

    // 6. Dispersión al vendedor (97%)
    $id_vendedor = $data->id_vendedor ?? null;
    if ($id_vendedor) {
        $neto_vendedor = $total * 0.97;
        $dispersion = $conn->prepare("
            INSERT INTO DISPERSION (id_comision, id_vendedor, porcentaje, monto, fecha_dispersion, estado)
            VALUES (:id_comision, :id_vendedor, 97.00, :monto, NOW(), 'Pendiente')
        ");
        $dispersion->bindParam(":id_comision", $id_comision);
        $dispersion->bindParam(":id_vendedor", $id_vendedor);
        $dispersion->bindParam(":monto", $neto_vendedor);
        $dispersion->execute();
    }

    // 7. Vaciar carrito de la sesión
    if (isset($_SESSION['carrito'])) {
        unset($_SESSION['carrito']);
    }

    $conn->commit();

    echo json_encode([
        "success" => true, 
        "message" => "✅ Compra realizada con éxito",
        "id_compra" => $id_compra,
        "id_pago" => $id_pago,
        "total" => $total
    ]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false, 
        "message" => "Error de base de datos: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode([
        "success" => false, 
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>