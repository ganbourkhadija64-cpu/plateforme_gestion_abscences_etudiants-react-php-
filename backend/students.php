<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Content-Type: application/json");

include "config.php";

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // =========================
    // GET - Afficher étudiants
    // =========================
    case 'GET':

        // if an id query parameter is provided, return a single student
        if (isset($_GET['id']) && intval($_GET['id']) > 0) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare(
                "SELECT s.id, s.first_name, s.last_name, s.email, s.class_id, s.date_of_birth,
                        c.id as class_id, c.name as class_name
                 FROM students s
                 LEFT JOIN classes c ON s.class_id = c.id
                 WHERE s.id = ?"
            );
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            echo json_encode(["success" => true, "data" => $student]);
            $stmt->close();
            break;
        }

        $query = "
            SELECT s.id, s.first_name, s.last_name, s.email, s.class_id, s.date_of_birth,
                   c.id as class_id, c.name as class_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            ORDER BY s.id DESC
        ";

        $result = $conn->query($query);
        
        if (!$result) {
            echo json_encode(["success" => false, "error" => $conn->error]);
            exit;
        }

        $students = [];
        while ($row = $result->fetch_assoc()) {
            $students[] = $row;
        }

        echo json_encode([
            "success" => true,
            "data" => $students
        ]);
        break;


    // =========================
    // POST - Ajouter étudiant
    // =========================
    case 'POST':

        $data = json_decode(file_get_contents("php://input"), true);

        if (
            empty($data['first_name']) ||
            empty($data['last_name']) ||
            empty($data['email']) ||
            empty($data['class_id'])
        ) {
            echo json_encode(["success" => false, "message" => "Champs requis"]);
            exit;
        }

        // some installations may not yet have the date_of_birth column; check
        $hasDob = false;
        $colRes = $conn->query("SHOW COLUMNS FROM students LIKE 'date_of_birth'");
        if ($colRes && $colRes->num_rows > 0) {
            $hasDob = true;
        }

        if ($hasDob) {
            $stmt = $conn->prepare(
                "INSERT INTO students (first_name, last_name, email, class_id, date_of_birth)"
              . " VALUES (?, ?, ?, ?, ?)"
            );
            $dob = isset($data['date_of_birth']) ? $data['date_of_birth'] : null;
            $stmt->bind_param("sssis", 
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['class_id'],
                $dob
            );
        } else {
            $stmt = $conn->prepare(
                "INSERT INTO students (first_name, last_name, email, class_id)"
              . " VALUES (?, ?, ?, ?)"
            );
            $stmt->bind_param("sssi",
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['class_id']
            );
        }

        try {
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Étudiant ajouté"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
            }
        } catch (mysqli_sql_exception $e) {
            echo json_encode(["success" => false, "message" => "Erreur BDD: " . $e->getMessage()]);
        }
        $stmt->close();
        break;


    // =========================
    // PUT - Modifier étudiant
    // =========================
    case 'PUT':

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID requis"]);
            exit;
        }

        // check for date_of_birth column as above
        $hasDob = false;
        $colRes = $conn->query("SHOW COLUMNS FROM students LIKE 'date_of_birth'");
        if ($colRes && $colRes->num_rows > 0) {
            $hasDob = true;
        }

        if ($hasDob) {
            $stmt = $conn->prepare("
                UPDATE students
                SET first_name=?, last_name=?, email=?, class_id=?, date_of_birth=?
                WHERE id=?
            ");
            $dob = isset($data['date_of_birth']) ? $data['date_of_birth'] : null;
            $stmt->bind_param("sssisi",
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['class_id'],
                $dob,
                $data['id']
            );
        } else {
            $stmt = $conn->prepare("
                UPDATE students
                SET first_name=?, last_name=?, email=?, class_id=?
                WHERE id=?
            ");
            $stmt->bind_param("sssii",
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['class_id'],
                $data['id']
            );
        }

        try {
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Étudiant modifié"]);
            } else {
                echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
            }
        } catch (mysqli_sql_exception $e) {
            echo json_encode(["success" => false, "message" => "Erreur BDD: " . $e->getMessage()]);
        }
        $stmt->close();
        break;


    // =========================
    // DELETE - Supprimer étudiant
    // =========================
    case 'DELETE':

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['id'])) {
            echo json_encode(["success" => false, "message" => "ID requis"]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM students WHERE id=?");
        $stmt->bind_param("i", $data['id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Étudiant supprimé"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        $stmt->close();
        break;

}

$conn->close();
?>