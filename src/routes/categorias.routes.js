const express = require('express')
const categoriaControlador=require('../controllers/categorias.controller')
const md_autenticacion=require('../middlewares/autenticacion')
const api=express.Router()

api.post('/agregarCategoria', md_autenticacion.Auth, categoriaControlador.agregarCategorias)
api.put('/editarCategoria/:idCategoria', md_autenticacion.Auth, categoriaControlador.editarCategoria)
api.get('/listarCategorias', md_autenticacion.Auth, categoriaControlador.visualizarCategorias)
api.delete('/eliminarCategorias/:idCat', md_autenticacion.Auth, categoriaControlador.eliminarCategorias)

module.exports=api