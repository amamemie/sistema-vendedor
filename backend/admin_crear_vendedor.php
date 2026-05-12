<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password) && !empty($data->nombres) && !empty($data->documento_identidad)) {
    try {
        $conn->beginTransaction();

        // Encriptar contraseña para que coincida con la lógica de seguridad
        $pass_hashed = password_hash($data->password, PASSWORD_BCRYPT);

        // 1. Cuenta
        $sql_u = "INSERT INTO CUENTA_USUARIO (email, password_hash, rol, estado) VALUES (:email, :pass, 'Vendedor', 'Activo')";
        $stmt_u = $conn->prepare($sql_u);
        $stmt_u->execute([':email' => $data->email, ':pass' => $pass_hashed]);
        $id_usuario = $conn->lastInsertId();

        // 2. Vendedor
        $sql_v = "INSERT INTO VENDEDOR (id_usuario, nombres, apellidos, email, telefono, fecha_registro, estado) 
                  VALUES (:id_u, :nom, :ape, :email, :tel, CURDATE(), 'Activo')";
        $stmt_v = $conn->prepare($sql_v);
        $stmt_v->execute([
            ':id_u'  => $id_usuario,
            ':nom'   => $data->nombres,
            ':ape'   => $data->apellidos,
            ':email' => $data->email,
            ':tel'   => $data->telefono ?? ''
        ]);
        $id_vendedor = $conn->lastInsertId();

        // 3. Perfil
        $sql_p = "INSERT INTO PERFIL_VENDEDOR (id_vendedor, tipo_persona, documento_identidad, direccion, ciudad, pais, estado_validacion) 
                  VALUES (:id_v, :tipo, :doc, :dir, :ciu, :pais, 'Aprobado')";
        $stmt_p = $conn->prepare($sql_p);
        $stmt_p->execute([
            ':id_v' => $id_vendedor,
            ':tipo' => $data->tipo_persona,
            ':doc'  => $data->documento_identidad,
            ':dir'  => $data->direccion ?? '',
            ':ciu'  => $data->ciudad ?? '',
            ':pais' => $data->pais ?? ''
        ]);

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Vendedor creado exitosamente"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
}