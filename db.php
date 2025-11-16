<?php


$db_host = 'localhost';
$db_name = 'despensa_inteligente';
$db_user = 'root';
$db_pass = '';
$db_port = 3307;

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
 
    // Cadena DSN 
    $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";
    
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Iniciar sesión (necesario para mantener al usuario logueado)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// enviar JSON
function send_json($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
