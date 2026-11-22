<?php
// backend/crear_imagenes_muestra.php
$carpeta = __DIR__ . '/uploads/productos/';

if (!is_dir($carpeta)) {
    mkdir($carpeta, 0755, true);
}

// Crear imágenes de muestra con colores sólidos
$imagenes = [
    'smartphone.jpg' => [255, 99, 71],   // Tomate
    'audifonos.jpg'  => [54, 162, 235],  // Azul
    'camisa.jpg'     => [75, 192, 192],  // Verde azulado
    'mochila.jpg'    => [255, 205, 86],  // Amarillo
    'tablet.jpg'     => [153, 102, 255], // Púrpura
    'zapatillas.jpg' => [255, 99, 132],  // Rosa
];

foreach ($imagenes as $nombre => $color) {
    // Crear imagen de 400x400
    $img = imagecreatetruecolor(400, 400);
    
    // Asignar color de fondo
    $bg_color = imagecolorallocate($img, $color[0], $color[1], $color[2]);
    imagefill($img, 0, 0, $bg_color);
    
    // Agregar texto blanco
    $text_color = imagecolorallocate($img, 255, 255, 255);
    $texto = strtoupper(pathinfo($nombre, PATHINFO_FILENAME));
    
    // Fuente (puedes usar imagettftext si tienes una fuente, o usar imagestring)
    imagestring($img, 5, 120, 190, $texto, $text_color);
    
    // Guardar imagen
    imagejpeg($img, $carpeta . $nombre, 90);
    imagedestroy($img);
    
    echo "✅ Creada: $nombre<br>";
}

echo "<br>📁 Todas las imágenes fueron creadas en: " . $carpeta;
?>