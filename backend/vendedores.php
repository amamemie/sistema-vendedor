<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once 'config.php';

try {
    $sql = "SELECT v.id_vendedor, v.nombres, v.apellidos, v.email, v.telefono, v.estado, 
                   p.tipo_persona, p.documento_identidad 
            FROM VENDEDOR v
            LEFT JOIN PERFIL_VENDEDOR p ON v.id_vendedor = p.id_vendedor
            ORDER BY v.id_vendedor DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    $vendedores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($vendedores);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}