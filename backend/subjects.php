<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

include "config.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // optionally fetch single subject by id
        if (isset($_GET['id']) && intval($_GET['id'])>0) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare(
                "SELECT m.id, m.name, 0 AS coefficient, m.teacher_id, u.nom AS teacher_name
                 FROM matieres m
                 LEFT JOIN users u ON u.id = m.teacher_id
                 WHERE m.id = ?"
            );
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            echo json_encode(["success"=>true, "data"=>$row]);
            $stmt->close();
            break;
        }
        $sql = "
            SELECT m.id,
                   m.name,
                   0 AS coefficient,
                   m.teacher_id,
                   u.nom AS teacher_name
            FROM matieres m
            LEFT JOIN users u ON u.id = m.teacher_id
            ORDER BY m.name
        ";
        $result = $conn->query($sql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["success" => true, "data" => $data]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['name'])) {
            echo json_encode(["success" => false, "message" => "Name required"]);
            exit;
        }
        $teacher = isset($data['teacher_id']) ? $data['teacher_id'] : null;
        $stmt = $conn->prepare("INSERT INTO matieres (name, teacher_id) VALUES (?, ?)");
        $stmt->bind_param("si", $data['name'], $teacher);
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $stmt->insert_id]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id']) || empty($data['name'])) {
            echo json_encode(["success" => false, "message" => "ID and name required"]);
            exit;
        }
        $teacher = isset($data['teacher_id']) ? $data['teacher_id'] : null;
        $stmt = $conn->prepare("UPDATE matieres SET name = ?, teacher_id = ? WHERE id = ?");
        $stmt->bind_param("sii", $data['name'], $teacher, $data['id']);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID required"]);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM matieres WHERE id = ?");
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