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
        "SELECT c.id_comision, c.monto AS comision_monto,
                v.nombres AS vendedor_nombres
         FROM COMISION c
         LEFT JOIN DISPERSION d ON d.id_comision = c.id_comision
         LEFT JOIN VENDEDOR v ON v.id_vendedor = d.id_vendedor"
    );
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>