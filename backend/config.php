<?php
// backend/config.php
$host = "localhost";
$db_name = "sistema_ventas";
$username = "root";
$password = ""; // Reemplaza con tu clave real

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Configurar para que devuelva errores claros
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Fallo de conexión: " . $e->getMessage()]);
    exit;
}
?>