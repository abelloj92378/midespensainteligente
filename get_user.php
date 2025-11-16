<?php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    send_json(['logged' => false]);
}

send_json(['logged' => true, 'user' => ['id'=>$_SESSION['user_id'], 'nombre'=>$_SESSION['nombre']]]);
