const Factura = require('../models/factura.model')
const Producto = require('../models/productos.model')
const Carrito = require('../models/carrito.model')
const underscore = require('underscore');
const pdf=require('../pdf/pdf')
const Usuario=require('../models/usuarios.model')

function visualizarFacturas(req, res) {
    if (req.user.rol == 'ADMIN') {
        Factura.find((err, facturaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion de busqueda" })
            if (!facturaEncontrada) return res.status(500).send({ mensaje: "No se pudo visualizar" })
            if (facturaEncontrada.length !== 0) {
                return res.status(200).send({ Facturas: facturaEncontrada })
            } else {
                return res.status(500).send({ mensaje: "Aun no hay facturas emitidas" })
            }
        }).populate('idComprador', 'nombre nit')
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede vizualizar todas las facturas" })
    }
}

function visualizarProductosFactura(req, res) {
    var idFactura = req.params.idFactura
    if (req.user.rol == 'ADMIN') {
        Factura.findOne({ _id: idFactura }, (err, facturaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion de busqueda" })
            if (!facturaEncontrada) return res.status(500).send({ mensaje: "No se pudo visualizar" })
            if (!underscore.isEmpty(facturaEncontrada)) {
                return res.status(200).send({ Productos: [facturaEncontrada.productos] })
            } else {
                return res.status(500).send({ mensaje: "La factura que busca no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede vizualizar todas las facturas" })
    }
}

function productosAgotados(req, res) {
    if (req.user.rol == 'ADMIN') {
        Producto.find({ cantidad: 0 }, (err, productoEncontrado) => {
            if (productoEncontrado.length !== 0) {
                return res.status(200).send({ mensaje: "Estos son los productos agotados", productos_agotados: productoEncontrado })
            } else {
                return res.status(500).send({ mensaje: "No hay ningun producto agotado por el momento" })
            }
        }).populate('categoria', 'nombre')
    }
}

function productosMasVendidos(req, res) {
    Producto.find().sort({ vendido: -1 }).populate('categoria', 'nombre').exec((err, productoEncontrado) => {
        if (!underscore.isEmpty(productoEncontrado)) {
            return res.status(200).send({ productos_mas_vendidos: productoEncontrado })
        } else {
            return res.status(500).send({ mensaje: "No hay productos que mostrar" })
        }
    })
    //return res.status(200).send({productos_mas_vendidos: productosOrdenados})
}

function comprar(req, res) {
    var facturaModel = new Factura()
    Carrito.findOne({ idUsuarioCarrito: req.user.sub }, (err, carritoEncontrado) => {
        if (!underscore.isEmpty(carritoEncontrado)) {
            facturaModel.idComprador = carritoEncontrado.idUsuarioCarrito
            facturaModel.productos = carritoEncontrado.productos
            facturaModel.total = carritoEncontrado.total
            facturaModel.save((err, facturaGuardada) => {
                let cantidadRestante = 0
                let cantidadVendida=0

                for (let i = 0; i < underscore.size(carritoEncontrado.productos); i++) {
                    Producto.findOne({ nombre: carritoEncontrado.productos[i].nombre }, (err, productoEncontrado) => {
                        if (!underscore.isEmpty(productoEncontrado)) {
                            cantidadRestante = parseInt(productoEncontrado.cantidad) - parseInt(carritoEncontrado.productos[i].cantidadComprada)
                            cantidadVendida=parseInt(carritoEncontrado.productos[i].cantidadComprada)+parseInt(productoEncontrado.vendidos)
                            Producto.findOneAndUpdate({ nombre: carritoEncontrado.productos[i].nombre },
                                { cantidad: cantidadRestante, vendidos:cantidadVendida  }, (err, productoActualizado) => {

                                })
                        }
                    })
                }
                Carrito.updateOne({ _id: carritoEncontrado._id }, { $pullAll: { productos:carritoEncontrado.productos }, total: 0 }, (err, carritoEnCero) => {
                })
                visualizarMiFactura(facturaGuardada._id, req, res)
                Usuario.findOne({ _id: req.user.sub},(err, usuarioEncontrado)=>{ 
                    pdf.crearPDF(facturaGuardada, usuarioEncontrado)
                })
                
            })
        } else {
            return res.status(500).send({ mensaje: "No se puede crear una factura porque este cliente no posee un carrito de compras aun" })
        }
    })
}

function visualizarMiFactura(id, req, res){
    Factura.findOne({ _id: id, idComprador: req.user.sub }, (err, factura)=>{
       if(!underscore.isEmpty(factura)) return res.status(200).send({Tu_Factura: factura})
    }).populate('idComprador', 'nombre nit')
}

function verMisCompras(req, res){
    Factura.find({ idComprador: req.user.sub},(err, factura)=>{
        return res.status(200).send({factura: factura})
    })
}


module.exports = {
    visualizarFacturas,
    visualizarProductosFactura,
    productosAgotados,
    productosMasVendidos,
    comprar,
    verMisCompras
}