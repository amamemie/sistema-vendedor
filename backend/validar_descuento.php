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

$codigo = $_GET['codigo'] ?? '';
$id_usuario = $_GET['id_usuario'] ?? null;

if (!$codigo) {
    echo json_encode(["success" => false, "message" => "Código requerido"]);
    exit;
}

if (!$id_usuario) {
    echo json_encode(["success" => false, "message" => "Usuario no identificado"]);
    exit;
}

try {
    // Obtener id_comprador
    $stmt = $conn->prepare("SELECT id_comprador FROM COMPRADOR WHERE id_usuario = :id_usuario");
    $stmt->bindParam(":id_usuario", $id_usuario);
    $stmt->execute();
    $comprador = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$comprador) {
        echo json_encode(["success" => false, "message" => "Comprador no encontrado"]);
        exit;
    }

    $id_comprador = $comprador['id_comprador'];

    // Buscar el descuento en el log
    $logFile = __DIR__ . '/logs/descuentos.log';
    $descuentoEncontrado = null;

    if (file_exists($logFile)) {
        $lines = file($logFile);
        foreach (array_reverse($lines) as $line) {
            // Buscar código en formato DESC-XX-XXXX
            $codigoBuscado = $codigo;
            if (strpos($line, "(ID: $id_comprador)") !== false) {
                preg_match('/Descuento: (\d+)%/', $line, $descuentoMatch);
                if ($descuentoMatch) {
                    $descuentoEncontrado = (int)$descuentoMatch[1];
                    break;
                }
            }
        }
    }

    if ($descuentoEncontrado) {
        echo json_encode([
            "success" => true,
            "message" => "Código válido",
            "descuento" => $descuentoEncontrado
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Código inválido o expirado"
        ]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>