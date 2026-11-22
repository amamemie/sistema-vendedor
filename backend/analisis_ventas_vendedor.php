<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
    // 1. Productos más vendidos (con más detalles)
    $productosTop = $conn->prepare("
        SELECT 
            p.id_producto,
            p.nombre,
            p.precio_unitario,
            p.imagen_principal,
            SUM(dc.cantidad) as total_vendido,
            SUM(dc.subtotal) as total_ganado,
            COUNT(DISTINCT c.id_compra) as veces_comprado
        FROM PRODUCTO p
        JOIN DETALLE_COMPRA dc ON dc.id_producto = p.id_producto
        JOIN COMPRA c ON c.id_compra = dc.id_compra
        JOIN TIENDA t ON t.id_tienda = p.id_tienda
        WHERE t.id_vendedor = :id_vendedor AND c.estado NOT IN ('Cancelado')
        GROUP BY p.id_producto
        ORDER BY total_vendido DESC
        LIMIT 20
    ");
    $productosTop->bindParam(":id_vendedor", $id_vendedor);
    $productosTop->execute();
    $productos_mas_vendidos = $productosTop->fetchAll(PDO::FETCH_ASSOC);

    // 2. Clientes que más compran
    $clientesTop = $conn->prepare("
        SELECT 
            comp.id_comprador,
            comp.nombres,
            comp.apellidos,
            comp.email,
            comp.telefono,
            COUNT(c.id_compra) as total_pedidos,
            SUM(c.total_bruto) as total_gastado,
            AVG(c.total_bruto) as ticket_promedio
        FROM COMPRA c
        JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
        JOIN TIENDA t ON t.id_tienda = c.id_tienda
        WHERE t.id_vendedor = :id_vendedor AND c.estado NOT IN ('Cancelado')
        GROUP BY comp.id_comprador
        ORDER BY total_gastado DESC
        LIMIT 20
    ");
    $clientesTop->bindParam(":id_vendedor", $id_vendedor);
    $clientesTop->execute();
    $clientes_frecuentes = $clientesTop->fetchAll(PDO::FETCH_ASSOC);

    // 3. Resumen por estado
    $estados = $conn->prepare("
        SELECT 
            c.estado,
            COUNT(c.id_compra) as cantidad,
            SUM(c.total_bruto) as total_ventas
        FROM COMPRA c
        JOIN TIENDA t ON t.id_tienda = c.id_tienda
        WHERE t.id_vendedor = :id_vendedor
        GROUP BY c.estado
        ORDER BY cantidad DESC
    ");
    $estados->bindParam(":id_vendedor", $id_vendedor);
    $estados->execute();
    $resumen_estados = $estados->fetchAll(PDO::FETCH_ASSOC);

    // 4. Productos más cancelados
    $productosCancelados = $conn->prepare("
        SELECT 
            p.id_producto,
            p.nombre,
            p.imagen_principal,
            COUNT(c.id_compra) as veces_cancelado
        FROM PRODUCTO p
        JOIN DETALLE_COMPRA dc ON dc.id_producto = p.id_producto
        JOIN COMPRA c ON c.id_compra = dc.id_compra
        JOIN TIENDA t ON t.id_tienda = p.id_tienda
        WHERE t.id_vendedor = :id_vendedor AND c.estado = 'Cancelado'
        GROUP BY p.id_producto
        ORDER BY veces_cancelado DESC
        LIMIT 10
    ");
    $productosCancelados->bindParam(":id_vendedor", $id_vendedor);
    $productosCancelados->execute();
    $productos_mas_cancelados = $productosCancelados->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "productos_mas_vendidos" => $productos_mas_vendidos,
        "clientes_frecuentes" => $clientes_frecuentes,
        "resumen_estados" => $resumen_estados,
        "productos_mas_cancelados" => $productos_mas_cancelados
    ]);

} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>