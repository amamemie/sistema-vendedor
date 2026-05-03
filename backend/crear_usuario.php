<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password) && !empty($data->rol)) {
    try {
        $conn->beginTransaction();

        // 1. Crear la Cuenta de Usuario
        $sqlUser = "INSERT INTO CUENTA_USUARIO (email, password_hash, rol, estado) 
                    VALUES (:email, :password, :rol, 'Activo')";
        $stmtUser = $conn->prepare($sqlUser);
        $stmtUser->execute([
            ':email'    => $data->email,
            ':password' => $data->password,
            ':rol'      => $data->rol
        ]);
        
        $id_usuario = $conn->lastInsertId();

        // 2. Crear perfiles específicos según el ROL
        if ($data->rol === 'Vendedor') {
            // Insertar en VENDEDOR
            $sqlVend = "INSERT INTO VENDEDOR (id_usuario, nombres, apellidos, email, telefono, fecha_registro, estado) 
                        VALUES (:id_u, :nom, :ape, :email, :tel, CURDATE(), 'Pendiente')";
            $stmtVend = $conn->prepare($sqlVend);
            $stmtVend->execute([
                ':id_u'  => $id_usuario,
                ':nom'   => $data->nombres,
                ':ape'   => $data->apellidos,
                ':email' => $data->email,
                ':tel'   => $data->telefono
            ]);
            
            $id_vendedor = $conn->lastInsertId();

            // Insertar en PERFIL_VENDEDOR (Estado inicial Pendiente)
            $sqlPerfil = "INSERT INTO PERFIL_VENDEDOR (id_vendedor, tipo_persona, documento_identidad, estado_validacion) 
                          VALUES (:id_v, :tipo, :doc, 'Pendiente')";
            $stmtPerfil = $conn->prepare($sqlPerfil);
            $stmtPerfil->execute([
                ':id_v' => $id_vendedor,
                ':tipo' => $data->tipo_persona,
                ':doc'  => $data->documento_identidad
            ]);

        } elseif ($data->rol === 'Comprador') {
            // Insertar en COMPRADOR
            $sqlComp = "INSERT INTO COMPRADOR (id_usuario, nombres, apellidos, email, telefono) 
                        VALUES (:id_u, :nom, :ape, :email, :tel)";
            $stmtComp = $conn->prepare($sqlComp);
            $stmtComp->execute([
                ':id_u'  => $id_usuario,
                ':nom'   => $data->nombres,
                ':ape'   => $data->apellidos,
                ':email' => $data->email,
                ':tel'   => $data->telefono
            ]);
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Usuario y perfil creados con éxito"]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
?>