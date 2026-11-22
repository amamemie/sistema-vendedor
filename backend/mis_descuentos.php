<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$id_usuario = $_GET['id_usuario'] ?? null;

if (!$id_usuario) {
    echo json_encode(["success" => false, "message" => "ID de usuario requerido"]);
    exit;
}

try {
    // Obtener el id_comprador a partir del id_usuario
    $stmt = $conn->prepare("
        SELECT id_comprador FROM COMPRADOR WHERE id_usuario = :id_usuario
    ");
    $stmt->bindParam(":id_usuario", $id_usuario);
    $stmt->execute();
    $comprador = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$comprador) {
        echo json_encode(["success" => false, "message" => "Comprador no encontrado"]);
        exit;
    }

    $id_comprador = $comprador['id_comprador'];

    // Leer el archivo de logs
    $logFile = __DIR__ . '/logs/descuentos.log';
    $descuentos = [];

    if (file_exists($logFile)) {
        $lines = file($logFile);
        // Recorrer las líneas en orden inverso (más recientes primero)
        foreach (array_reverse($lines) as $line) {
            // Buscar si el descuento es para este comprador
            if (strpos($line, "(ID: $id_comprador)") !== false) {
                // Extraer información de la línea
                preg_match('/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/', $line, $fechaMatch);
                preg_match('/Descuento: (\d+)%/', $line, $descuentoMatch);
                preg_match('/Motivo: (.+)$/', $line, $motivoMatch);
                
                $descuentos[] = [
                    "fecha" => $fechaMatch[1] ?? date('Y-m-d H:i:s'),
                    "descuento" => $descuentoMatch[1] ?? 0,
                    "motivo" => $motivoMatch[1] ?? 'Descuento especial'
                ];
            }
        }
    }

    echo json_encode([
        "success" => true,
        "descuentos" => $descuentos
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>