<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

include "config.php";

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$classes = [];
$matieres = [];

// fetch classes
if ($result = $conn->query("SELECT id, name AS nom FROM classes ORDER BY name")) {
    while ($row = $result->fetch_assoc()) {
        $classes[] = $row;
    }
}

// fetch matieres
if ($result = $conn->query("SELECT id, name AS nom FROM matieres ORDER BY name")) {
    while ($row = $result->fetch_assoc()) {
        $matieres[] = $row;
    }
}

echo json_encode([
    "success"  => true,
    "classes"  => $classes,
    "matieres" => $matieres
]);

$conn->close();
?>