<?php
// backend/productos_pendientes.php
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

try {
    $stmt = $conn->prepare("
        SELECT 
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio_unitario,
            p.estado,
            p.estado_admin,
            p.imagen_principal,
            p.fecha_creacion,
            t.id_tienda,
            t.nombre_tienda,
            v.id_vendedor,
            v.nombres as vendedor_nombre,
            v.apellidos as vendedor_apellido,
            v.email as vendedor_email,
            c.nombre as categoria
        FROM PRODUCTO p
        LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
        LEFT JOIN VENDEDOR v ON v.id_vendedor = t.id_vendedor
        LEFT JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
        WHERE p.estado_admin = 'Pendiente' OR p.estado_admin IS NULL
        ORDER BY p.fecha_creacion DESC
    ");
    $stmt->execute();
    
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatear nombres de vendedor
    foreach ($productos as &$p) {
        $p['vendedor_nombre_completo'] = trim(($p['vendedor_nombre'] ?? '') . ' ' . ($p['vendedor_apellido'] ?? ''));
        if (empty($p['vendedor_nombre_completo'])) {
            $p['vendedor_nombre_completo'] = $p['vendedor_email'] ?? 'Vendedor desconocido';
        }
        $p['precio_unitario'] = (float) $p['precio_unitario'];
    }
    
    echo json_encode($productos);
    
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>