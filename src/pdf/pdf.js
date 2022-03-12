const pdf=require('pdfkit');
const fs = require('fs');
const underscore= require('underscore')

function crearPDF(factura, usuario){
    var document = new pdf();
    document.pipe(fs.createWriteStream(__dirname+'/'+usuario.nombre+' '+factura._id+'.pdf'));
    document.font('Helvetica-Bold', 20).text("Factura",{
        align: 'center'
    })
    document.moveDown(1)

    document.font('Helvetica', 16).text("No."+factura._id,{
        align: 'center'
    })

    document.moveDown(0.5)

    document.font('Helvetica', 16).text("Serie IN6",{
        align: 'center'
    })

    document.moveDown(0.5)

    document.font('Helvetica', 16).text("Productos: ",{
        align: 'left'
    })

    document.moveDown(0.5)

    for (var i=0; i<underscore.size(factura.productos); i++){
        document.font('Helvetica', 14).text('Nombre: '+factura.productos[i].nombre,{
            align: 'left',

        })
        document.font('Helvetica', 14).text('Cantidad: '+factura.productos[i].cantidadComprada,{
            align: 'left',

        })
        document.font('Helvetica', 14).text('Precio: '+factura.productos[i].precioUnidad,{
            align: 'left',

        })
        document.font('Helvetica', 14).text('Subtotal: '+factura.productos[i].subTotal,{
            align: 'left',

        })
        document.font('Helvetica', 14).text('----------------------------------------------------------------',{
            align: 'left',

        })
        document.moveDown(1)
    }

    document.font('Helvetica', 16).text("Total factura: "+factura.total,{
        align: 'left'
    })

    document.moveDown(0.5)

    
    document.end();
}

module.exports = {
    crearPDF
}