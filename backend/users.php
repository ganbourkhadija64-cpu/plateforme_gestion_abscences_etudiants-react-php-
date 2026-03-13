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

    // =========================
    // GET - Afficher users
    // =========================
    case 'GET':

        if (isset($_GET['id']) && intval($_GET['id']) > 0) {

            $id = intval($_GET['id']);

            $stmt = $conn->prepare("
                SELECT id, nom, email, role, created_at
                FROM users
                WHERE id=?
            ");

            $stmt->bind_param("i", $id);
            $stmt->execute();

            $result = $stmt->get_result();
            $user = $result->fetch_assoc();

            echo json_encode([
                "success" => true,
                "data" => $user
            ]);

            $stmt->close();
            break;
        }

        $query = "
            SELECT id, nom, email, role, created_at
            FROM users
            ORDER BY id DESC
        ";

        $result = $conn->query($query);

        if (!$result) {
            echo json_encode([
                "success" => false,
                "error" => $conn->error
            ]);
            exit;
        }

        $users = [];

        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }

        echo json_encode([
            "success" => true,
            "data" => $users
        ]);

        break;


    // =========================
    // POST - Ajouter user
    // =========================
    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['nom']) ||
            empty($data['email']) ||
            empty($data['password']) ||
            empty($data['role'])
        ) {
            echo json_encode([
                "success" => false,
                "message" => "Champs requis"
            ]);
            exit;
        }

        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

        $stmt = $conn->prepare("
            INSERT INTO users (nom, email, password, role)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->bind_param(
            "ssss",
            $data['nom'],
            $data['email'],
            $hashedPassword,
            $data['role']
        );

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Utilisateur ajouté"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }

        $stmt->close();

        break;


    // =========================
    // PUT - Modifier user
    // =========================
    case 'PUT':

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode([
                "success" => false,
                "message" => "ID requis"
            ]);
            exit;
        }

        if (!empty($data['password'])) {

            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            $stmt = $conn->prepare("
                UPDATE users
                SET nom=?, email=?, role=?, password=?
                WHERE id=?
            ");

            $stmt->bind_param(
                "ssssi",
                $data['nom'],
                $data['email'],
                $data['role'],
                $hashedPassword,
                $data['id']
            );

        } else {

            $stmt = $conn->prepare("
                UPDATE users
                SET nom=?, email=?, role=?
                WHERE id=?
            ");

            $stmt->bind_param(
                "sssi",
                $data['nom'],
                $data['email'],
                $data['role'],
                $data['id']
            );

        }

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Utilisateur modifié"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }

        $stmt->close();

        break;


    // =========================
    // DELETE - Supprimer user
    // =========================
    case 'DELETE':

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {

            echo json_encode([
                "success" => false,
                "message" => "ID requis"
            ]);

            exit;
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id=?");

        $stmt->bind_param("i", $data['id']);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Utilisateur supprimé"
            ]);

        } else {

            echo json_encode([
                "success" => false,
                "message" => $stmt->error
            ]);

        }

        $stmt->close();

        break;

}

$conn->close();
?>