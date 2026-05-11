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

// ── Validaciones ──────────────────────────────────────────
if (empty($data->email) || empty($data->password) || empty($data->rol)) {
    echo json_encode(["success" => false, "message" => "Email, contraseña y rol son requeridos"]);
    exit;
}

// Registro público solo para Compradores
if ($data->rol !== 'Comprador') {
    echo json_encode(["success" => false, "message" => "El registro público es solo para compradores"]);
    exit;
}

if (empty($data->nombres) || empty($data->apellidos)) {
    echo json_encode(["success" => false, "message" => "Nombres y apellidos son requeridos"]);
    exit;
}

// ── Verificar email duplicado ─────────────────────────────
try {
    $check = $conn->prepare("SELECT id_usuario FROM CUENTA_USUARIO WHERE email = :email LIMIT 1");
    $check->bindParam(":email", $data->email);
    $check->execute();
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Este email ya está registrado"]);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error verificando email: " . $e->getMessage()]);
    exit;
}

// ── Insertar en transacción ───────────────────────────────
try {
    $conn->beginTransaction();

    // 1. Insertar en CUENTA_USUARIO (tabla principal de tu BD)
    $stmt = $conn->prepare(
        "INSERT INTO CUENTA_USUARIO (email, password_hash, rol, estado)
         VALUES (:email, :password, 'Comprador', 'Activo')"
    );
    $stmt->bindParam(":email",    $data->email);
    $stmt->bindParam(":password", $data->password); // texto plano para coincidir con login.php
    $stmt->execute();
    $id_usuario = $conn->lastInsertId();

    // 2. Insertar en COMPRADOR (tabla de perfil en tu esquema real)
    $telefono = $data->telefono ?? '';
    $perfil = $conn->prepare(
        "INSERT INTO COMPRADOR (id_usuario, nombres, apellidos, email, telefono)
         VALUES (:id, :nombres, :apellidos, :email, :telefono)"
    );
    $perfil->bindParam(":id",       $id_usuario);
    $perfil->bindParam(":nombres",  $data->nombres);
    $perfil->bindParam(":apellidos",$data->apellidos);
    $perfil->bindParam(":email",    $data->email);
    $perfil->bindParam(":telefono", $telefono);
    $perfil->execute();

    $conn->commit();
    echo json_encode([
        "success" => true,
        "message" => "Cuenta creada correctamente",
        "id"      => $id_usuario
    ]);

} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Error al registrar: " . $e->getMessage()]);
}
?>
