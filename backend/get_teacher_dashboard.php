<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connect to DB
$conn = new mysqli("localhost", "root", "", "gestion_absences");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => $conn->connect_error]));
}

$teacher_id = intval($_GET['teacher_id'] ?? 0);

// Total Absences
$stmt = $conn->prepare("
    SELECT COUNT(*) as total
    FROM absences a
    JOIN matieres m ON a.matiere_id = m.id
    WHERE m.teacher_id = ?
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$totalAbsences = $result->fetch_assoc()['total'] ?? 0;
$stmt->close();

// Total Matieres
$stmt = $conn->prepare("
    SELECT COUNT(*) as total
    FROM matieres
    WHERE teacher_id = ?
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$totalMatieres = $result->fetch_assoc()['total'] ?? 0;
$stmt->close();

// Total Etudiants
$stmt = $conn->prepare("
    SELECT COUNT(DISTINCT a.student_id) as total
    FROM absences a
    JOIN matieres m ON a.matiere_id = m.id
    WHERE m.teacher_id = ?
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$totalEtudiants = $result->fetch_assoc()['total'] ?? 0;
$stmt->close();

// Absences By Matiere
$stmt = $conn->prepare("
    SELECT m.name as matiere, COUNT(a.id) as absences
    FROM matieres m
    LEFT JOIN absences a ON a.matiere_id = m.id
    WHERE m.teacher_id = ?
    GROUP BY m.id
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$absencesByMatiere = [];
while ($row = $result->fetch_assoc()) {
    $absencesByMatiere[] = [
        "matiere" => $row['matiere'],
        "absences" => intval($row['absences'])
    ];
}
$stmt->close();

// Absences By Class
$stmt = $conn->prepare("
    SELECT c.name as class, COUNT(a.id) as absences
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    LEFT JOIN absences a ON a.student_id = s.id
    LEFT JOIN matieres m ON a.matiere_id = m.id AND m.teacher_id = ?
    GROUP BY c.id
");
$stmt->bind_param("i", $teacher_id);
$stmt->execute();
$result = $stmt->get_result();
$absencesByClass = [];
while ($row = $result->fetch_assoc()) {
    $absencesByClass[] = [
        "class" => $row['class'],
        "absences" => intval($row['absences'])
    ];
}
$stmt->close();

// Close connection
$conn->close();

// Return JSON
echo json_encode([
    "success" => true,
    "totalAbsences" => intval($totalAbsences),
    "totalMatieres" => intval($totalMatieres),
    "totalEtudiants" => intval($totalEtudiants),
    "absencesByMatiere" => $absencesByMatiere,
    "absencesByClass" => $absencesByClass
]);