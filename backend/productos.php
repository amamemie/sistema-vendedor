<?php
// backend/productos.php
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

$id_vendedor = $_GET['id_vendedor'] ?? null;  // ← AGREGAR
$id_tienda = $_GET['id_tienda'] ?? null;
$publico   = $_GET['publico'] ?? false;

try {
    $sql = "SELECT 
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio_unitario,
                p.estado,
                p.estado_admin,
                COALESCE(p.calificacion_promedio, 0) AS calificacion_promedio,
                p.imagen_principal,
                p.imagenes_extra,
                c.id_categoria,
                c.nombre AS categoria,
                t.nombre_tienda,
                t.id_tienda,
                t.id_vendedor,
                COALESCE(v.calificacion_promedio, 0) AS vendedor_calificacion,
                COALESCE(v.total_resenas, 0) AS vendedor_total_resenas,
                COALESCE(i.stock_actual, 0) AS stock
            FROM PRODUCTO p
            LEFT JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
            LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
            LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
            LEFT JOIN VENDEDOR v ON v.id_vendedor = t.id_vendedor
            WHERE 1=1";

    // Para catálogo público, solo productos aprobados y activos
    if ($publico === 'true') {
        $sql .= " AND p.estado = 'Activo' AND p.estado_admin = 'Aprobado'";
    }

    // Filtrar por vendedor (para el panel del vendedor)
    if ($id_vendedor) {
        $sql .= " AND t.id_vendedor = :id_vendedor";
    }

    // Filtrar por tienda
    if ($id_tienda && !$publico) {
        $sql .= " AND p.id_tienda = :id_tienda";
    }

    $sql .= " ORDER BY p.fecha_creacion DESC";

    $stmt = $conn->prepare($sql);
    
    if ($id_vendedor) {
        $stmt->bindParam(":id_vendedor", $id_vendedor, PDO::PARAM_INT);
    }
    if ($id_tienda && !$publico) {
        $stmt->bindParam(":id_tienda", $id_tienda, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convertir tipos numéricos
    foreach ($productos as &$p) {
        $p['precio_unitario'] = (float) $p['precio_unitario'];
        $p['stock'] = (int) $p['stock'];
        $p['calificacion_promedio'] = (float) $p['calificacion_promedio'];
        $p['id_producto'] = (int) $p['id_producto'];
        $p['id_tienda'] = $p['id_tienda'] ? (int) $p['id_tienda'] : null;
        $p['id_vendedor'] = $p['id_vendedor'] ? (int) $p['id_vendedor'] : null;
        $p['vendedor_calificacion'] = (float) $p['vendedor_calificacion'];
        $p['vendedor_total_resenas'] = (int) $p['vendedor_total_resenas'];
    }

    echo json_encode($productos);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error en la consulta: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>