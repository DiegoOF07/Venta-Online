const jwt_simple = require('jwt-simple');
const moment = require('moment');
const secret = 'clave_secreta';

exports.crearToken = function (usuario) {
    let payload = {
        sub: usuario._id,
        username: usuario.username,
        nombre: usuario.nombre,
        rol: usuario.rol,
        iat: moment().unix(),
        exp: moment().day(7, 'days').unix()
    }

    return jwt_simple.encode(payload, secret);
}