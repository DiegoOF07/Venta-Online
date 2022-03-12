const Carrito = require('../models/carrito.model')
const Producto = require('../models/productos.model')
const underscore = require('underscore')
const parse = require('nodemon/lib/cli/parse')

function agregarCarrito(req, res) {
    var parametros = req.body
    var carritoModel = new Carrito()
    Carrito.findOne({ idUsuarioCarrito: req.user.sub }, (err, carritoEncontrado) => {
        if (underscore.isEmpty(carritoEncontrado)) {
            Producto.findOne({ nombre: { $regex: parametros.nombre, $options: 'i' } }, (err, productoEncontrado) => {
                if (!underscore.isEmpty(productoEncontrado)) {
                    if (productoEncontrado.cantidad >= parametros.cantidad) {
                        carritoModel.idUsuarioCarrito = req.user.sub
                        carritoModel.save((err, carritoGuardado) => {
                            let subTotalCarrito = parseInt(parametros.cantidad) * parseInt(productoEncontrado.precio)
                            Carrito.findByIdAndUpdate(carritoGuardado._id, { $push: { productos: { nombre: productoEncontrado.nombre, cantidadComprada: parametros.cantidad, precioUnidad: productoEncontrado.precio, subTotal: subTotalCarrito } } },
                                { new: true }, (err, carritoActualizado) => {
                                    let totalPagar = 0
                                    for (let i = 0; i < underscore.size(carritoActualizado.productos); i++) {
                                        totalPagar = totalPagar + parseInt(carritoActualizado.productos[i].subTotal)
                                    }
                                    Carrito.findByIdAndUpdate(carritoGuardado._id, { total: totalPagar }, { new: true }, (err, carritoFinalizado) => {
                                        return res.status(200).send({ tu_carrito: carritoFinalizado })
                                    }).populate('idUsuarioCarrito', 'nombre nit')
                                })
                        })
                    } else {
                        return res.status(500).send({ mensaje: "Lo sentimos, la cantidad que desea llevar de " + productoEncontrado.nombre + " supera nuestras existencias" })
                    }
                } else {
                    return res.status(500).send({ mensaje: "Lo sentimos, el producto que desea agregar a su carrito no se encuentra disponible" })
                }
            })
        } else {
            Producto.findOne({ nombre: { $regex: parametros.nombre, $options: 'i' } }, (err, productoEncontrado) => {
                var productosCarrito = []
                if (!underscore.isEmpty(productoEncontrado)) {
                    for (let i = 0; i < underscore.size(carritoEncontrado.productos); i++) {
                        if (carritoEncontrado.productos[i].nombre == productoEncontrado.nombre) {
                            let cantidadTotal = parseInt(carritoEncontrado.productos[i].cantidadComprada) + parseInt(parametros.cantidad)
                            let subTotalCarro = cantidadTotal * parseInt(productoEncontrado.precio)
                            if (cantidadTotal <= productoEncontrado.cantidad) {
                                Carrito.findOneAndUpdate({ productos: { $elemMatch: { nombre: productoEncontrado.nombre } }, idUsuarioCarrito: req.user.sub },
                                    { 'productos.$.cantidadComprada': cantidadTotal, 'productos.$.subTotal': subTotalCarro }, (err, carritoCantidadAumentada) => {
                                        Carrito.findOne({ idUsuarioCarrito: req.user.sub }, (err, carritoUsuario) => {
                                            let totalPagar = 0
                                            for (let i = 0; i < underscore.size(carritoUsuario.productos); i++) {
                                                totalPagar = totalPagar + parseInt(carritoUsuario.productos[i].subTotal)
                                            }
                                            Carrito.findByIdAndUpdate(carritoEncontrado._id, { total: totalPagar }, { new: true }, (err, carritoFinalizado) => {
                                                return res.status(200).send({ tu_carrito: carritoFinalizado })
                                            }).populate('idUsuarioCarrito', 'nombre nit')
                                        })
                                    })
                            } else {
                                return res.status(500).send({ mensaje: "Lo sentimos, la cantidad que desea llevar de " + productoEncontrado.nombre + " supera nuestras existencias" })
                            }
                        }
                        productosCarrito.push(carritoEncontrado.productos[i].nombre)
                    }
                    if (!underscore.contains(productosCarrito, productoEncontrado.nombre)) {
                        if (productoEncontrado.cantidad >= parametros.cantidad) {
                            let subTotalCarrito = parseInt(parametros.cantidad) * parseInt(productoEncontrado.precio)
                            Carrito.findByIdAndUpdate(carritoEncontrado._id, { $push: { productos: { nombre: productoEncontrado.nombre, cantidadComprada: parametros.cantidad, precioUnidad: productoEncontrado.precio, subTotal: subTotalCarrito } } },
                                { new: true }, (err, carritoActualizado) => {
                                    let totalPagar = 0
                                    for (let i = 0; i < underscore.size(carritoActualizado.productos); i++) {
                                        totalPagar = totalPagar + parseInt(carritoActualizado.productos[i].subTotal)
                                    }
                                    Carrito.findByIdAndUpdate(carritoEncontrado._id, { total: totalPagar }, { new: true }, (err, carritoFinalizado) => {
                                        return res.status(200).send({ tu_carrito: carritoFinalizado })
                                    }).populate('idUsuarioCarrito', 'nombre nit')
                                })
                        }else{
                            return res.status(500).send({ mensaje: "Lo sentimos, la cantidad que desea llevar de " + productoEncontrado.nombre + " supera nuestras existencias" }) 
                        }
                    }
                } else {
                    return res.status(500).send({ mensaje: "Lo sentimos, el producto que desea agregar a su carrito no se encuentra disponible" })
                }


            })
        }
    })
}

function visualizarCarrito(req, res){
    Carrito.findOne({ idUsuarioCarrito: req.user.sub},(err, carritoEncontrado)=>{
        if(!underscore.isEmpty(carritoEncontrado)){
            return res.status(200).send({ tu_carrito: carritoEncontrado})
        }else{
            return res.status(500).send({ mensaje: "Para visualizar su carrito de compras, primero debe agregar un producto" })
        }
    }).populate('idUsuarioCarrito', 'nombre nit')
}

function eliminarProductosCarrito(req, res){
    var parametros= req.body
    Producto.findOne({nombre: parametros.nombre},(err, productoEncontrado)=>{
        if(!underscore.isEmpty(productoEncontrado)){
            Carrito.updateOne({idUsuarioCarrito: req.user.sub}, { $pull: { productos: { nombre: productoEncontrado.nombre } } },(err, productoEliminado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                if (!productoEliminado) return res.status(404).send({ mensaje: "No se pudo eliminar el producto del carrito" })
    
                visualizarCarrito(req, res)
            })
        }else{
            return res.status(500).send({ mensaje: "El producto que desea eliminar no esta disponible" })
        }
    })
    
}


module.exports = {
    agregarCarrito,
    visualizarCarrito,
    eliminarProductosCarrito
}