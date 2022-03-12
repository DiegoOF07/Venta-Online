const Producto = require('../models/productos.model')
const Categoria = require('../models/categorias.model')
const underscore = require('underscore')

function agregarProducto(req, res) {
    var parametros = req.body
    var productoModel = new Producto()
    if (req.user.rol == 'ADMIN') {
        if (parametros.nombre && parametros.precio && parametros.cantidad && parametros.categoria) {
            productoModel.nombre = parametros.nombre
            productoModel.descripcion = parametros.descripcion
            productoModel.precio = parametros.precio
            productoModel.cantidad = parametros.cantidad
            productoModel.vendidos=0
            //Buscamos si la categoria existe
            Categoria.findOne({ nombre: {$regex:parametros.categoria, $options:'i' }}, (err, categoriaEncontrada) => {
                //Si existe procedemos a asignarla al producto
                if (!underscore.isEmpty(categoriaEncontrada)) {
                    productoModel.categoria = categoriaEncontrada._id
                    //Buscamos si el producto que deseamos agregar ya existe
                    Producto.findOne({ nombre: parametros.nombre }, (err, productoEncontrado) => {
                        //Si el producto no existe lo agregamos de manera normal
                        if (underscore.isEmpty(productoEncontrado)) {
                            productoModel.save((err, productoGuardado) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de guardado" })
                                if (!productoGuardado) return res.status(500).send({ mensaje: "No se pudo agregar" })
                                return res.status(200).send({ producto: productoGuardado })
                            })
                            //Si el producto ya existe solamente se actualizara la cantidad en stock de este y se le sumara a lo que ya tenia
                        } else {
                            var stock = parseInt(productoEncontrado.cantidad) + parseInt(parametros.cantidad)
                            Producto.findByIdAndUpdate(productoEncontrado._id, { cantidad: stock }, { new: true }, (err, productoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de edicion" })
                                if (!productoActualizado) return res.status(500).send({ mensaje: "No se pudo actualizar" })
                                return res.status(200).send({ mensaje: "El producto ya existe asi que se agregara la cantidad al stock existente", producto: productoActualizado })
                            })
                        }
                    })
                    //Si no existe enviara un mensaje con el error
                } else {
                    return res.status(500).send({ mensaje: "La categoria que usted intenta asignar no existe, debe crearla" })
                }
            })
        } else {
            return res.status(500).send({ mensaje: "Debe llenar todos los campos" })
        }
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede agregar productos" })
    }
}

function editarProductos(req, res) {
    var idProducto = req.params.idProducto
    var parametros = req.body
    if (req.user.rol == 'ADMIN') {
        Producto.findOne({ _id: idProducto }, (err, productoEncontrado) => {
            if (!underscore.isEmpty(productoEncontrado)) {
                if (underscore.isEmpty(parametros.categoria)) {
                    Producto.findByIdAndUpdate(idProducto, parametros, { new: true }, (err, productoActualizado) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion de edicion" })
                        if (!productoActualizado) return res.status(500).send({ mensaje: "No se pudo actualizar" })
                        return res.status(200).send({ producto: productoActualizado })
                    })
                } else {
                    Categoria.findOne({ nombre: parametros.categoria }, (err, categoriaEncontrada) => {
                        if (!underscore.isEmpty(categoriaEncontrada)) {
                            parametros.categoria = categoriaEncontrada._id
                            Producto.findByIdAndUpdate(idProducto, parametros, { new: true }, (err, productoActualizado) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de edicion" })
                                if (!productoActualizado) return res.status(500).send({ mensaje: "No se pudo actualizar" })
                                return res.status(200).send({ producto: productoActualizado })
                            })
                        } else {
                            return res.status(500).send({ mensaje: "La categoria que desea asignar no existe, debe crearla" })
                        }
                    })
                }
            } else {
                return res.status(500).send({ mensaje: "El producto que desea editar ya no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede editar productos" })
    }
}

function visualizarProducto(req, res) {
    if (req.user.rol == 'ADMIN') {
        Producto.find((err, productosEncontrados) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!productosEncontrados) return res.status(500).send({ mensaje: "No se pudo visualizar" })
            return res.status(200).send({ producto: productosEncontrados })
        }).populate('categoria', 'nombre')
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede vizualizar todos los productos" })
    }
}

function eliminarProducto(req, res) {
    var idProducto=req.params.idProd
    if (req.user.rol == 'ADMIN') {
        Producto.findOne({ _id: idProducto }, (err, productoEncontrado) => {
            if (!underscore.isEmpty(productoEncontrado)) {
                Producto.findByIdAndDelete(idProducto, (err, productoEliminado) =>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion de visualizacion" })
                    if (!productoEliminado) return res.status(500).send({ mensaje: "No se pudo eliminar" })
                    return res.status(200).send({ producto: productoEliminado }) 
                })
            }else{
                return res.status(500).send({ mensaje: "El producto que desea eliminar no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede eliminar productos"})
    }
}

function buscarProductosNombre(req, res) {
    var producto = req.params.nombreProducto
    Producto.find({nombre:{$regex: producto, $options: 'i'}},(err, productoEncontrado)=>{
        if(!underscore.isEmpty(productoEncontrado)){
            return res.status(200).send({ producto: productoEncontrado})
        }else{
            return res.status(500).send({ mensaje: "Lo sentimos, el producto que busca no se encuentra disponible"})
        }
    }).populate('categoria', 'nombre')
}

function buscarPorCategoria(req, res){
    var categoria=req.params.nombreCategoria
    Categoria.findOne({nombre:{$regex: categoria, $options: 'i'}},(err, categoriaEncontrada)=>{
        if(!underscore.isEmpty(categoriaEncontrada)){
            Producto.find({categoria: categoriaEncontrada._id},(err, productoEncontrado)=>{
                if(!underscore.isEmpty(productoEncontrado)){
                    return res.status(200).send({categoria: categoriaEncontrada, productos: productoEncontrado})
                }else{
                    return res.status(500).send({ categoria: categoriaEncontrada, mensaje: "Esta categoria no posee productos aun"}) 
                }
            })
        }else{
            return res.status(500).send({ mensaje: "Lo sentimos, la categoria que busca no esta disponible"})
        }
    })
}

module.exports = {
    agregarProducto,
    editarProductos,
    visualizarProducto,
    eliminarProducto,
    buscarProductosNombre,
    buscarPorCategoria
}