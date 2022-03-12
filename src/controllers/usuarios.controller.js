const Usuario = require('../models/usuarios.model')
const bcrypt = require('bcrypt-nodejs')
const jwt = require('../services/jwt')
const underscore = require('underscore')

function crearAdmin() {
    var usuarioModel = new Usuario();
    Usuario.findOne({ username: 'ADMIN' }, (err, usuarioEncontrado) => {

        if (underscore.isEmpty(usuarioEncontrado)) {
            usuarioModel.username = 'ADMIN'
            usuarioModel.nombre = 'Administrador'
            usuarioModel.rol = 'ADMIN'
            usuarioModel.nit = 'Consumidor Final'

            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                usuarioModel.password = passwordEncriptada
                usuarioModel.save(() => {
                    console.log('Administrador creado con exito')
                })
            })
        } else {
            console.log('Administrador por defecto ya existente')
        }
    })
}

function login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ username: parametros.username }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!underscore.isEmpty(usuarioEncontrado)) {
            bcrypt.compare(parametros.password, usuarioEncontrado.password,
                (err, verificacionPassword) => {
                    if (verificacionPassword) {
                        if (parametros.obtenerToken === 'true') {
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return res.status(200)
                                .send({ usuario: "Parametro faltante" })
                        }

                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las clave no coincide' });
                    }
                })
        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el usuario no se encuentra registrado.' })
        }
    })
}

function registrarUsuarios(req, res) {
    var usuarioModel = new Usuario()
    var parametros = req.body
    if (parametros.username && parametros.nombre && parametros.password && parametros.nit) {
        Usuario.findOne({ username: parametros.username }, (err, usuarioEncontrado) => {
            if (underscore.isEmpty(usuarioEncontrado)) {
                usuarioModel.username = parametros.username
                usuarioModel.nombre = parametros.nombre
                usuarioModel.rol = 'CLIENTE'
                usuarioModel.nit = parametros.nit
                bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                    usuarioModel.password = passwordEncriptada
                    usuarioModel.save((err, usuarioGuardado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (usuarioGuardado.length == 0) return res.status(500).send({ mensaje: 'Error, no se pudo guardar el usuario' })

                        return res.status(200).send({ usuario: usuarioGuardado })
                    })
                })
            } else {
                return res.status(500).send({ mensaje: 'El username ya esta en uso, ingrese otro' })
            }
        })
    }else{
        return res.status(500).send({ mensaje: 'Por favor llene todos los campos'})
    }
}

function editarUsuarios(req, res) {
    var idUser = req.params.idUser;
    var parametros = req.body;
    if (req.user.rol == 'ADMIN') {
        Usuario.findOne({ _id: idUser }, (err, usuarioEncontrado) => {
            if (!underscore.isEmpty(usuarioEncontrado)) {
                if (usuarioEncontrado.rol == 'CLIENTE') {
                    Usuario.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioActualizado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (usuarioActualizado.length == 0) return res.status(500).send({ mensaje: 'Error, no se pudo actualizar el usuario' })

                        return res.status(200).send({ mensaje: usuarioActualizado })
                    })
                } else {
                    return res.status(500).send({ mensaje: 'El administrador no puede editar a otros administradores' })
                }
            } else {
                return res.status(500).send({ mensaje: "El usuario que desea editar no existe" })
            }

        })

    } else {
        return res.status(500).send({ mensaje: 'Solo el administrador puede editar a los clientes' })
    }
}

function eliminarUsuarios(req, res) {
    var idUser = req.params.idUsuario;
    if (req.user.rol == 'ADMIN') {
        Usuario.findOne({ _id: idUser }, (err, usuarioEncontrado) => {
            if (!underscore.isEmpty(usuarioEncontrado)) {
                if (usuarioEncontrado.rol == 'CLIENTE') {
                    Usuario.findByIdAndDelete(idUser, (err, usuarioEliminado) => {
                        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
                        if (usuarioEliminado.length == 0) return res.status(500).send({ mensaje: 'Error, no se pudo eliminar el usuario' })

                        return res.status(200).send({ mensaje: usuarioEliminado })
                    })
                } else {
                    return res.status(500).send({ mensaje: 'El administrador no puede eliminar a otros administradores' })
                }
            } else {
                return res.status(500).send({ mensaje: "El usuario que desea eliminar no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: 'Solo el administrador puede eliminar a los clientes' })
    }
}

function eliminarMiCuenta(req, res){
    if(req.user.rol=='CLIENTE'){
        Usuario.findOne({_id: req.user.sub}, (err, usuarioEncontrado)=>{
        if(!underscore.isEmpty(usuarioEncontrado)){
            Usuario.findByIdAndDelete(usuarioEncontrado._id,(err, usuarioEliminado)=>{
                return res.status(200).send({ cuenta_eliminada: usuarioEliminado})
            })
        }else{
            return res.status(500).send({ mensaje: 'Ah ocurrido un error al buscar tu cuenta'})
        }
        })
    }else{
        return res.status(500).send({ mensaje: 'Un Administrador no puede borrar su cuenta'})
    }
}

function editarMiCuenta(req, res){
    var parametros = req.body
    Usuario.findOne({_id: req.user.sub},(err, usuaurioEncontrado)=>{
        if(!underscore.isEmpty(usuarioEncontrado)){
            Usuario.findByIdAndUpdate(req.user.sub, parametros,{new: true},(err, usuarioActualizado)=>{
                return res.status(200).send({actualizacion: usuarioActualizado})
            })
        }else{
            return res.status(500).send({ mensaje: 'Ah ocurrido un error al buscar tu cuenta'})
        }
    })
}

module.exports = {
    crearAdmin,
    login,
    registrarUsuarios,
    editarUsuarios,
    eliminarUsuarios,
    eliminarMiCuenta,
    editarMiCuenta
}