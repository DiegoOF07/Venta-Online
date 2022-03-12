const mongoose = require('mongoose')
const usuarioController= require('./src/controllers/usuarios.controller')
const categoriaController=require('./src/controllers/categorias.controller')
const app = require('./app')

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/ventaOnline', {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('Conexion a la base de datos exitosa')

    app.listen(3000, function () {
        usuarioController.crearAdmin()
        categoriaController.categoriaDefecto()
        console.log('Corriendo en el puerto 3000') 
    })
}).catch(err => console.log(err))
