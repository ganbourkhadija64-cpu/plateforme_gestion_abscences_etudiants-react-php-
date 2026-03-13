<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Champs requis"
    ]);
    exit;
}

$email = $data['email'];
$password = $data['password'];

$stmt = $conn->prepare("SELECT id, nom, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Utilisateur introuvable"
    ]);

    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {

    echo json_encode([
        "success" => false,
        "message" => "Mot de passe incorrect"
    ]);

    exit;
}

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user["id"],
        "nom" => $user["nom"],
        "email" => $user["email"],
        "role" => $user["role"]
    ]
]);

$stmt->close();
$conn->close();
?>