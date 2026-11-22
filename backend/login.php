<?php
// backend/login.php
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

if (empty($data->email) || empty($data->password)) {
    echo json_encode(["success" => false, "message" => "Email y contraseña requeridos"]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT * FROM CUENTA_USUARIO WHERE email = :email");
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
        exit;
    }
    
    // Verificar contraseña
    if ($user['password_hash'] !== $data->password) {
        echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        exit;
    }
    
    // Preparar respuesta base
    $response = [
        "success" => true,
        "message" => "Login exitoso",
        "id" => $user['id_usuario'],
        "email" => $user['email'],
        "rol" => $user['rol'],
        "estado" => $user['estado']
    ];
    
    // Si es vendedor, obtener datos del vendedor y tienda
    if ($user['rol'] === 'Vendedor') {
        // Primero obtener el vendedor
        $stmtV = $conn->prepare("SELECT id_vendedor FROM VENDEDOR WHERE id_usuario = :id_usuario");
        $stmtV->bindParam(":id_usuario", $user['id_usuario']);
        $stmtV->execute();
        $vendedor = $stmtV->fetch(PDO::FETCH_ASSOC);
        
        if ($vendedor) {
            $response['id_vendedor'] = $vendedor['id_vendedor'];
            
            // Luego obtener la tienda
            $stmtT = $conn->prepare("SELECT id_tienda, nombre_tienda FROM TIENDA WHERE id_vendedor = :id_vendedor AND estado = 'Activa'");
            $stmtT->bindParam(":id_vendedor", $vendedor['id_vendedor']);
            $stmtT->execute();
            $tienda = $stmtT->fetch(PDO::FETCH_ASSOC);
            
            if ($tienda) {
                $response['id_tienda'] = $tienda['id_tienda'];
                $response['nombre_tienda'] = $tienda['nombre_tienda'];
            } else {
                $response['id_tienda'] = null;
                $response['nombre_tienda'] = null;
            }
        } else {
            $response['id_vendedor'] = null;
            $response['id_tienda'] = null;
            $response['nombre_tienda'] = null;
        }
    }
    
    // Si es comprador
    if ($user['rol'] === 'Comprador') {
        $stmtC = $conn->prepare("SELECT id_comprador FROM COMPRADOR WHERE id_usuario = :id_usuario");
        $stmtC->bindParam(":id_usuario", $user['id_usuario']);
        $stmtC->execute();
        $comprador = $stmtC->fetch(PDO::FETCH_ASSOC);
        
        if ($comprador) {
            $response['id_comprador'] = $comprador['id_comprador'];
        }
    }
    
    echo json_encode($response);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>