const mongoose = require('mongoose')
const Schema=mongoose.Schema

const usuariosSchema = Schema({
    username: String,
    nombre: String,
    password: String,
    rol: String,
    nit: String
})

module.exports = mongoose.model('Usuarios', usuariosSchema);