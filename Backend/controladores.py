from flask import request, jsonify
from modelos import db, Usuario, Producto
import jwt
from datetime import datetime, timedelta


def registrar_usuario():
    datos = request.get_json()
    
    # Validar que todos los campos estén presentes
    if not datos or not datos.get('nombre') or not datos.get('correo') or not datos.get('contrasena'):
        return jsonify({'mensaje': 'Todos los campos son obligatorios', 'error': True}), 400
    
    # Verificar si el usuario ya existe
    usuario_existente = Usuario.query.filter_by(correo=datos['correo']).first()
    if usuario_existente:
        return jsonify({'mensaje': 'El correo ya está registrado', 'error': True}), 400
    
    # Crear nuevo usuario con contraseña en texto plano
    nuevo_usuario = Usuario(
        nombre=datos['nombre'],
        correo=datos['correo'],
        contrasena=datos['contrasena']  # Guardamos la contraseña tal cual
    )
    
    db.session.add(nuevo_usuario)
    db.session.commit()
    
    return jsonify({'mensaje': 'Usuario registrado con éxito', 'exito': True}), 201


def iniciar_sesion():
    datos = request.get_json()
    
    if not datos or not datos.get('correo') or not datos.get('contrasena'):
        return jsonify({'mensaje': 'Correo y contraseña son obligatorios', 'error': True}), 400
    
    usuario = Usuario.query.filter_by(correo=datos['correo']).first()
    print(usuario)
    
    # Verificamos si la contraseña proporcionada es correcta (en texto plano)
    if not usuario or not (usuario.contrasena == datos['contrasena']):
        return jsonify({'mensaje': 'Correo o contraseña incorrectos', 'error': True}), 401
    
    # Crear token JWT
    token = jwt.encode({
        'usuario_id': usuario.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, 'clave_secreta_parcial', algorithm='HS256')
    
    return jsonify({
        'mensaje': 'Inicio de sesión exitoso',
        'exito': True,
        'token': token
    }), 200

def manejar_productos(usuario_id):
    if request.method == 'GET':
        # Obtener todos los productos del usuario
        productos = Producto.query.filter_by(usuario_id=usuario_id).all()
        
        lista_productos = []
        for producto in productos:
            lista_productos.append({
                'id': producto.id,
                'nombre': producto.nombre,
                'descripcion': producto.descripcion,
                'precio': producto.precio,
                'cantidad': producto.cantidad
            })
            
        return jsonify(lista_productos), 200
        
    elif request.method == 'POST':
        # Crear nuevo producto
        datos = request.get_json()
        
        if not datos or not datos.get('nombre') or not datos.get('precio') or not datos.get('cantidad'):
            return jsonify({'mensaje': 'Nombre, precio y cantidad son obligatorios', 'error': True}), 400
            
        nuevo_producto = Producto(
            nombre=datos['nombre'],
            descripcion=datos.get('descripcion', ''),
            precio=float(datos['precio']),
            cantidad=int(datos['cantidad']),
            usuario_id=usuario_id
        )
        
        db.session.add(nuevo_producto)
        db.session.commit()
        
        return jsonify({
            'mensaje': 'Producto creado con éxito',
            'exito': True,
            'producto_id': nuevo_producto.id
        }), 201

def manejar_producto_individual(usuario_id, producto_id):
    producto = Producto.query.filter_by(id=producto_id, usuario_id=usuario_id).first()
    
    if not producto:
        return jsonify({'mensaje': 'Producto no encontrado', 'error': True}), 404
    
    if request.method == 'GET':
        return jsonify({
            'id': producto.id,
            'nombre': producto.nombre,
            'descripcion': producto.descripcion,
            'precio': producto.precio,
            'cantidad': producto.cantidad
        }), 200

    elif request.method == 'PUT':
        # Editar un producto
        datos = request.get_json()

        if not datos or not datos.get('nombre') or not datos.get('precio') or not datos.get('cantidad'):
            return jsonify({'mensaje': 'Nombre, precio y cantidad son obligatorios', 'error': True}), 400
            
        producto.nombre = datos['nombre']
        producto.descripcion = datos.get('descripcion', '')
        producto.precio = float(datos['precio'])
        producto.cantidad = int(datos['cantidad'])

        db.session.commit()

        return jsonify({'mensaje': 'Producto actualizado con éxito', 'exito': True}), 200

    elif request.method == 'DELETE':
        # Eliminar un producto
        db.session.delete(producto)
        db.session.commit()

        return jsonify({'mensaje': 'Producto eliminado con éxito', 'exito': True}), 200