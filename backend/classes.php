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
        // if id provided, return single class
        if (isset($_GET['id']) && intval($_GET['id'])>0) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare(
                "SELECT c.id, c.name, '' AS description, COUNT(s.id) AS student_count
                 FROM classes c
                 LEFT JOIN students s ON s.class_id = c.id
                 WHERE c.id = ?
                 GROUP BY c.id"
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
            SELECT c.id,
                   c.name,
                   '' AS description,
                   COUNT(s.id) AS student_count
            FROM classes c
            LEFT JOIN students s ON s.class_id = c.id
            GROUP BY c.id
            ORDER BY c.name
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
        $stmt = $conn->prepare("INSERT INTO classes (name) VALUES (?)");
        $stmt->bind_param("s", $data['name']);
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
        $stmt = $conn->prepare("UPDATE classes SET name = ? WHERE id = ?");
        $stmt->bind_param("si", $data['name'], $data['id']);
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
        $stmt = $conn->prepare("DELETE FROM classes WHERE id = ?");
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