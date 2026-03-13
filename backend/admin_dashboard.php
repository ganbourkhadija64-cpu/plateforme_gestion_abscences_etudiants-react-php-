<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "config.php";

/* TOTAL ABSENCES */
$result = $conn->query("SELECT COUNT(*) as total FROM absences");
$totalAbsences = $result ? $result->fetch_assoc()["total"] : 0;

/* TOTAL JUSTIFIED */
$result = $conn->query("SELECT COUNT(*) as total FROM absences WHERE justified = 1");
$totalJustified = $result ? $result->fetch_assoc()["total"] : 0;

/* TOTAL STUDENTS */
$result = $conn->query("SELECT COUNT(*) as total FROM students");
$totalStudents = $result ? $result->fetch_assoc()["total"] : 0;

/* TOTAL CLASSES */
$result = $conn->query("SELECT COUNT(*) as total FROM classes");
$totalClasses = $result ? $result->fetch_assoc()["total"] : 0;

/* TAUX */
$taux = $totalStudents > 0 
        ? round(($totalAbsences / ($totalStudents * 10)) * 100,1)
        : 0;

/* TOP STUDENTS */
$topStudentsResult = $conn->query("
    SELECT CONCAT(s.first_name,' ',s.last_name) as name,
           COUNT(a.id) as absences
    FROM students s
    LEFT JOIN absences a ON s.id = a.student_id
    GROUP BY s.id
    ORDER BY absences DESC
    LIMIT 5
");

$topStudents = [];
while($row = $topStudentsResult->fetch_assoc()){
    $topStudents[] = $row;
}

/* ABSENCES BY CLASS */
$absByClassResult = $conn->query("
    SELECT c.name,
           COUNT(a.id) as value
    FROM classes c
    LEFT JOIN students s ON s.class_id = c.id
    LEFT JOIN absences a ON a.student_id = s.id
    GROUP BY c.id
");

$absByClass = [];
while($row = $absByClassResult->fetch_assoc()){
    // transform name/value to class/absences for frontend convenience
    $absByClass[] = [
        "class" => $row['name'],
        "absences" => intval($row['value'])
    ];
}

echo json_encode([
    "success"=>true,
    "totalAbsences"=>$totalAbsences,
    "totalJustified"=>$totalJustified,
    "totalStudents"=>$totalStudents,
    "totalClasses"=>$totalClasses,
    "taux"=>$taux,
    "topStudents"=>$topStudents,
    "absByClass"=>$absByClass
]);