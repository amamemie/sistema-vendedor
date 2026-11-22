<?php
// backend/pedidos_vendedor.php
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

$id_vendedor = $_GET['id_vendedor'] ?? null;

if (!$id_vendedor) {
    echo json_encode(["error" => "id_vendedor requerido"]);
    exit;
}

try {
    $stmt = $conn->prepare("
    SELECT 
        c.id_compra,
        c.fecha_compra,
        COALESCE(c.total_bruto, 0) as total_bruto,
        c.estado,  -- Esto debe traer 'Pendiente', 'Pagada', 'Enviado', 'Entregado', 'Cancelado'
        c.solicita_devolucion,
        COALESCE(c.cancelada, 0) as cancelada,
        comp.id_comprador,
        comp.nombres as cliente_nombre,
        comp.apellidos as cliente_apellido,
        comp.email as cliente_email,
        t.nombre_tienda,
        t.id_tienda
    FROM COMPRA c
    LEFT JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
    LEFT JOIN TIENDA t ON t.id_tienda = c.id_tienda
    WHERE t.id_vendedor = :id_vendedor
    ORDER BY c.fecha_compra DESC
");
    $stmt->bindParam(":id_vendedor", $id_vendedor, PDO::PARAM_INT);
    $stmt->execute();
    
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Para cada pedido, obtener sus detalles (productos)
    foreach ($pedidos as &$pedido) {
        $stmt2 = $conn->prepare("
            SELECT 
                dc.id_detalle_compra,
                dc.cantidad,
                dc.precio_unitario,
                dc.subtotal,
                dc.devuelto,
                p.id_producto,
                p.nombre,
                p.imagen_principal
            FROM DETALLE_COMPRA dc
            LEFT JOIN PRODUCTO p ON p.id_producto = dc.id_producto
            WHERE dc.id_compra = :id_compra
        ");
        $stmt2->bindParam(":id_compra", $pedido['id_compra'], PDO::PARAM_INT);
        $stmt2->execute();
        $pedido['detalles'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear cliente nombre completo
        $pedido['cliente_nombre_completo'] = trim($pedido['cliente_nombre'] . ' ' . $pedido['cliente_apellido']);
    }
    
    echo json_encode($pedidos);
    
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>