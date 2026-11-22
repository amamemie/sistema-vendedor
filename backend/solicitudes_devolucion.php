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
        "SELECT c.id_compra, c.total_bruto, c.solicita_devolucion, c.devolucion_motivo,
                comp.nombres AS comprador_nombres, comp.apellidos AS comprador_apellidos,
                t.nombre_tienda
         FROM COMPRA c
         LEFT JOIN COMPRADOR comp ON comp.id_comprador = c.id_comprador
         LEFT JOIN TIENDA t ON t.id_tienda = c.id_tienda
         WHERE c.solicita_devolucion = 'Pendiente'"
    );
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>