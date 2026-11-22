<?php
// backend/categorias.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Obtener categorías
    $stmt = $conn->query("SELECT * FROM CATEGORIA ORDER BY nombre ASC");
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categorias);
    
} elseif ($method === 'POST') {
    // Crear categoría
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->nombre)) {
        echo json_encode(["success" => false, "message" => "El nombre es requerido"]);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("
            INSERT INTO CATEGORIA (nombre, detalle, estado) 
            VALUES (:nombre, :detalle, :estado)
        ");
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":detalle", $data->detalle);
        $stmt->bindParam(":estado", $data->estado);
        $stmt->execute();
        
        echo json_encode(["success" => true, "message" => "Categoría creada", "id" => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    
} elseif ($method === 'PUT') {
    // Actualizar categoría
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->id_categoria) || empty($data->nombre)) {
        echo json_encode(["success" => false, "message" => "ID y nombre son requeridos"]);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE CATEGORIA 
            SET nombre = :nombre, detalle = :detalle, estado = :estado
            WHERE id_categoria = :id
        ");
        $stmt->bindParam(":nombre", $data->nombre);
        $stmt->bindParam(":detalle", $data->detalle);
        $stmt->bindParam(":estado", $data->estado);
        $stmt->bindParam(":id", $data->id_categoria);
        $stmt->execute();
        
        echo json_encode(["success" => true, "message" => "Categoría actualizada"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    
} elseif ($method === 'DELETE') {
    // Eliminar categoría
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->id_categoria)) {
        echo json_encode(["success" => false, "message" => "ID de categoría requerido"]);
        exit;
    }
    
    try {
        // Primero, actualizar productos que usan esta categoría a NULL
        $update = $conn->prepare("UPDATE PRODUCTO SET id_categoria = NULL WHERE id_categoria = :id");
        $update->bindParam(":id", $data->id_categoria);
        $update->execute();
        
        // Luego eliminar la categoría
        $stmt = $conn->prepare("DELETE FROM CATEGORIA WHERE id_categoria = :id");
        $stmt->bindParam(":id", $data->id_categoria);
        $stmt->execute();
        
        echo json_encode(["success" => true, "message" => "Categoría eliminada"]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>