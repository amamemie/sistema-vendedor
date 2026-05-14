<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

try {
    // Consulta base: todas las comisiones de pagos exitosos
    $sql = "SELECT p.id_pago, p.fecha_pago, p.monto_total as pago_total, 
                   c.porcentaje, c.monto as comision_monto
            FROM COMISION c
            JOIN PAGO p ON c.id_pago = p.id_pago
            WHERE p.estado = 'Exitoso'";
    
    $params = [];

    // Si se proporcionan fechas, se agrega el filtro
    if (!empty($data->fecha_inicio) && !empty($data->fecha_fin)) {
        $sql .= " AND p.fecha_pago BETWEEN :inicio AND :fin";
        $params[':inicio'] = $data->fecha_inicio . ' 00:00:00';
        $params[':fin'] = $data->fecha_fin . ' 23:59:59';
    }

    $sql .= " ORDER BY p.fecha_pago DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    
    $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $total = array_sum(array_column($detalles, 'comision_monto'));

    echo json_encode(["success" => true, "total" => $total, "detalles" => $detalles]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}