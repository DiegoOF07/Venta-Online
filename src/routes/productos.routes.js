const express = require('express')
const productoControlador=require('../controllers/productos.controller')
const md_autenticacion=require('../middlewares/autenticacion')
const api=express.Router()

api.post('/agregarProductos', md_autenticacion.Auth, productoControlador.agregarProducto)
api.put('/editarProductos/:idProducto', md_autenticacion.Auth, productoControlador.editarProductos)
api.get('/listarProductos', md_autenticacion.Auth, productoControlador.visualizarProducto)
api.delete('/eliminarProductos/:idProd', md_autenticacion.Auth, productoControlador.eliminarProducto)
api.get('/buscarPorNombre/:nombreProducto', productoControlador.buscarProductosNombre)
api.get('/buscarPorCategoria/:nombreCategoria', productoControlador.buscarPorCategoria)

module.exports=api