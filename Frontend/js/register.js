const formularioRegistro = document.getElementById('formularioRegistro');
const mensajeDiv = document.querySelector('.mensaje');

formularioRegistro.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const confirmacion = document.getElementById('confirmar_contrasena').value;

    // Validación frontend
    if (!validarNombre(nombre)) return;
    if (!validarCorreo(correo)) return;
    if (!validarContrasena(contrasena)) return;
    if (!validarConfirmacion(contrasena, confirmacion)) return;

    // Registro con backend
    registrarUsuario(nombre, correo, contrasena);
});

function validarNombre(nombre) {
    const errorNombre = document.querySelector('.error-nombre');

    if (!nombre) {
        errorNombre.textContent = 'El nombre es obligatorio';
        return false;
    }

    if (nombre.length < 3) {
        errorNombre.textContent = 'El nombre debe tener al menos 3 caracteres';
        return false;
    }

    errorNombre.textContent = '';
    return true;
}

function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorCorreo = document.querySelector('.error-correo');

    if (!correo) {
        errorCorreo.textContent = 'El correo es obligatorio';
        return false;
    }

    if (!regex.test(correo)) {
        errorCorreo.textContent = 'Ingrese un correo válido';
        return false;
    }

    errorCorreo.textContent = '';
    return true;
}

function validarContrasena(contrasena) {
    const errorContrasena = document.querySelector('.error-contrasena');

    if (!contrasena) {
        errorContrasena.textContent = 'La contraseña es obligatoria';
        return false;
    }

    if (contrasena.length < 6) {
        errorContrasena.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return false;
    }

    errorContrasena.textContent = '';
    return true;
}

function validarConfirmacion(contrasena, confirmacion) {
    const errorConfirmacion = document.querySelector('.error-confirmacion');

    if (contrasena !== confirmacion) {
        errorConfirmacion.textContent = 'Las contraseñas no coinciden';
        return false;
    }

    errorConfirmacion.textContent = '';
    return true;
}

function registrarUsuario(nombre, correo, contrasena) {
    fetch('http://localhost:5000/api/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nombre: nombre,
            correo: correo,
            contrasena: contrasena
        })
    })
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.exito) {
                mostrarMensaje(datos.mensaje, 'exito');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                mostrarMensaje(datos.mensaje, 'error');
            }
        })
        .catch(error => {
            mostrarMensaje('Error al conectar con el servidor', 'error');
        });
}

function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = `mensaje alert alert-${tipo === 'error' ? 'danger' : 'success'}`;
}