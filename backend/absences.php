<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Content-Type: application/json");

include "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // allow filtering by student_id for detail view
        $student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 0;
        $base = "
            SELECT a.id,
                   a.date,
                   CONCAT(s.first_name,' ',s.last_name) AS etudiant,
                   c.name AS class_name,
                   m.name AS subject_name,
                   a.justified,
                   j.reason AS motif
            FROM absences a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN matieres m ON a.matiere_id = m.id
            LEFT JOIN justifications j ON a.id = j.absence_id
        ";
        if ($student_id) {
            $base .= " WHERE a.student_id = ?";
            $base .= " ORDER BY a.date DESC";
            $stmt = $conn->prepare($base);
            $stmt->bind_param("i", $student_id);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $base .= " ORDER BY a.date DESC";
            $result = $conn->query($base);
        }
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $row['statut'] = $row['justified'] ? 'Justifiée' : 'Non justifiée';
            if ($row['motif'] === null) { $row['motif'] = ''; }
            unset($row['justified']);
            $data[] = $row;
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (
            empty($data['student_id']) ||
            empty($data['matiere_id']) ||
            empty($data['date'])
        ) {
            echo json_encode(["success" => false, "message" => "Champs requis"]);
            exit;
        }
        $just = isset($data['justified']) ? intval($data['justified']) : 0;
        $stmt = $conn->prepare("INSERT INTO absences (student_id, matiere_id, date, justified) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iisi", $data['student_id'], $data['matiere_id'], $data['date'], $just);
        if ($stmt->execute()) {
            $id = $stmt->insert_id;
            if (!empty($data['motif'])) {
                $stmt2 = $conn->prepare("INSERT INTO justifications (absence_id, reason) VALUES (?, ?)");
                $stmt2->bind_param("is", $id, $data['motif']);
                $stmt2->execute();
                $stmt2->close();
            }
            echo json_encode(["success" => true, "id" => $id]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID requis"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM absences WHERE id = ?");
        $stmt->bind_param("i", $data['id']);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        $stmt->close();
        break;
}

$conn->close();
?>