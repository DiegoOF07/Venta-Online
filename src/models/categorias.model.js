const mongoose=require('mongoose')
const Schema=mongoose.Schema
const categoriaSchema=Schema({
    nombre: String
})

module.exports = mongoose.model('Categorias', categoriaSchema)