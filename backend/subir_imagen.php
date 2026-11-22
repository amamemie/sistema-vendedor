<?php
// backend/subir_imagen.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

 
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

include_once 'config.php';

$id_producto  = $_POST['id_producto'] ?? null;
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

// Validar tipo
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

// Generar nombre único
$extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
$nombre_archivo = 'prod_' . $id_producto . '_' . uniqid() . '.' . strtolower($extension);
$carpeta_destino = __DIR__ . '/uploads/productos/';
$ruta_destino = $carpeta_destino . $nombre_archivo;
$ruta_bd = 'uploads/productos/' . $nombre_archivo;

// Crear carpeta si no existe
if (!is_dir($carpeta_destino)) {
    mkdir($carpeta_destino, 0755, true);
}

if (!move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
    echo json_encode(["success" => false, "message" => "Error al guardar el archivo"]);
    exit;
}

try {
    if ($es_principal == 1) {
        // Actualizar la imagen principal en PRODUCTO
        $stmt = $conn->prepare("UPDATE PRODUCTO SET imagen_principal = :ruta WHERE id_producto = :id");
        $stmt->bindParam(":ruta", $ruta_bd);
        $stmt->bindParam(":id", $id_producto);
        $stmt->execute();
    } else {
        // Agregar imagen extra (concatenar a imagenes_extra)
        $stmt = $conn->prepare("SELECT imagenes_extra FROM PRODUCTO WHERE id_producto = :id");
        $stmt->bindParam(":id", $id_producto);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $imagenes_extra = $row['imagenes_extra'] ?? '';
        $nuevas_imagenes = $imagenes_extra ? $imagenes_extra . ',' . $ruta_bd : $ruta_bd;
        
        $update = $conn->prepare("UPDATE PRODUCTO SET imagenes_extra = :imagenes WHERE id_producto = :id");
        $update->bindParam(":imagenes", $nuevas_imagenes);
        $update->bindParam(":id", $id_producto);
        $update->execute();
    }

    echo json_encode([
        "success" => true,
        "ruta" => $ruta_bd,
        "url" => 'http://localhost/sistema-vendedor/backend/' . $ruta_bd
    ]);

} catch (Exception $e) {
    @unlink($ruta_destino);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>