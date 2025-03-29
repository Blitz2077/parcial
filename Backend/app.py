from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
from modelos import db
from controladores import registrar_usuario, iniciar_sesion, manejar_productos, manejar_producto_individual

app = Flask(__name__)
CORS(app)

# Configuración de la aplicación
app.config['SECRET_KEY'] = 'clave_secreta_parcial'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root@localhost/parcial2db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializar la base de datos
db.init_app(app)

# Decorador para verificar el token
def token_requerido(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'mensaje': 'Token no proporcionado', 'error': True}), 401
            
        try:
            datos = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            usuario_actual = datos['usuario_id']
        except:
            return jsonify({'mensaje': 'Token inválido', 'error': True}), 401
            
        return f(usuario_actual, *args, **kwargs)
        
    return decorador

# Rutas de autenticación
app.route('/api/registro', methods=['POST'])(registrar_usuario)
app.route('/api/login', methods=['POST'])(iniciar_sesion)

# Rutas de productos (protegidas)
app.route('/api/productos', methods=['GET', 'POST'])(token_requerido(manejar_productos))
app.route('/api/productos/<int:producto_id>', methods=['GET', 'PUT', 'DELETE'])(token_requerido(manejar_producto_individual))

if __name__ == '__main__':
    app.run(debug=True)