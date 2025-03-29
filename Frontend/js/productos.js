document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const contenedorProductos = document.getElementById('contenedorProductos');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const mensajeDiv = document.getElementById('mensaje');
    const btnGuardar = document.getElementById('btnGuardarProducto');
    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    const formulario = document.getElementById('formularioProducto');

    btnNuevoProducto.addEventListener('click', mostrarFormularioProducto);
    btnCerrarSesion.addEventListener('click', cerrarSesion);
    btnGuardar.addEventListener('click', guardarProducto);
    document.querySelector('[data-dismiss="modal"]').addEventListener('click', () => modal.hide());

    function cargarProductos() {
        fetch('http://localhost:5000/api/productos', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(handleResponse)
        .then(mostrarProductos)
        .catch(() => mostrarMensaje('Error al cargar productos', 'error'));
    }

    function mostrarProductos(productos) {
        // Limpiar contenedor
        while (contenedorProductos.firstChild) {
            contenedorProductos.removeChild(contenedorProductos.firstChild);
        }

        if (productos.length === 0) {
            const mensaje = document.createElement('div');
            mensaje.className = 'col-12';
            
            const parrafo = document.createElement('p');
            parrafo.textContent = 'No tienes productos registrados';
            
            mensaje.appendChild(parrafo);
            contenedorProductos.appendChild(mensaje);
            return;
        }

        productos.forEach(producto => {
            contenedorProductos.appendChild(crearCardProducto(producto));
        });

        agregarEventListeners();
    }

    function crearCardProducto(producto) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';

        const card = document.createElement('div');
        card.className = 'card';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const titulo = document.createElement('h5');
        titulo.className = 'card-title';
        titulo.textContent = producto.nombre;

        const descripcion = document.createElement('p');
        descripcion.className = 'card-text';
        descripcion.textContent = producto.descripcion || 'Sin descripción';

        // Crear elementos para precio
        const precioContainer = document.createElement('p');
        precioContainer.className = 'card-text';
        
        const precioLabel = document.createElement('strong');
        precioLabel.textContent = 'Precio: ';
        
        const precioValor = document.createTextNode(` $${producto.precio.toFixed(2)}`);
        
        precioContainer.appendChild(precioLabel);
        precioContainer.appendChild(precioValor);

        // Crear elementos para stock
        const stockContainer = document.createElement('p');
        stockContainer.className = 'card-text';
        
        const stockLabel = document.createElement('strong');
        stockLabel.textContent = 'Stock: ';
        
        const stockValor = document.createTextNode(` ${producto.cantidad}`);
        
        stockContainer.appendChild(stockLabel);
        stockContainer.appendChild(stockValor);

        // Botones
        const btnEditar = document.createElement('button');
        btnEditar.className = 'btn btn-primary btn-editar';
        btnEditar.textContent = 'Editar';
        btnEditar.dataset.id = producto.id;

        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger btn-eliminar';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.dataset.id = producto.id;

        // Construir la card
        cardBody.appendChild(titulo);
        cardBody.appendChild(descripcion);
        cardBody.appendChild(precioContainer);
        cardBody.appendChild(stockContainer);
        cardBody.appendChild(btnEditar);
        cardBody.appendChild(btnEliminar);

        card.appendChild(cardBody);
        col.appendChild(card);

        return col;
    }

    function agregarEventListeners() {
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => cargarProductoParaEditar(btn.dataset.id));
        });

        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => eliminarProducto(btn.dataset.id));
        });
    }

    function mostrarFormularioProducto() {
        document.getElementById('productoId').value = '';
        document.getElementById('tituloModal').textContent = 'Nuevo Producto';
        formulario.reset();
        limpiarErrores();
        modal.show();
    }

    function cargarProductoParaEditar(id) {
        fetch(`http://localhost:5000/api/productos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(handleResponse)
        .then(producto => {
            document.getElementById('productoId').value = producto.id;
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('descripcion').value = producto.descripcion || '';
            document.getElementById('precio').value = producto.precio;
            document.getElementById('cantidad').value = producto.cantidad;
            document.getElementById('tituloModal').textContent = 'Editar Producto';
            limpiarErrores();
            modal.show();
        })
        .catch(() => mostrarMensaje('Error al cargar producto', 'error'));
    }

    function guardarProducto() {
        const productoId = document.getElementById('productoId').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        const cantidad = parseInt(document.getElementById('cantidad').value);

        limpiarErrores();
        let esValido = true;

        if (!nombre) {
            mostrarError('nombre', 'El nombre es requerido');
            esValido = false;
        }

        if (isNaN(precio) || precio <= 0) {
            mostrarError('precio', 'El precio debe ser un número positivo');
            esValido = false;
        }

        if (isNaN(cantidad) || cantidad < 0) {
            mostrarError('cantidad', 'La cantidad debe ser un número positivo');
            esValido = false;
        }

        if (!esValido) return;

        const productoData = {
            nombre,
            descripcion: descripcion || null,
            precio,
            cantidad
        };

        const url = productoId ? `http://localhost:5000/api/productos/${productoId}` : 'http://localhost:5000/api/productos';
        const method = productoId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productoData)
        })
        .then(handleResponse)
        .then(data => {
            mostrarMensaje(data.mensaje || 'Producto guardado exitosamente', 'success');
            modal.hide();
            cargarProductos();
        })
        .catch(error => {
            mostrarMensajeModal('Error: ' + error.message, 'error');
        });
    }

    function eliminarProducto(id) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        fetch(`http://localhost:5000/api/productos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(handleResponse)
        .then(data => {
            mostrarMensaje(data.mensaje || 'Producto eliminado exitosamente', 'success');
            cargarProductos();
        })
        .catch(error => {
            mostrarMensaje('Error al eliminar el producto: ' + error.message, 'error');
        });
    }

    function handleResponse(response) {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Error en la respuesta'); });
        }
        return response.json();
    }

    function mostrarMensaje(texto, tipo) {
        // Limpiar mensaje anterior
        while (mensajeDiv.firstChild) {
            mensajeDiv.removeChild(mensajeDiv.firstChild);
        }
        
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'}`;
        mensajeDiv.style.display = 'block';
        
        setTimeout(() => {
            mensajeDiv.style.display = 'none';
        }, 5000);
    }

    function mostrarMensajeModal(texto, tipo) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} mt-3`;
        alert.textContent = texto;

        const modalBody = document.querySelector('.modal-body');
        const existing = modalBody.querySelector('.alert');
        if (existing) modalBody.removeChild(existing);
        
        modalBody.appendChild(alert);
    }

    function mostrarError(campo, mensaje) {
        const errorElement = document.querySelector(`.error-${campo}`);
        const inputElement = document.getElementById(campo);
        
        inputElement.classList.add('is-invalid');
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }

    function limpiarErrores() {
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        document.querySelectorAll('.invalid-feedback').forEach(error => {
            error.style.display = 'none';
        });
    }

    function cerrarSesion() {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    }

    cargarProductos();
});