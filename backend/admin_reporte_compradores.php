<?php
include_once 'config.php';
$data = json_decode(file_get_contents("php://input"));
try {
    $sql = "SELECT c.id_comprador, c.nombres, c.apellidos, c.email,
                   COUNT(co.id_compra) as total_compras,
                   COALESCE(SUM(p.monto_total), 0) as total_gastado
            FROM COMPRADOR c
            LEFT JOIN COMPRA co ON c.id_comprador = co.id_comprador
            LEFT JOIN PAGO p ON co.id_compra = p.id_compra AND p.estado = 'Exitoso'";
    $params = [];
    if (!empty($data->fecha_inicio) && !empty($data->fecha_fin)) {
        $sql .= " WHERE p.fecha_pago BETWEEN :inicio AND :fin";
        $params[':inicio'] = $data->fecha_inicio . ' 00:00:00';
        $params[':fin'] = $data->fecha_fin . ' 23:59:59';
    }
    $sql .= " GROUP BY c.id_comprador ORDER BY total_gastado DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    echo json_encode(["success" => true, "detalles" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}