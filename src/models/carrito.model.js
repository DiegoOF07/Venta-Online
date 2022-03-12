const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const carritoSchema=Schema({
    idUsuarioCarrito: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    productos:[{
        nombre: String,
        cantidadComprada: Number,
        precioUnidad: Number,
        subTotal: Number,
    }],
    total: Number
})

module.exports =mongoose.model('Carrito', carritoSchema)