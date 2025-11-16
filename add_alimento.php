<?php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    send_json(['success' => false, 'message' => 'No autenticado']);
}

$input = json_decode(file_get_contents('php://input'), true);
$nombre = trim($input['nombre'] ?? '');
$fecha = trim($input['fecha'] ?? '');

if (!$nombre || !$fecha) {
    http_response_code(400);
    send_json(['success' => false, 'message' => 'Completa todos los campos']);
}

$stmt = $pdo->prepare("INSERT INTO alimentos (usuario_id, nombre, fecha) VALUES (?, ?, ?)");
$stmt->execute([$_SESSION['user_id'], $nombre, $fecha]);

send_json(['success' => true, 'message' => 'Alimento guardado']);
