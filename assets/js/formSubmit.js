// formSubmit.js
document.getElementById("contactForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Evita el envío tradicional del formulario

    const formData = new FormData(event.target);
    const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        empresa: formData.get("empresa"),
        telefono: formData.get("telefono"),
        category: formData.get("category"),
        message: formData.get("message")
    };

    const response = await fetch("/.netlify/functions/sendEmail", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const result = await response.json();

    if (response.ok) {
        document.getElementById("msgSubmit").innerText = "¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.";
    } else {
        document.getElementById("msgSubmit").innerText = "Hubo un problema al enviar tu mensaje. Intenta de nuevo.";
    }
});
