<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once 'config.php';

try {
    // 1. Compradores totales
    $stmt1 = $conn->query("SELECT COUNT(*) as total FROM COMPRADOR");
    $compradores = $stmt1->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 2. Vendedores activos
    $stmt2 = $conn->query("SELECT COUNT(*) as total FROM VENDEDOR WHERE estado = 'Activo'");
    $vendedores = $stmt2->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 3. Pedidos del mes actual
    $stmt3 = $conn->query("SELECT COUNT(*) as total FROM COMPRA WHERE MONTH(fecha_compra) = MONTH(CURRENT_DATE()) AND YEAR(fecha_compra) = YEAR(CURRENT_DATE())");
    $pedidos = $stmt3->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    // 4. Ingresos del mes
    $stmt4 = $conn->query("SELECT SUM(monto_total) as total FROM PAGO WHERE estado = 'Exitoso' AND MONTH(fecha_pago) = MONTH(CURRENT_DATE()) AND YEAR(fecha_pago) = YEAR(CURRENT_DATE())");
    $ingresos = $stmt4->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

    echo json_encode([
        "success" => true,
        "compradores" => $compradores,
        "vendedores" => $vendedores,
        "pedidos" => $pedidos,
        "ingresos" => number_format($ingresos, 2, '.', ',')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}