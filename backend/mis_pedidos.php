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

$id_usuario = $_GET['id_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode(["error" => "id_usuario requerido"]);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT 
            c.id_compra,
            c.fecha_compra,
            c.total_bruto,
            c.estado,
            c.solicita_devolucion,
            c.cancelada,
            t.nombre_tienda,
            t.id_tienda
        FROM COMPRA c
        LEFT JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
        LEFT JOIN TIENDA t ON t.id_tienda = c.id_tienda
        WHERE comp.id_usuario = :id_usuario
        ORDER BY c.fecha_compra DESC
    ");
    $stmt->bindParam(":id_usuario", $id_usuario);
    $stmt->execute();
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Para cada pedido, obtener sus detalles
    foreach ($pedidos as &$pedido) {
        $stmt2 = $conn->prepare("
            SELECT 
                dc.id_detalle_compra,
                dc.cantidad,
                dc.precio_unitario,
                dc.subtotal,
                dc.devuelto,
                p.id_producto,
                p.nombre AS producto_nombre,
                p.imagen_principal
            FROM DETALLE_COMPRA dc
            LEFT JOIN PRODUCTO p ON p.id_producto = dc.id_producto
            WHERE dc.id_compra = :id_compra
        ");
        $stmt2->bindParam(":id_compra", $pedido['id_compra']);
        $stmt2->execute();
        $pedido['detalles'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        // Si total_bruto es NULL, calcularlo
        if ($pedido['total_bruto'] == 0 || $pedido['total_bruto'] == null) {
            $total = 0;
            foreach ($pedido['detalles'] as $detalle) {
                $total += $detalle['subtotal'] ?? ($detalle['cantidad'] * $detalle['precio_unitario']);
            }
            $pedido['total_bruto'] = $total;
        }
    }
    
    echo json_encode($pedidos);
    
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>