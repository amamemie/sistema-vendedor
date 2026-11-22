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

if (empty($data->id_producto) || !isset($data->calificacion)) {
    echo json_encode(["success" => false, "message" => "id_producto y calificacion requeridos"]);
    exit;
}

$id_producto = (int)$data->id_producto;
$calificacion = (int)$data->calificacion;
$comentario = $data->comentario ?? '';
$id_usuario = $data->id_usuario ?? null;

if ($calificacion < 0 || $calificacion > 5) {
    echo json_encode(["success" => false, "message" => "La calificación debe estar entre 0 y 5"]);
    exit;
}

try {
    $conn->beginTransaction();

    // Verificar si el usuario ya calificó este producto (solo reseñas, no chat)
    if ($id_usuario) {
        $check = $conn->prepare("
            SELECT id_resena FROM RESENA 
            WHERE id_producto = :id_producto 
              AND id_usuario = :id_usuario 
              AND tipo = 'reseña'
        ");
        $check->bindParam(":id_producto", $id_producto);
        $check->bindParam(":id_usuario", $id_usuario);
        $check->execute();
        
        if ($check->rowCount() > 0) {
            // Actualizar reseña existente
            $stmt = $conn->prepare("
                UPDATE RESENA 
                SET calificacion = :calificacion, 
                    comentario = :comentario, 
                    fecha = NOW()
                WHERE id_producto = :id_producto 
                  AND id_usuario = :id_usuario 
                  AND tipo = 'reseña'
            ");
        } else {
            // Insertar nueva reseña
            $stmt = $conn->prepare("
                INSERT INTO RESENA (id_producto, id_usuario, calificacion, comentario, tipo, fecha)
                VALUES (:id_producto, :id_usuario, :calificacion, :comentario, 'reseña', NOW())
            ");
        }
        $stmt->bindParam(":id_producto", $id_producto);
        $stmt->bindParam(":id_usuario", $id_usuario);
        $stmt->bindParam(":calificacion", $calificacion);
        $stmt->bindParam(":comentario", $comentario);
        $stmt->execute();
    }

    // Actualizar calificación promedio del producto (solo reseñas)
    $updateProducto = $conn->prepare("
        UPDATE PRODUCTO 
        SET calificacion_promedio = (
            SELECT AVG(calificacion) 
            FROM RESENA 
            WHERE id_producto = :id_producto 
              AND tipo = 'reseña'
              AND calificacion IS NOT NULL
        )
        WHERE id_producto = :id_producto
    ");
    $updateProducto->bindParam(":id_producto", $id_producto);
    $updateProducto->execute();

    // Obtener el id_vendedor a través de TIENDA
    $getVendedor = $conn->prepare("
        SELECT t.id_vendedor 
        FROM PRODUCTO p
        LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
        WHERE p.id_producto = :id_producto
    ");
    $getVendedor->bindParam(":id_producto", $id_producto);
    $getVendedor->execute();
    $vendedor = $getVendedor->fetch(PDO::FETCH_ASSOC);
    
    if ($vendedor && $vendedor['id_vendedor']) {
        $id_vendedor = $vendedor['id_vendedor'];
        
        // Actualizar calificación del vendedor (solo reseñas)
        $updateVendedor = $conn->prepare("
            UPDATE VENDEDOR v 
            SET v.calificacion_promedio = (
                SELECT AVG(r.calificacion) 
                FROM RESENA r 
                LEFT JOIN PRODUCTO p ON p.id_producto = r.id_producto
                LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
                WHERE t.id_vendedor = :id_vendedor 
                  AND r.tipo = 'reseña'
                  AND r.calificacion IS NOT NULL
            ),
            v.total_resenas = (
                SELECT COUNT(*) 
                FROM RESENA r 
                LEFT JOIN PRODUCTO p ON p.id_producto = r.id_producto
                LEFT JOIN TIENDA t ON t.id_tienda = p.id_tienda
                WHERE t.id_vendedor = :id_vendedor 
                  AND r.tipo = 'reseña'
            )
            WHERE v.id_vendedor = :id_vendedor
        ");
        $updateVendedor->bindParam(":id_vendedor", $id_vendedor);
        $updateVendedor->execute();
    }

    $conn->commit();

    echo json_encode(["success" => true, "message" => "Calificación guardada"]);

} catch (PDOException $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>