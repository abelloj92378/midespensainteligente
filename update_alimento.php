<?php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    send_json(['success' => false, 'message' => 'No autenticado']);
}

$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['id'] ?? 0);
$nombre = trim($input['nombre'] ?? '');
$fecha = trim($input['fecha'] ?? '');

if (!$id || !$nombre || !$fecha) {
    http_response_code(400);
    send_json(['success' => false, 'message' => 'Datos incompletos']);
}

// Verificar propiedad
$stmt = $pdo->prepare("SELECT id FROM alimentos WHERE id = ? AND usuario_id = ?");
$stmt->execute([$id, $_SESSION['user_id']]);
if (!$stmt->fetch()) {
    http_response_code(403);
    send_json(['success' => false, 'message' => 'No permitido']);
}

$stmt = $pdo->prepare("UPDATE alimentos SET nombre = ?, fecha = ? WHERE id = ?");
$stmt->execute([$nombre, $fecha, $id]);

send_json(['success' => true, 'message' => 'Alimento actualizado']);
