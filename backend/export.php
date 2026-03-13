<?php
require 'config.php';

// allow CORS and JSON content
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// determine filter values depending on method
$classe_id = '';
$date_debut = '';
$date_fin = '';
$format = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $classe_id   = $input['class_id']   ?? $input['classe_id'] ?? '';
    $date_debut  = $input['start_date'] ?? $input['date_debut'] ?? '';
    $date_fin    = $input['end_date']   ?? $input['date_fin'] ?? '';
    $format      = $input['format'] ?? '';
} else {
    // GET parameters for backwards compatibility / direct download
    $classe_id  = $_GET['classe_id'] ?? '';
    $date_debut = $_GET['date_debut'] ?? '';
    $date_fin   = $_GET['date_fin'] ?? '';
    $format     = $_GET['format'] ?? '';
}

// build query
$sql = "SELECT 
            a.id,
            s.first_name,
            s.last_name,
            c.name AS class_name,
            m.name AS subject_name,
            a.date,
            a.justified,
            j.reason AS motif
        FROM absences a
        JOIN students s ON a.student_id = s.id
        LEFT JOIN classes c ON s.class_id = c.id
        JOIN matieres m ON a.matiere_id = m.id
        LEFT JOIN justifications j ON a.id = j.absence_id
        WHERE 1=1";

$params = [];
if (!empty($classe_id) && $classe_id !== 'all') {
    $sql .= " AND c.id = ?";
    $params[] = $classe_id;
}
if (!empty($date_debut)) {
    $sql .= " AND a.date >= ?";
    $params[] = $date_debut;
}
if (!empty($date_fin)) {
    $sql .= " AND a.date <= ?";
    $params[] = $date_fin;
}

// decide which connection to use (pdo available)
// use PDO for ease of fetchAll
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

// if POST request then respond with JSON (count + data for frontend)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $count = count($data);
    header("Content-Type: application/json");
    echo json_encode(["success" => true, "count" => $count, "data" => $data]);
    exit;
}

// otherwise fallback to direct download (GET). we default to CSV output.
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=export_absences.csv');

$output = fopen('php://output', 'w');
fputcsv($output, ['ID', 'Nom', 'Prénom', 'Classe', 'Matière', 'Date', 'Statut', 'Motif']);

foreach ($data as $row) {
    fputcsv($output, [
        $row['id'],
        $row['last_name'],
        $row['first_name'],
        $row['class_name'],
        $row['subject_name'],
        $row['date'],
        $row['justified'] ? 'Justifiée' : 'Non justifiée',
        $row['motif'] ?? ''
    ]);
}

fclose($output);
exit;