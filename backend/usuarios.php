<?php
// backend/usuarios.php
header("Access-Control-Allow-Origin: *"); // Permite que React se conecte
header("Content-Type: application/json; charset=UTF-8");

include_once 'config.php';

try {
    $query = "SELECT id_usuario, email, rol FROM CUENTA_USUARIO";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($usuarios);
} catch(Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>