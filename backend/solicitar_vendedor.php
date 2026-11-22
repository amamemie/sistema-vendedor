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

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id_usuario) || empty($data->nombreEmpresa) || empty($data->nit_rut)) {
    echo json_encode(["success" => false, "message" => "Faltan datos: id_usuario, nombreEmpresa, nit_rut son requeridos"]);
    exit;
}

try {
    $conn->beginTransaction();

    // 1. Verificar si el usuario ya es vendedor
    $checkVendedor = $conn->prepare("SELECT id_vendedor FROM VENDEDOR WHERE id_usuario = :id_usuario");
    $checkVendedor->bindParam(":id_usuario", $data->id_usuario);
    $checkVendedor->execute();
    
    if ($checkVendedor->rowCount() > 0) {
        $vendedor = $checkVendedor->fetch(PDO::FETCH_ASSOC);
        
        // Verificar si ya tiene tienda
        $checkTienda = $conn->prepare("SELECT id_tienda, estado FROM TIENDA WHERE id_vendedor = :id_vendedor");
        $checkTienda->bindParam(":id_vendedor", $vendedor['id_vendedor']);
        $checkTienda->execute();
        
        if ($checkTienda->rowCount() > 0) {
            $tienda = $checkTienda->fetch(PDO::FETCH_ASSOC);
            if ($tienda['estado'] === 'Activa') {
                echo json_encode(["success" => false, "message" => "Ya eres vendedor activo"]);
                exit;
            } else {
                echo json_encode(["success" => false, "message" => "Ya tienes una solicitud pendiente"]);
                exit;
            }
        }
    }

    // 2. Insertar en VENDEDOR si no existe
    if ($checkVendedor->rowCount() == 0) {
        $stmt = $conn->prepare("
            INSERT INTO VENDEDOR (id_usuario, nombres, apellidos, email, telefono, estado)
            VALUES (:id_usuario, '', '', '', :telefono, 'Pendiente')
        ");
        $stmt->bindParam(":id_usuario", $data->id_usuario);
        $stmt->bindParam(":telefono", $data->telefono);
        $stmt->execute();
        $id_vendedor = $conn->lastInsertId();
    } else {
        $vendedor = $checkVendedor->fetch(PDO::FETCH_ASSOC);
        $id_vendedor = $vendedor['id_vendedor'];
        
        // Actualizar teléfono
        $update = $conn->prepare("UPDATE VENDEDOR SET telefono = :telefono WHERE id_vendedor = :id");
        $update->bindParam(":telefono", $data->telefono);
        $update->bindParam(":id", $id_vendedor);
        $update->execute();
    }

    // 3. Insertar en TIENDA (pendiente de aprobación)
    $stmtTienda = $conn->prepare("
        INSERT INTO TIENDA (id_vendedor, nombre_tienda, descripcion, estado, fecha_creacion)
        VALUES (:id_vendedor, :nombre, :direccion, 'Pendiente', CURDATE())
    ");
    $stmtTienda->bindParam(":id_vendedor", $id_vendedor);
    $stmtTienda->bindParam(":nombre", $data->nombreEmpresa);
    $stmtTienda->bindParam(":direccion", $data->direccion);
    $stmtTienda->execute();

    // 4. Insertar en PERFIL_VENDEDOR con los datos de la empresa
    $stmtPerfil = $conn->prepare("
        INSERT INTO PERFIL_VENDEDOR (id_vendedor, tipo_persona, documento_identidad, direccion, ciudad, estado_validacion)
        VALUES (:id_vendedor, 'Juridica', :nit, :direccion, '', 'Pendiente')
    ");
    $stmtPerfil->bindParam(":id_vendedor", $id_vendedor);
    $stmtPerfil->bindParam(":nit", $data->nit_rut);
    $stmtPerfil->bindParam(":direccion", $data->direccion);
    $stmtPerfil->execute();

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Solicitud enviada correctamente. Espera la aprobación del administrador."]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>