<?php
// backend/login.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    // En producción usa password_verify con hashes, aquí usamos texto plano para la prueba inicial
    $query = "SELECT id_usuario, email, rol FROM CUENTA_USUARIO 
              WHERE email = :email AND password_hash = :password LIMIT 1";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password", $data->password);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            "success" => true,
            "rol" => $user['rol'],
            "email" => $user['email'],
            "id" => $user['id_usuario']
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
    }
}
?>