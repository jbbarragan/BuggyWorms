<?php
header('Content-Type: application/json');

// Conexión a la base de datos
$host = 'localhost';
$user = 'root';  // Cambia según tu configuración
$password = '';   // Cambia según tu configuración
$dbname = 'orbitalobjectsdb';

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Consulta para obtener información de los objetos
$sql = "SELECT * FROM objects"; // Cambia esto según tu estructura de base de datos
$result = $conn->query($sql);

$objects = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $objects[] = $row;
    }
}

echo json_encode($objects);
$conn->close();
?>
