<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
try {
    $sql = "SELECT v.id_vendedor, v.nombres, v.apellidos, v.email,
                   COUNT(DISTINCT c.id_compra) as total_pedidos,
                   COALESCE(SUM(p.monto_total), 0) as total_ventas
            FROM VENDEDOR v
            JOIN TIENDA t ON v.id_vendedor = t.id_vendedor
            JOIN COMPRA c ON t.id_tienda = c.id_tienda
            JOIN PAGO p ON c.id_compra = p.id_compra
            WHERE p.estado = 'Exitoso'";
    $params = [];
    if (!empty($data->fecha_inicio) && !empty($data->fecha_fin)) {
        $sql .= " AND p.fecha_pago BETWEEN :inicio AND :fin";
        $params[':inicio'] = $data->fecha_inicio . ' 00:00:00';
        $params[':fin'] = $data->fecha_fin . ' 23:59:59';
    }
    $sql .= " GROUP BY v.id_vendedor ORDER BY total_ventas DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["success" => true, "detalles" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}