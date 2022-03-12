const express=require('express')
const usuarioControlador=require('../controllers/usuarios.controller')
const md_autenticacion=require('../middlewares/autenticacion')

const api=express.Router();

api.post('/login', usuarioControlador.login)
api.post('/registrarUsuarios', usuarioControlador.registrarUsuarios)
api.put('/editarUsuarios/:idUser',md_autenticacion.Auth, usuarioControlador.editarUsuarios)
api.delete('/eliminarUsuarios/:idUsuario', md_autenticacion.Auth, usuarioControlador.eliminarUsuarios)
api.delete('/eliminarCuenta', md_autenticacion.Auth, usuarioControlador.eliminarMiCuenta)
api.put('/editarCuenta', md_autenticacion.Auth, usuarioControlador.editarMiCuenta)

module.exports =api;