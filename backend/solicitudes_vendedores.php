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

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT 
                v.id_vendedor,
                v.id_usuario,
                v.nombres,
                v.apellidos,
                v.email,
                v.telefono,
                v.estado AS estado_vendedor,
                t.id_tienda,
                t.nombre_tienda,
                t.descripcion,
                t.estado AS estado_tienda,
                t.fecha_creacion,
                p.tipo_persona,
                p.documento_identidad,
                p.direccion,
                p.ciudad,
                p.estado_validacion
            FROM VENDEDOR v
            LEFT JOIN TIENDA t ON t.id_vendedor = v.id_vendedor
            LEFT JOIN PERFIL_VENDEDOR p ON p.id_vendedor = v.id_vendedor
            WHERE v.estado = 'Pendiente' OR t.estado = 'Pendiente'
            ORDER BY t.fecha_creacion DESC
        ");
        $stmt->execute();
        
        $solicitudes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($solicitudes);
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->id_vendedor) || empty($data->accion)) {
        echo json_encode(["success" => false, "message" => "Faltan datos"]);
        exit;
    }
    
    try {
        $conn->beginTransaction();
        
        if ($data->accion === 'aprobar') {
            // Aprobar vendedor
            $stmt1 = $conn->prepare("UPDATE VENDEDOR SET estado = 'Activo' WHERE id_vendedor = :id");
            $stmt1->bindParam(":id", $data->id_vendedor);
            $stmt1->execute();
            
            // Aprobar tienda
            $stmt2 = $conn->prepare("UPDATE TIENDA SET estado = 'Activa' WHERE id_vendedor = :id");
            $stmt2->bindParam(":id", $data->id_vendedor);
            $stmt2->execute();
            
            // Aprobar perfil
            $stmt3 = $conn->prepare("UPDATE PERFIL_VENDEDOR SET estado_validacion = 'Aprobado' WHERE id_vendedor = :id");
            $stmt3->bindParam(":id", $data->id_vendedor);
            $stmt3->execute();
            
            $mensaje = "Vendedor aprobado correctamente";
        } else {
            // Rechazar vendedor
            $stmt1 = $conn->prepare("UPDATE VENDEDOR SET estado = 'Rechazado' WHERE id_vendedor = :id");
            $stmt1->bindParam(":id", $data->id_vendedor);
            $stmt1->execute();
            
            $stmt2 = $conn->prepare("UPDATE TIENDA SET estado = 'Rechazada' WHERE id_vendedor = :id");
            $stmt2->bindParam(":id", $data->id_vendedor);
            $stmt2->execute();
            
            $stmt3 = $conn->prepare("UPDATE PERFIL_VENDEDOR SET estado_validacion = 'Rechazado' WHERE id_vendedor = :id");
            $stmt3->bindParam(":id", $data->id_vendedor);
            $stmt3->execute();
            
            $mensaje = "Vendedor rechazado";
        }
        
        $conn->commit();
        echo json_encode(["success" => true, "message" => $mensaje]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>