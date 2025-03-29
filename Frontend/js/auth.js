document.addEventListener('DOMContentLoaded', function() {
    const formularioLogin = document.getElementById('formulario_login');
    const mensajeDiv = document.querySelector('.mensaje');

    formularioLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        
        if (!validarCorreo(correo) || !validarContrasena(contrasena)) {
            return;
        }
        
        autenticarUsuario(correo, contrasena);
    });

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

    function autenticarUsuario(correo, contrasena) {
        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correo,
                contrasena: contrasena
            })
        })
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.exito) {
                localStorage.setItem('token', datos.token);
                window.location.href = 'panel.html';
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
});