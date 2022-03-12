const mongoose = require('mongoose')
const Schema= mongoose.Schema
const productoSchema=Schema({
    nombre: String,
    descripcion: String,
    precio: Number,
    cantidad: Number,
    categoria: {type: Schema.Types.ObjectId, ref: 'Categorias'},
    vendidos: Number
})

module.exports =mongoose.model('Productos', productoSchema)