<?php
header('Content-Type: application/json');

// Conectar a la base de datos
$host = 'localhost';
$db = 'orbitalobjectsdb';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);

// Verificar conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Consultar cometas
$sql_comets = "
    SELECT c.id AS comet_id, c.name AS comet_name, c.diameter, c.eccentricity, c.inclination, c.perihelion, c.M1, c.Q, c.n, c.tp_cal
    FROM comets c WHERE c.tp_cal LIKE '%2024%';
";

$result_comets = $conn->query($sql_comets);

$comets = [];
if ($result_comets->num_rows > 0) {
    while ($row = $result_comets->fetch_assoc()) {
        $comets[] = $row;
    }
}

// Cerrar conexión
$conn->close();

// Devolver resultados en formato JSON
echo json_encode(['comets' => $comets]);
?>
