<?php
session_start();

require 'db.php';

if (!function_exists('send_json')) {
    function send_json($data) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;
    }
}

// --- Leer entrada de datos JSON ---
$input = json_decode(file_get_contents('php://input'), true);
$correo   = trim($input['correo'] ?? '');
$password = $input['password'] ?? '';

if (!$correo || !$password) {
    http_response_code(400);
    send_json(['success' => false, 'message' => 'Completa todos los campos.']);
}

// --- Buscar usuario ---
try {
    $stmt = $pdo->prepare("SELECT id, nombre, password FROM usuarios WHERE correo = ?");
    $stmt->execute([$correo]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    // escribir en log del servidor para diagnóstico
    error_log("DB error en login.php: " . $e->getMessage());
    send_json(['success' => false, 'message' => 'Error interno (DB).']);
}

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    send_json(['success' => false, 'message' => 'Credenciales inválidas.']);
}

// --- Contadores ---

// 1) Contador en cookie (total)
// Observación: $_COOKIE refleja los valores enviados por el navegador **al iniciar la petición**.
// Si la cookie no existe en la petición, asumimos 0 y creamos cookie = 1.
function contarVisitasConCookie(&$cookie_was_set) {
    // valor actual recibido en la petición
    $actual = isset($_COOKIE['visitas']) ? intval($_COOKIE['visitas']) : 0;
    $nuevo = $actual + 1;

    // opciones: 30 días, ruta raíz, SameSite Lax para compatibilidad, httponly false para que JS la pueda leer si quieres
    $expires = time() + 86400 * 30;
    $options = [
        'expires' => $expires,
        'path' => '/',
        'secure' => false,    
        'httponly' => false,      // false para permitir que JS lea document.cookie si lo necesitas
        'samesite' => 'Lax'       // evita problemas en algunas integraciones
    ];

    // Intentar crear la cookie y detectar si headers ya se enviaron
    if (!headers_sent()) {
        // nuevo estilo (PHP 7.3+)
        setcookie('visitas', (string)$nuevo, $options);
        $cookie_was_set = true;
    } else {
        // No se pudo enviar la cookie porque ya se enviaron headers -> marcar para depuración
        $cookie_was_set = false;
        error_log("login.php: NO se pudo setear cookie 'visitas' porque headers ya fueron enviados.");
    }

    return $nuevo;
}

// 2) Contador en sesión (visitas dentro de la sesión PHP)
function contarVisitasDeSesion() {
    if (!isset($_SESSION['conteo_sesion'])) {
        $_SESSION['conteo_sesion'] = 1;
    } else {
        $_SESSION['conteo_sesion']++;
    }
    return $_SESSION['conteo_sesion'];
}

// --- Crear sesión de usuario ---
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['nombre']  = $user['nombre'];

// Ejecutar contadores
$cookie_set_flag = false;
$totalVisitas = contarVisitasConCookie($cookie_set_flag);
$visitasSesion = contarVisitasDeSesion();

// Para depuración: indicar el cookie actual enviado en la petición (si existe)
$cookie_recibida = isset($_COOKIE['visitas']) ? intval($_COOKIE['visitas']) : null;

// Responder JSON con info y banderas de depuración
send_json([
    'success' => true,
    'message' => 'Inicio de sesión exitoso',
    'user' => [
        'id' => $user['id'],
        'nombre' => $user['nombre']
    ],
    'visitas' => [
        'total' => $totalVisitas,
        'sesion' => $visitasSesion
    ],
    // información de depuración útil (puedes eliminar luego)
    'debug' => [
        'cookie_received_in_request' => $cookie_recibida,
        'cookie_set_in_response' => $cookie_set_flag,
        'headers_already_sent' => headers_sent() ? true : false
    ]
]);
