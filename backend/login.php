<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
    // Obtener datos del usuario
    $stmt = $conn->prepare(
        "SELECT id_usuario, email, rol, estado FROM CUENTA_USUARIO
         WHERE email = :email AND password_hash = :password LIMIT 1"
    );
    $stmt->bindParam(":email",    $data->email);
    $stmt->bindParam(":password", $data->password);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Credenciales incorrectas"]);
        exit;
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user['estado'] !== 'Activo') {
        echo json_encode(["success" => false, "message" => "Tu cuenta está inactiva"]);
        exit;
    }

    $response = [
        "success"    => true,
        "id"         => $user['id_usuario'],
        "email"      => $user['email'],
        "rol"        => $user['rol'],
        "id_tienda"  => null,
        "nombre_tienda" => null,
        "id_vendedor"   => null,
    ];

    // Si es Vendedor → buscar su tienda
    if ($user['rol'] === 'Vendedor') {
        $vStmt = $conn->prepare(
            "SELECT v.id_vendedor, v.nombres, v.apellidos,
                    t.id_tienda, t.nombre_tienda, t.estado AS estado_tienda
             FROM VENDEDOR v
             LEFT JOIN TIENDA t ON t.id_vendedor = v.id_vendedor
             WHERE v.id_usuario = :id_usuario
             LIMIT 1"
        );
        $vStmt->bindParam(":id_usuario", $user['id_usuario']);
        $vStmt->execute();

        if ($vStmt->rowCount() > 0) {
            $vData = $vStmt->fetch(PDO::FETCH_ASSOC);
            $response['id_vendedor']    = $vData['id_vendedor'];
            $response['nombre_vendedor']= $vData['nombres'] . ' ' . $vData['apellidos'];
            $response['id_tienda']      = $vData['id_tienda'];
            $response['nombre_tienda']  = $vData['nombre_tienda'];
            $response['estado_tienda']  = $vData['estado_tienda'];
        }
    }

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error del servidor: " . $e->getMessage()]);
}
?>
