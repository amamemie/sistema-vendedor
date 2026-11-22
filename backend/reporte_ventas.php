<?php
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

try {
    $stmt = $conn->prepare(
        "SELECT c.id_compra, c.fecha_compra, c.total_bruto, c.estado,
                comp.nombres AS comprador_nombres
         FROM COMPRA c
         LEFT JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
         ORDER BY c.fecha_compra DESC LIMIT 5000"
    );
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>