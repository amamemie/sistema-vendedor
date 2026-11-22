<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_producto) || empty($data->motivo)) {
    echo json_encode(["success" => false, "message" => "Faltan datos: id_producto y motivo son requeridos"]);
    exit;
}

try {
    // Crear tabla de reportes si no existe
    $sql = "CREATE TABLE IF NOT EXISTS REPORTE_PRODUCTO (
        id_reporte INT AUTO_INCREMENT PRIMARY KEY,
        id_producto INT NOT NULL,
        motivo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        estado VARCHAR(20) DEFAULT 'Pendiente',
        fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_producto) REFERENCES PRODUCTO(id_producto) ON DELETE CASCADE
    )";
    $conn->exec($sql);

    // Insertar reporte
    $stmt = $conn->prepare(
        "INSERT INTO REPORTE_PRODUCTO (id_producto, motivo, descripcion, estado) 
         VALUES (:id_producto, :motivo, :descripcion, 'Pendiente')"
    );
    $stmt->bindParam(":id_producto", $data->id_producto);
    $stmt->bindParam(":motivo", $data->motivo);
    $stmt->bindParam(":descripcion", $data->descripcion);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Reporte enviado correctamente"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>