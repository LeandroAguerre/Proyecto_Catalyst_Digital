<?php

class Database {
    private $host = 'db';
    private $db_name = 'reddeoficios';
    private $username = 'reddeoficios_app';
    private $password = 'pass_app';
    public $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Error de conexión a la base de datos: " . $exception->getMessage());
            die("Error de conexión a la base de datos.");
        }
        return $this->conn;
    }
}