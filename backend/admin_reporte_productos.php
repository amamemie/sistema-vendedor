<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
try {
    $sql = "SELECT pr.id_producto, pr.nombre, t.nombre_tienda,
                   SUM(dc.cantidad) as total_unidades,
                   SUM(dc.subtotal) as total_monto
            FROM PRODUCTO pr
            JOIN DETALLE_COMPRA dc ON pr.id_producto = dc.id_producto
            JOIN COMPRA c ON dc.id_compra = c.id_compra
            JOIN PAGO p ON c.id_compra = p.id_compra
            JOIN TIENDA t ON pr.id_tienda = t.id_tienda
            WHERE p.estado = 'Exitoso'";
    $params = [];
    if (!empty($data->fecha_inicio) && !empty($data->fecha_fin)) {
        $sql .= " AND p.fecha_pago BETWEEN :inicio AND :fin";
        $params[':inicio'] = $data->fecha_inicio . ' 00:00:00';
        $params[':fin'] = $data->fecha_fin . ' 23:59:59';
    }
    $sql .= " GROUP BY pr.id_producto ORDER BY total_unidades DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["success" => true, "detalles" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}