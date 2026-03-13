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

$classe_id = isset($_GET['classe_id']) ? intval($_GET['classe_id']) : 0;
if (!$classe_id) {
    echo json_encode(["success" => false, "message" => "classe_id requis"]);
    exit;
}

$students = [];
$stmt = $conn->prepare("SELECT id, CONCAT(first_name,' ',last_name) AS nom FROM students WHERE class_id = ? ORDER BY last_name");
$stmt->bind_param("i", $classe_id);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}
$stmt->close();

echo json_encode(["success" => true, "students" => $students]);

$conn->close();
?>