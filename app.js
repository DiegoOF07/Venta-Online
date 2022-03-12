const express=require('express')
const cors=require('cors')
var app = express()

const usuariosRutas=require('./src/routes/usuarios.routes')
const productosRutas=require('./src/routes/productos.routes')
const categoriasRutas=require('./src/routes/categorias.routes')
const facturaRutas=require('./src/routes/factura.routes')
const carritoRutas=require('./src/routes/carrito.routes')

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors());

app.use('/api', usuariosRutas, productosRutas, categoriasRutas, facturaRutas, carritoRutas);


module.exports = app;