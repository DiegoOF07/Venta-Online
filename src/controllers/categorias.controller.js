const Categoria = require('../models/categorias.model')
const Producto = require('../models/productos.model')
const underscore = require('underscore')

function categoriaDefecto() {
    var categoriaModel = new Categoria()
    Categoria.findOne({ nombre: 'Categoria por Defecto' }, (err, categoriaEncontrada) => {
        if (underscore.isEmpty(categoriaEncontrada)) {
            categoriaModel.nombre = 'Categoria por Defecto'
            categoriaModel.save((err, categoriaDefecto) => {
            })
        }  
    })

}

function agregarCategorias(req, res) {
    var parametros = req.body
    var categoriaModel = new Categoria()
    if (req.user.rol == 'ADMIN') {
        if (parametros.nombre) {
            categoriaModel.nombre = parametros.nombre
            Categoria.findOne({ nombre: parametros.nombre }, (err, categoriaEncontrada) => {
                if (underscore.isEmpty(categoriaEncontrada)) {
                    categoriaModel.save((err, categoriaGuardada) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                        if (!categoriaGuardada) return res.status(500).send({ mensaje: "No se pudo agregar" })
                        return res.status(200).send({ categoria_agregada: categoriaGuardada })
                    })
                } else {
                    return res.status(500).send({ mensaje: "La categoria que desea agregar ya existe" })
                }
            })

        } else {
            return res.status(500).send({ mensaje: "Por favor llene todos los campos" })
        }
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede agregar categorias" })
    }
}

function editarCategoria(req, res) {
    var idCategoria = req.params.idCategoria
    var parametros = req.body
    if (req.user.rol == 'ADMIN') {
        Categoria.findOne({ _id: idCategoria }, (err, categoriaEncontrada) => {
            if (!underscore.isEmpty(categoriaEncontrada)) {
                Categoria.findByIdAndUpdate(idCategoria, parametros, { new: true }, (err, categoriaActualizada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!categoriaActualizada) return res.status(500).send({ mensaje: "No se pudo agregar" })
                    return res.status(200).send({ categoria_actualizada: categoriaActualizada })
                })
            } else {
                return res.status(500).send({ mensaje: "La categoria que desea editar no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede editar categorias" })
    }
}

function visualizarCategorias(req, res) {
    if (req.user.rol == 'ADMIN') {
        Categoria.find((err, categoriasEncontradas) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion de visualizacion" })
            if (!categoriasEncontradas) return res.status(500).send({ mensaje: "No se pudo visualizar" })
            return res.status(200).send({ categorias: categoriasEncontradas })
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede vizualizar todos las categorias" })
    }
}

function eliminarCategorias(req, res) {
    var idCategoria = req.params.idCat
    if (req.user.rol == 'ADMIN') {
        Categoria.findOne({ _id: idCategoria }, (err, categoriaEncontrada) => {
            if (!underscore.isEmpty(categoriaEncontrada)) {
                if (categoriaEncontrada.nombre !== 'Categoria por Defecto') {
                    Producto.find({ categoria: idCategoria }, (err, productoEncontrado) => {
                        if (productoEncontrado.length == 0) {
                            Categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminada) => {
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion de eliminacion" })
                                if (!categoriaEliminada) return res.status(500).send({ mensaje: "No se pudo eliminar" })
                                return res.status(200).send({ categoria_eliminada: categoriaEliminada })
                            })
                        } else {
                            Categoria.findOne({ nombre: 'Categoria por Defecto' }, (err, categoriaDefecto) => {
                                if (!underscore.isEmpty(categoriaDefecto)) {
                                    Producto.updateMany({ categoria: idCategoria }, { categoria: categoriaDefecto._id }, (err, productoActualizado) => {
                                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                                        if (!productoActualizado) return res.status(500).send({ mensaje: "No se pudo traspasar los productos a la categoria por defecto" })
                                        Categoria.findByIdAndDelete(idCategoria, (err, categoriaEliminada) => {
                                            if (err) return res.status(500).send({ mensaje: "Error en la peticion de eliminacion" })
                                            if (!categoriaEliminada) return res.status(500).send({ mensaje: "No se pudo eliminar" })
                                            return res.status(200).send({ mensaje: "Los productos encontrados en la categoria han sido trasladados", categoria_eliminada: categoriaEliminada })
                                        })
                                    })
                                }
                            })
                        }
                    })
                }else{
                    return res.status(500).send({ mensaje: "Esta categoria no puede ser borrada" })
                }
            } else {
                return res.status(500).send({ mensaje: "La categoria que desea eliminar no existe" })
            }
        })
    } else {
        return res.status(500).send({ mensaje: "Solo el administrador puede eliminar categorias" })
    }
}

module.exports = {
    agregarCategorias,
    editarCategoria,
    visualizarCategorias,
    categoriaDefecto,
    eliminarCategorias
}