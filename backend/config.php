<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "gestion_absences";

// MySQLi Connection
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    header("Content-Type: application/json");
    die(json_encode([
        "success" => false,
        "message" => "Erreur connexion DB: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8");

// PDO Connection for compatibility
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header("Content-Type: application/json");
    die(json_encode([
        "success" => false,
        "message" => "Erreur PDO: " . $e->getMessage()
    ]));
}
?>