const mongoose=require('mongoose');
const Schema = mongoose.Schema;
const facturaSchema=Schema({
    idComprador: {type: Schema.Types.ObjectId, ref: 'Usuarios'},
    productos:[{
        nombre: String,
        cantidadComprada: Number,
        precioUnidad: Number,
        subTotal: Number,
    }],
    total: Number
})

module.exports =mongoose.model('Factura', facturaSchema)
