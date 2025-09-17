<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "cliente_login";

// Conexão
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Pegar dados do formulário
$nome = $_POST['nome'];
$cpf = $_POST['cpf'];
$email_telefone = $_POST['email_telefone'];
$senha = password_hash($_POST['senha'], PASSWORD_DEFAULT);

// Inserir no banco
$stmt = $conn->prepare("INSERT INTO responsavel (nome, cpf, email_telefone, senha) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $nome, $cpf, $email_telefone, $senha);

if ($stmt->execute()) {
    echo "Cadastro realizado com sucesso!";
} else {
    echo "Erro: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
