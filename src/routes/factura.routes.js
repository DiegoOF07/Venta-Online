const express=require('express')
const facturaController=require('../controllers/facturas.controller')
const md_autenticacion=require('../middlewares/autenticacion')

const api=express.Router();

api.get('/listarFacturas', md_autenticacion.Auth, facturaController.visualizarFacturas)
api.get('/productosFactura/:idFactura', md_autenticacion.Auth, facturaController.visualizarProductosFactura)
api.get('/productosAgotados',md_autenticacion.Auth, facturaController.productosAgotados)
api.get('/productosMasVendidos', facturaController.productosMasVendidos)
api.get('/comprar', md_autenticacion.Auth, facturaController.comprar)
api.get('/verMisCompras', md_autenticacion.Auth, facturaController.verMisCompras)

module.exports =api;