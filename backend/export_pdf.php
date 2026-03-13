<?php
require 'config.php';

// try to load TCPDF; if the library is not installed we will fallback to a simple text output
$tcpdfPath = __DIR__ . '/tcpdf/tcpdf.php';
$haveTcpdf = false;
if (file_exists($tcpdfPath)) {
    require_once($tcpdfPath);
    $haveTcpdf = true;
}

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$classe_id = $_GET['classe_id'] ?? '';
$date_debut = $_GET['date_debut'] ?? '';
$date_fin = $_GET['date_fin'] ?? '';

$sql = "SELECT 
            s.first_name,
            s.last_name,
            c.name AS classe,
            m.name AS matiere,
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

if (!empty($classe_id)) {
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

// use PDO for convenience (config.php defines $pdo)
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$haveTcpdf) {
    // library not available, provide fallback notification
    header('Content-Type: text/plain; charset=utf-8');
    echo "Erreur : la bibliothèque TCPDF est introuvable\n";
    echo "Copiez le dossier 'tcpdf' dans backend/ ou installez-le via composer.\n";
    echo "Export PDF indisponible pour le moment.";
    exit;
}

$pdf = new TCPDF();
$pdf->AddPage();
$pdf->SetFont('helvetica', '', 10);

$html = '<h2>Export des absences</h2>';
$html .= '<table border="1" cellpadding="5">
<tr>
<th>Nom</th>
<th>Prénom</th>
<th>Classe</th>
<th>Matière</th>
<th>Date</th>
<th>Statut</th>
<th>Motif</th>
</tr>';

foreach ($data as $row) {
    $html .= '<tr>
    <td>'.$row['last_name'].'</td>
    <td>'.$row['first_name'].'</td>
    <td>'.$row['classe'].'</td>
    <td>'.$row['matiere'].'</td>
    <td>'.$row['date'].'</td>
    <td>'.($row['justified'] ? 'Justifiée' : 'Non justifiée').'</td>
    <td>'.($row['motif'] ?? '').'</td>
    </tr>';}

$html .= '</table>';

$pdf->writeHTML($html);
$pdf->Output('export_absences.pdf', 'D');
exit;