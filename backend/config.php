<?php
// 1. Habilitar visualización de errores (esto debe ir al puro inicio)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// 2. Permisos para que React (Vite) pueda conectarse
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 3. Configuración de la base de datos
$host = "localhost";
$port = "3307"; 
$db_name = "sistema_ventas";
$username = "root";
$password = ""; 

try {
    // Conexión usando PDO con el puerto 3307 de tu XAMPP
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Si llegas aquí sin errores, puedes descomentar la siguiente línea para probar:
    // echo "Conexión exitosa al puerto 3307"; 

} catch(PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "Fallo de conexión: " . $e->getMessage()]);
    exit;
}
?>