<?php
require 'db.php';

session_unset();
session_destroy();

send_json(['success' => true, 'message' => 'Sesión cerrada']);
