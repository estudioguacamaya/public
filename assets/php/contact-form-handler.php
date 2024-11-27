<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recoger los datos del formulario
    $name = sanitize_input($_POST['name']);
    $email = sanitize_input($_POST['email']);
    $empresa = sanitize_input($_POST['empresa']);
    $telefono = sanitize_input($_POST['telefono']);
    $category = sanitize_input($_POST['category']);
    $message = sanitize_input($_POST['message']);

    // Dirección de correo electrónico donde se enviará el formulario
    $to = "estudioguacamayacontacto@gmail.com";  // Reemplaza con tu dirección de correo
    $subject = "Nuevo mensaje de contacto de $name";

    // Construir el contenido del mensaje
    $body = "
    Nombre: $name\n
    Correo: $email\n
    Empresa: $empresa\n
    Teléfono: $telefono\n
    Categoría: $category\n
    Mensaje: $message
    ";

    // Cabeceras para el correo
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Enviar el correo
    if (mail($to, $subject, $body, $headers)) {
        echo "Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.";
    } else {
        echo "Hubo un problema al enviar tu mensaje. Por favor, inténtalo nuevamente más tarde.";
    }
}

// Función para sanear los datos y evitar inyecciones
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
?>
