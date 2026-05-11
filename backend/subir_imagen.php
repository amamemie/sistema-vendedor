<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$id_producto  = $_POST['id_producto']  ?? null;
$es_principal = $_POST['es_principal'] ?? 0;

if (!$id_producto) {
    echo json_encode(["success" => false, "message" => "id_producto requerido"]);
    exit;
}

if (!isset($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "No se recibió ninguna imagen"]);
    exit;
}

$archivo = $_FILES['imagen'];

// Validar tipo de archivo
$tipos_permitidos = ['image/jpeg', 'image/png', 'image/webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$tipo_real = finfo_file($finfo, $archivo['tmp_name']);
finfo_close($finfo);

if (!in_array($tipo_real, $tipos_permitidos)) {
    echo json_encode(["success" => false, "message" => "Solo se permiten imágenes JPG, PNG o WEBP"]);
    exit;
}

// Validar tamaño (máx 5MB)
if ($archivo['size'] > 5 * 1024 * 1024) {
    echo json_encode(["success" => false, "message" => "La imagen no puede superar 5MB"]);
    exit;
}

// Generar nombre único para evitar colisiones
$extension  = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombre_archivo = 'prod_' . $id_producto . '_' . uniqid() . '.' . strtolower($extension);
$carpeta_destino = __DIR__ . '/uploads/productos/';
$ruta_destino    = $carpeta_destino . $nombre_archivo;

// Crear carpeta si no existe
if (!is_dir($carpeta_destino)) {
    mkdir($carpeta_destino, 0755, true);
}

if (!move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
    echo json_encode(["success" => false, "message" => "Error al guardar el archivo en el servidor"]);
    exit;
}

// Ruta relativa que se guarda en la BD y se usa en el <img src="">
$ruta_bd = 'uploads/productos/' . $nombre_archivo;

try {
    // Si es principal, quitar el flag de las otras imágenes del mismo producto
    if ($es_principal == 1) {
        $conn->prepare(
            "UPDATE PRODUCTO_IMAGEN SET es_principal = 0 WHERE id_producto = :id"
        )->execute([":id" => $id_producto]);
    }

    // Insertar registro en BD
    $stmt = $conn->prepare(
        "INSERT INTO PRODUCTO_IMAGEN (id_producto, ruta_archivo, es_principal)
         VALUES (:id_producto, :ruta, :principal)"
    );
    $stmt->bindParam(":id_producto", $id_producto);
    $stmt->bindParam(":ruta",        $ruta_bd);
    $stmt->bindParam(":principal",   $es_principal);
    $stmt->execute();

    $id_imagen = $conn->lastInsertId();

    echo json_encode([
        "success"   => true,
        "id_imagen" => $id_imagen,
        "ruta"      => $ruta_bd,
        // URL completa para mostrarla en el frontend
        "url"       => 'http://localhost:8080/sistema-vendedor/backend/' . $ruta_bd
    ]);

} catch (Exception $e) {
    // Si falla la BD, eliminar el archivo ya subido
    @unlink($ruta_destino);
    echo json_encode(["success" => false, "message" => "Error en BD: " . $e->getMessage()]);
}
?>
