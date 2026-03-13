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

$teacherId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

$sql = "
    SELECT a.id,
           a.date,
           CONCAT(s.first_name,' ',s.last_name) AS etudiant,
           c.name AS classe,
           m.name AS matiere,
           a.justified,
           j.reason AS motif
    FROM absences a
    JOIN students s ON a.student_id = s.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN matieres m ON a.matiere_id = m.id
    LEFT JOIN justifications j ON a.id = j.absence_id
";

if ($teacherId) {
    $sql .= " WHERE m.teacher_id = $teacherId";
}

$sql .= " ORDER BY a.date DESC";

$result = $conn->query($sql);
$absences = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['statut'] = $row['justified'] ? 'Justifiée' : 'Non justifiée';
        if ($row['motif'] === null) {
            $row['motif'] = '';
        }
        unset($row['justified']);
        $absences[] = $row;
    }
}

echo json_encode(["success" => true, "absences" => $absences]);
$conn->close();
?>