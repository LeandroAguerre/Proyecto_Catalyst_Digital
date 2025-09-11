<?php
$host = 'db'; // nombre del servicio en docker-compose
$dbname = 'reddeoficios';
$user = 'root';
$pass = 'catalystdigital05';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Error de conexión a la base de datos']));
}
