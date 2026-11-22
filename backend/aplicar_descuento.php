<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_cliente) || empty($data->descuento)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
    exit;
}

$id_cliente = $data->id_cliente;
$descuento = (float)$data->descuento;
$motivo = $data->motivo ?? 'Descuento especial';

try {
    // Obtener datos del cliente
    $stmt = $conn->prepare("
        SELECT nombres, apellidos, email, telefono 
        FROM COMPRADOR 
        WHERE id_comprador = :id_cliente
    ");
    $stmt->bindParam(":id_cliente", $id_cliente);
    $stmt->execute();
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        echo json_encode(["success" => false, "message" => "Cliente no encontrado"]);
        exit;
    }

    // Guardar en archivo de log (NO se crea tabla nueva)
    $logFile = __DIR__ . '/logs/descuentos.log';
    
    if (!is_dir(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0777, true);
    }
    
    $logEntry = date('Y-m-d H:i:s') . " | Cliente: {$cliente['nombres']} {$cliente['apellidos']} (ID: $id_cliente) | Email: {$cliente['email']} | Descuento: {$descuento}% | Motivo: $motivo\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);

    echo json_encode([
        "success" => true, 
        "message" => "✅ Descuento del {$descuento}% aplicado a {$cliente['nombres']} {$cliente['apellidos']}",
        "cliente" => $cliente,
        "descuento" => $descuento,
        "motivo" => $motivo
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>