<?php
// backend/reporte_ventas_vendedor.php
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
$fecha_inicio = $_GET['fecha_inicio'] ?? null;
$fecha_fin = $_GET['fecha_fin'] ?? null;

if (!$id_vendedor) {
    echo json_encode(["error" => "id_vendedor requerido"]);
    exit;
}

try {
    $sql = "
        SELECT 
            c.id_compra,
            c.fecha_compra,
            c.total_bruto,
            c.estado,
            comp.nombres as cliente_nombre,
            comp.apellidos as cliente_apellido,
            t.nombre_tienda
        FROM COMPRA c
        LEFT JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
        LEFT JOIN TIENDA t ON t.id_tienda = c.id_tienda
        WHERE t.id_vendedor = :id_vendedor
    ";
    
    if ($fecha_inicio && $fecha_fin) {
        $sql .= " AND DATE(c.fecha_compra) BETWEEN :fecha_inicio AND :fecha_fin";
    }
    
    $sql .= " ORDER BY c.fecha_compra DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(":id_vendedor", $id_vendedor, PDO::PARAM_INT);
    
    if ($fecha_inicio && $fecha_fin) {
        $stmt->bindParam(":fecha_inicio", $fecha_inicio);
        $stmt->bindParam(":fecha_fin", $fecha_fin);
    }
    
    $stmt->execute();
    $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($ventas as &$v) {
        $v['total_bruto'] = (float) $v['total_bruto'];
        $v['cliente_nombre_completo'] = trim($v['cliente_nombre'] . ' ' . $v['cliente_apellido']);
    }
    
    echo json_encode($ventas);
    
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>