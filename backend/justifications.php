<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

include "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        $sql = "
            SELECT a.id,
                   a.date,
                   CONCAT(s.first_name,' ',s.last_name) AS student_name,
                   c.name AS class_name,
                   m.name AS subject_name,
                   a.justified,
                   j.reason AS justification
            FROM absences a
            JOIN students s ON a.student_id = s.id
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN matieres m ON a.matiere_id = m.id
            LEFT JOIN justifications j ON a.id = j.absence_id
        ";
        if ($status === 'non-justified') {
            $sql .= " WHERE a.justified = 0";
        }
        $sql .= " ORDER BY a.date DESC";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $row['statut'] = $row['justified'] ? 'Justifiée' : 'Non justifiée';
            unset($row['justified']);
            $data[] = $row;
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID requis"]);
            exit;
        }
        $just = isset($data['justified']) ? intval($data['justified']) : 1;
        $stmt = $conn->prepare("UPDATE absences SET justified = ? WHERE id = ?");
        $stmt->bind_param("ii", $just, $data['id']);
        if ($stmt->execute()) {
            if (!empty($data['justification'])) {
                $stmt2 = $conn->prepare("INSERT INTO justifications (absence_id, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason = ?");
                $stmt2->bind_param("iss", $data['id'], $data['justification'], $data['justification']);
                $stmt2->execute();
                $stmt2->close();
            }
            echo json_encode(["success" => true]);
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
        $stmt = $conn->prepare("DELETE FROM justifications WHERE id = ?");
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