# funciones para crear y verificar tokens
# tokens para admin y usuarios

from flask import jsonify, request
import bcrypt
from models import Usuario, LogoutToken, db
import datetime
import os
import jwt
from functools import wraps

def login_check(data):
    if not data or not data['correo'] or not data['contraseña']:
        return jsonify({'message':'Faltan datos'}), 400
    usuario = Usuario.query.filter_by(correo=data['correo']).first()
    if not usuario:
        return jsonify({'message':'Usuario no encontrado'}), 404
    if bcrypt.checkpw(data['contraseña'].encode('utf-8'), usuario.contraseña.encode('utf-8')):
        token = jwt.encode({'id':usuario.id,'exp':datetime.datetime.utcnow()+datetime.timedelta(minutes=30)},os.environ['SECRET_KEY'])
        db.session.add(LogoutToken(token, datetime.datetime.utcnow()))
        db.session.commit()
        return jsonify({'message':'Sesión iniciada','id': usuario.id, 'token':token})
    else:
        return jsonify({'message':'Contraseña incorrecta'}), 401
    
def blacklist_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        blocked_token = None
        if 'x-auth-token' in request.headers:
            blocked_token = request.headers['x-auth-token']
        if not blocked_token:
            return jsonify({'message':'Token no encontrado'}), 404
        try:
            blocked = LogoutToken.query.filter_by(token=blocked_token).first()
            db.session.delete(blocked)
            db.session.commit()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message':'Token inválido'}), 401
    return decorated

