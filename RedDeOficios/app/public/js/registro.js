//Obtiene el elemento del formulario con el id registroForm y le añade un evento para "escuchar"
//Este "escuchador" esta atento a cuando el formulario es enviado (submit)
document.getElementById('registroForm').addEventListener('submit', function(event) {
    //Evita que el formulario se envie de la forma tradicional (recargando la pagina)
    event.preventDefault(); 

    //Almacena el formulario que lanzo el evento
    const form = event.target;
    //Crea un objeto FormData que captura todos los datos del formulario
     const formData = new FormData(form);

    //Realiza una peticion de red al servidor usando fetch
    //La URL apunta a nuestro enrutador PHP, diciendo que la accion es registro
    fetch('/api.php?request=registro', {
        method: 'POST',
        //Body formdata son los datos del formulario que capturamos
        body: formData
    })
    //Maneja la respuesta inicial del servidor response.ok verifica si la respuesta fue exitosa
    .then(response => {
        //Si la respuesta no fue exitosa, lanza un error para que sea capturado por el 'catch'
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        //Convierte la respuesta del servidor a un objeto JSON para poder usar los datos
        return response.json();
    })
    //Se ejecuta si la conversion a JSON fue exitosa data contiene los datos de la respuesta JSON
    .then(data => {
        //Obtiene el div donde se mostraran los mensajes de respuesta
        const mensajeDiv = document.getElementById('mensaje_respuesta');
        //Comprueba el status en la respuesta JSON para saber si el registro fue exitoso
        if (data.status === 'success') {
            //Si es exitoso, muestra un mensaje de exito
            mensajeDiv.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            // Limpia el formulario para que el usuario pueda registrar otro.
            form.reset();
        } else {
            //Si no es exitoso, muestra un mensaje de error
            mensajeDiv.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    })
    //Se ejecuta si ocurre un error en cualquier punto de la peticion (fetch, throw new Error, etc)
    .catch(error => {
        //Muestra el error en la consola del navegador
        console.error('Error:', error);
        //Muestra un mensaje de error generico en la pagina para el usuario
        document.getElementById('mensaje_respuesta').innerHTML = `<div class="alert alert-danger">Ocurrió un error inesperado. Por favor, inténtelo de nuevo.</div>`;
    });
});