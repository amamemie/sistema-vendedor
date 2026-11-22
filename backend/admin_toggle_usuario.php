<?php
include_once 'config.php';

// Recibir datos del frontend
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id_usuario) && !empty($data->estado)) {
    try {
        $conn->beginTransaction();

        // 1. Actualizar la cuenta principal
        $sql = "UPDATE CUENTA_USUARIO SET estado = :estado WHERE id_usuario = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':estado' => $data->estado, // Recibe 'Activo' o 'Inactivo'
            ':id'     => $data->id_usuario
        ]);

        // 2. Sincronizar con la tabla VENDEDOR si existe el registro
        // Nota: VENDEDOR.estado es ENUM('Pendiente', 'Activo')
        // Mapeamos: 'Activo' -> 'Activo', cualquier otro -> 'Pendiente'
        $vendedorEstado = ($data->estado === 'Activo') ? 'Activo' : 'Pendiente';
        
        $sqlVendedor = "UPDATE VENDEDOR SET estado = :v_estado WHERE id_usuario = :id";
        $stmtV = $conn->prepare($sqlVendedor);
        $stmtV->execute([':v_estado' => $vendedorEstado, ':id' => $data->id_usuario]);

        $conn->commit();

        if ($stmt->rowCount() > 0 || $stmtV->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Estado actualizado y sincronizado"]);
        } else {
            echo json_encode(["success" => false, "message" => "No se pudo actualizar el registro"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
}
?>