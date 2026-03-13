<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

include "config.php";

// handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Données invalides"]);
    exit;
}

// required fields
if (
    empty($data['professeur_id']) ||
    empty($data['date']) ||
    empty($data['classe_id']) ||
    empty($data['matiere_id']) ||
    empty($data['etudiant_id']) ||
    !isset($data['debut']) ||
    !isset($data['fin']) ||
    !isset($data['statut'])
) {
    echo json_encode(["success" => false, "message" => "Champs requis manquants"]);
    exit;
}

// map statut to justified bit
$justified = ($data['statut'] === 'Justifiée' || $data['statut'] === 'justifiée' || $data['statut'] === 'Justifie') ? 1 : 0;

$stmt = $conn->prepare("INSERT INTO absences (student_id, matiere_id, date, justified) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iisi",
    $data['etudiant_id'],
    $data['matiere_id'],
    $data['date'],
    $justified
);

if ($stmt->execute()) {
    $absenceId = $stmt->insert_id;

    // insert justification if provided
    if (!empty($data['motif'])) {
        $stmt2 = $conn->prepare("INSERT INTO justifications (absence_id, reason) VALUES (?, ?)");
        $stmt2->bind_param("is", $absenceId, $data['motif']);
        $stmt2->execute();
        $stmt2->close();
    }

    echo json_encode(["success" => true, "message" => "Absence enregistrée"]);
} else {
    echo json_encode(["success" => false, "message" => "Erreur: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>