const express = require('express')
const carritoControlador=require('../controllers/carrito.controller')
const md_autenticacion=require('../middlewares/autenticacion')
const api=express.Router()

api.post('/agregarCarrito', md_autenticacion.Auth, carritoControlador.agregarCarrito)
api.get('/verCarrito', md_autenticacion.Auth, carritoControlador.visualizarCarrito )
api.delete('/eliminarProductoCarrito',md_autenticacion.Auth, carritoControlador.eliminarProductosCarrito)

module.exports=api