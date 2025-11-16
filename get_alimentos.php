<?php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    send_json(['success' => false, 'message' => 'No autenticado']);
}

$stmt = $pdo->prepare("SELECT id, nombre, fecha FROM alimentos WHERE usuario_id = ? ORDER BY fecha ASC");
$stmt->execute([$_SESSION['user_id']]);
$alimentos = $stmt->fetchAll();

send_json(['success' => true, 'alimentos' => $alimentos]);
