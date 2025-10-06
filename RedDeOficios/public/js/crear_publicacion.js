document.getElementById('formPublicacion').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  // 🪲 DEBUG: Mostrar qué datos se están enviando
  console.log("📤 Enviando datos al servidor:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await fetch('/publicacion', {
      method: 'POST',
      body: formData
    });

    // Verificar respuesta cruda (por si no es JSON válido)
    const text = await response.text();
    console.log("📩 Respuesta del servidor (raw):", text);

    let result;
    try {
      result = JSON.parse(text);
    } catch (err) {
      alert("Error: la respuesta del servidor no es JSON válido.");
      console.error("❌ Error parseando JSON:", err);
      return;
    }

    alert(result.message);
    if (result.success) {
      window.location.href = 'index.html';
    }

  } catch (error) {
    console.error("🚨 Error en la solicitud:", error);
    alert("Error de conexión con el servidor.");
  }
});
