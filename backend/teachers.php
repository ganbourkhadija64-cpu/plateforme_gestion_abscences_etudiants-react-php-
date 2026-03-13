<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json");

include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    // GET - Afficher enseignants
    case 'GET':
        $query = "
            SELECT *
            FROM teachers
            ORDER BY name
        ";

        $result = $conn->query($query);
        
        if (!$result) {
            echo json_encode(["success" => false, "error" => $conn->error]);
            exit;
        }
        
        $teachers = [];
        while ($row = $result->fetch_assoc()) {
            $teachers[] = $row;
        }

        echo json_encode([
            "success" => true,
            "data" => $teachers,
            "count" => count($teachers)
        ]);
        break;

    // POST - Ajouter enseignant
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['name']) || empty($data['email'])) {
            echo json_encode(["success" => false, "message" => "Required fields"]);
            exit;
        }

        $stmt = $conn->prepare("
            INSERT INTO teachers (name, email)
            VALUES (?, ?)
        ");

        $stmt->bind_param("ss", $data['name'], $data['email']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Teacher added"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error adding teacher"]);
        }
        break;

    // PUT - Modifier enseignant
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID required"]);
            exit;
        }

        $stmt = $conn->prepare("
            UPDATE teachers 
            SET name = ?, email = ?
            WHERE id = ?
        ");

        $stmt->bind_param("ssi", $data['name'], $data['email'], $data['id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Teacher updated"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error updating teacher"]);
        }
        break;

    // DELETE - Supprimer enseignant
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID required"]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM teachers WHERE id = ?");
        $stmt->bind_param("i", $data['id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Teacher deleted"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error deleting teacher"]);
        }
        break;
}

$conn->close();
?>
