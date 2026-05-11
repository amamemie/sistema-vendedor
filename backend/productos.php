<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$id_tienda = $_GET['id_tienda'] ?? null;

if (!$id_tienda) {
    echo json_encode(["error" => "id_tienda requerido"]);
    exit;
}

try {
    // Traer productos con stock e imágenes
    $stmt = $conn->prepare(
        "SELECT 
            p.id_producto,
            p.nombre,
            p.descripcion,
            p.precio_unitario,
            p.estado,
            p.fecha_creacion,
            c.id_categoria,
            c.nombre AS categoria,
            COALESCE(i.stock_actual, 0) AS stock,
            -- Imagen principal (si existe en PRODUCTO_IMAGEN)
            (SELECT pi.ruta_archivo 
             FROM PRODUCTO_IMAGEN pi 
             WHERE pi.id_producto = p.id_producto AND pi.es_principal = 1 
             LIMIT 1) AS imagen_principal,
            -- Total de imágenes
            (SELECT COUNT(*) FROM PRODUCTO_IMAGEN pi WHERE pi.id_producto = p.id_producto) AS total_imagenes
         FROM PRODUCTO p
         LEFT JOIN CATEGORIA c ON c.id_categoria = p.id_categoria
         LEFT JOIN INVENTARIO i ON i.id_producto = p.id_producto
         WHERE p.id_tienda = :id_tienda
         ORDER BY p.fecha_creacion DESC"
    );
    $stmt->bindParam(":id_tienda", $id_tienda);
    $stmt->execute();

    $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convertir tipos numéricos
    foreach ($productos as &$p) {
        $p['precio_unitario'] = (float) $p['precio_unitario'];
        $p['stock']           = (int)   $p['stock'];
        $p['total_imagenes']  = (int)   $p['total_imagenes'];
    }

    echo json_encode($productos);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
