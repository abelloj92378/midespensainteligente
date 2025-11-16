<?php
require 'db.php';

// Esperamos JSON
$input = json_decode(file_get_contents('php://input'), true);

$nombre = trim($input['nombre'] ?? '');
$correo = trim($input['correo'] ?? '');
$password = $input['password'] ?? '';

if (!$nombre || !$correo || !$password) {
    http_response_code(400);
    send_json(['success' => false, 'message' => 'Completa todos los campos.']);
}

// Verificar si el correo ya existe
$stmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
$stmt->execute([$correo]);
if ($stmt->fetch()) {
    http_response_code(409);
    send_json(['success' => false, 'message' => 'El correo ya está registrado.']);
}

// Hashear contraseña
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)");
$stmt->execute([$nombre, $correo, $hash]);

$userId = $pdo->lastInsertId();

// Crear sesión
$_SESSION['user_id'] = (int)$userId;
$_SESSION['nombre'] = $nombre;

send_json(['success' => true, 'message' => 'Usuario registrado correctamente', 'user' => ['id'=>$userId, 'nombre'=>$nombre]]);
