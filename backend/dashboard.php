<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include "config.php";

// gérer preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Total absences
$totalAbsences = $conn->query("SELECT COUNT(*) AS total FROM absences")
                      ->fetch_assoc()['total'];

// Absences justifiées
$justifiees = $conn->query("SELECT COUNT(*) AS total FROM absences WHERE est_justifie=1")
                   ->fetch_assoc()['total'];

// Nombre étudiants
$students = $conn->query("SELECT COUNT(*) AS total FROM etudiants")
                 ->fetch_assoc()['total'];

// Nombre classes
$classes = $conn->query("SELECT COUNT(*) AS total FROM classes")
                ->fetch_assoc()['total'];

// Top étudiants
$topStudents = [];
$result = $conn->query("
    SELECT etudiants.nom, COUNT(absences.id) AS nb_absences
    FROM absences
    JOIN etudiants ON absences.etudiant_id = etudiants.id
    GROUP BY etudiants.nom
    ORDER BY nb_absences DESC
    LIMIT 5
");
while($row = $result->fetch_assoc()){
    $topStudents[] = $row;
}

// Absences par classe
$absByClass = [];
$result = $conn->query("
    SELECT classes.nom AS nom, COUNT(absences.id) AS nb_absences
    FROM absences
    JOIN etudiants ON absences.etudiant_id = etudiants.id
    JOIN classes ON etudiants.classe_id = classes.id
    GROUP BY classes.nom
");
while($row = $result->fetch_assoc()){
    $absByClass[] = $row;
}

echo json_encode([
    'totalAbsences' => $totalAbsences,
    'justifiees' => $justifiees,
    'students' => $students,
    'classes' => $classes,
    'topStudents' => $topStudents,
    'absByClass' => $absByClass
]);