const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Verificamos que el método de la solicitud sea POST
  if (event.httpMethod === "POST") {
    // Extraemos los datos del formulario desde el cuerpo de la solicitud
    const { name, email, empresa, telefono, category, message } = JSON.parse(event.body);

    // Configuramos el transportador de nodemailer usando las variables de entorno
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,  // Usamos la variable de entorno GMAIL_USER
        pass: process.env.GMAIL_PASS   // Usamos la variable de entorno GMAIL_PASS
      }
    });

    // Definimos el contenido del correo
    const mailOptions = {
      from: email,  // El correo del remitente
      to: "estudioguacamayacontacto@gmail.com",  // El correo al que quieres que se envíen los mensajes
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `
        Nombre: ${name}
        Correo: ${email}
        Empresa: ${empresa}
        Teléfono: ${telefono}
        Categoría: ${category}
        Mensaje: ${message}
      `
    };

    // Intentamos enviar el correo
    try {
      await transporter.sendMail(mailOptions);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Correo enviado con éxito" })
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Hubo un problema al enviar el correo", error: error.message })
      };
    }
  } else {
    // Si el método no es POST, devolvemos un error
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" })
    };
  }
};
