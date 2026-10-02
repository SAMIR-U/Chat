// Referencias de jQuery
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('./sw.js');
}

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');
const db = new PouchDB('heroes');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

var usuario;

var postImgBtn = $('#post-img-btn');
var inputImagen = $('#inputImagen');


db.info()
    .then(info => {
        console.log('La base de datos está lista y disponible.');
        console.log('Información técnica de la BD:', info);
        if (info.doc_count === 0) {
            console.log('La base de datos existe pero está vacía.');
        } else {
            console.log('La base de datos tiene ${info.doc_count} documentos.');
        }
    })
    .catch(error => {
        console.error('No se pudo acceder o crear la base de datos:', error);
    });


db.on('initialized', () => {
    console.log('La base de datos se ha abierto con éxito.');
});

db.put({
    _id: 'mensaje-spiderman001',
    personaje: 'spiderman',
    mensaje: 'La tía May hizo panqueques',
    fecha: new Date().toISOString()
}).then(function (response) {
    console.log('Creado con id personalizado:', response);
});

db.post({
    personaje: 'ironman',
    mensaje: 'Soy Iron Man',
    fecha: new Date().toISOString()
}).then(function (response) {
    console.log('ID autogenerado:', response);
});


db.get('mensaje-spiderman001').then(function (doc) {
    console.log('_id:', doc._id);
    console.log('_rev:', doc._rev);
    console.log('Contenido completo:', doc);
});

db.get('mensaje-spiderman001').then(function (doc) {
    doc.mensaje = 'Contenido actualizado';
    return db.put(doc);
}).then(function () {
    console.log('Actualización exitosa');
});

db.get('mensaje-spiderman001').then(function (doc) {
    console.log('_id:', doc._id);
    console.log('Contenido completo sin rev:', doc);
});

db.get('mensaje-spiderman001').then(function (doc) {
    console.log('_id:', doc._id);
    console.log('_rev:', doc._rev);
    console.log('Contenido completo:', doc);
});
// ===== Codigo de la aplicación




function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    modal.animate({
        marginTop: '+=1000px',
        opacity: 0
    }, 200, function () {
        modal.addClass('oculto');
        txtMensaje.val('');
    });
});

// Boton de enviar mensaje
postBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    crearMensajeHTML(mensaje, usuario);

});


// a) Insertar mediante objeto JSON con db.post() -> _id autogenerado
var mensajeAutogenerado = {
    personaje: "spiderman",
    texto: "Mensaje de prueba",
    fecha: new Date().toISOString(),
    tipo: "mensaje"
};


db.post(mensajeAutogenerado)
    .then(function (response) {
        console.log("=== db.post() ===");
        console.log("Identificador generado por PouchDB:", response.id);
        console.log("Revisión generada:", response.rev);
        console.log("Respuesta completa:", response);
    })
    .catch(function (err) {
        console.error("Error en db.post():", err);
    });

// b) Insertar mediante documento completo con db.put() -> _id personalizado
var mensajePersonalizado = {
    _id: "mensaje-spiderman001",
    personaje: "spiderman",
    texto: "Mensaje de prueba",
    fecha: new Date().toISOString(),
    tipo: "mensaje"
};

db.put(mensajePersonalizado)
    .then(function (response) {
        console.log("=== db.put() ===");
        console.log("Identificador personalizado almacenado:", response.id);
        console.log("Revisión generada:", response.rev);
        console.log("Respuesta completa:", response);
    })
    .catch(function (err) {
        if (err.status === 409) {
            console.log("El documento mensaje-spiderman001 ya existe. Se omite la creación.");
        } else {
            console.error("Error en db.put():", err);
        }
    });

// Verificación de que el _id personalizado quedó almacenado correctamente
db.get("mensaje-spiderman001")
    .then(function (doc) {
        console.log("=== Verificación db.get() ===");
        console.log("_id guardado:", doc._id);
        console.log("_rev guardado:", doc._rev);
        console.log("Documento completo:", doc);
    })
    .catch(function (err) {
        console.error("No se encontró el documento:", err);
    });

postImgBtn.on('click', function () {
    inputImagen.click();
});

function obtenerImagenSeleccionada() {
    var files = inputImagen[0].files;
    if (files.length === 0) {
        return null;
    }
    return files[0];
}

inputImagen.on('change', function () {
    var archivo = obtenerImagenSeleccionada();
    if (!archivo) {
        return;
    }

    var url = URL.createObjectURL(archivo);
    var preview = document.getElementById('img-preview');
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'img-preview';
        preview.style.cssText = 'max-width:100%;margin-top:8px;border-radius:8px;';
        $('.nuevo-mensaje').append(preview);
    }
    preview.src = url;
});


async function cargarMensajes() {
    try {
        var resultado = await db.allDocs({
            include_docs: true,
            descending: false
        });

        var mensajes = resultado.rows
            .map(function (row) { return row.doc; })
            .filter(function (doc) {
                return doc && doc.tipo === 'mensaje';
            });

        mensajes.sort(function (a, b) {
            return new Date(a.fecha) - new Date(b.fecha);
        });

        timeline.empty();

        for (var i = 0; i < mensajes.length; i++) {
            var doc = mensajes[i];
            renderizarMensaje(doc);
        }

        console.log('[allDocs] Documentos totales:', resultado.total_rows);
        console.log('[allDocs] Mensajes renderizados:', mensajes.length);
    } catch (error) {
        console.error('[allDocs] Error al recuperar documentos:', error);
    }
}

function renderizarMensaje(doc) {
    var content = `
    <li class="animated fadeIn fast" data-id="${doc._id}">
        <div class="avatar">
            <img src="img/avatars/${doc.personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${doc.personaje}</h3>
                <br/>
                ${doc.texto}
            </div>
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.append(content);

    if (doc._attachments && doc._attachments['imagen.jpg']) {
        mostrarImagenDeMensaje(doc._id, 'imagen.jpg').then(function (img) {
            if (img) {
                timeline.children('li[data-id="' + doc._id + '"]')
                    .find('.bubble')
                    .append(img);
            }
        });
    }
}

async function editarMensaje(docId, nuevoTexto) {
    try {
        var doc = await db.get(docId);
        doc.texto = nuevoTexto;
        doc.fecha = new Date().toISOString();
        await db.put(doc);
        await cargarMensajes();
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'editar mensaje'));
    }
}

async function eliminarMensaje(docId) {
    try {
        var doc = await db.get(docId);
        await db.remove(doc);
        await cargarMensajes();
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'eliminar mensaje'));
    }
}

postBtn.on('click', async function () {
    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }
    var archivoBlob = obtenerImagenSeleccionada();
    try {
        var doc = {
            personaje: usuario,
            texto: mensaje,
            fecha: new Date().toISOString(),
            tipo: 'mensaje'
        };

        var response = await db.post(doc);

        if (archivoBlob) {
            await db.putAttachment(
                response.id,
                'imagen.jpg',
                response.rev,
                archivoBlob,
                archivoBlob.type
            );
        }
        inputImagen.val('');
        var preview = document.getElementById('img-preview');
        if (preview) { preview.remove(); }

        cancelarBtn.click();
        await cargarMensajes();
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'guardar mensaje'));
    }
});

function manejarErrorPouchDB(error, contexto) {
    console.error('[PouchDB] Error en ' + contexto + ':', {
        status: error.status,
        name: error.name,
        message: error.message,
        stack: error.stack
    });

    if (error.message === 'database is closed') {
        return 'La base de datos está cerrada. Recarga la aplicación.';
    }
    if (error.message === 'database is destroyed') {
        return 'La base de datos fue eliminada. Recarga la aplicación.';
    }

    var mensajes = {
        400: 'Error de formato en la operación.',
        404: 'El documento o recurso no existe.',
        409: 'Conflicto: el documento ya existe o fue modificado.',
        412: 'El adjunto no existe o no está disponible.'
    };

    return mensajes[error.status] || 'Error inesperado. Intenta de nuevo.';
}

async function probarIdDuplicado() {
    try {
        await db.put({
            _id: 'mensaje-spiderman001',
            personaje: 'spiderman',
            texto: 'Intento duplicado',
            fecha: new Date().toISOString(),
            tipo: 'mensaje'
        });
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'crear documento con id duplicado'));
    }
}

async function probarRevIncorrecto() {
    try {
        await db.put({
            _id: 'mensaje-spiderman001',
            _rev: 'rev-invalido',
            personaje: 'spiderman',
            texto: 'Actualización con rev incorrecto',
            tipo: 'mensaje'
        });
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'actualizar con rev incorrecto'));
    }
}

async function probarRevAusente() {
    try {
        await db.put({
            _id: 'mensaje-spiderman001',
            personaje: 'spiderman',
            texto: 'Actualización sin rev',
            tipo: 'mensaje'
        });
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'actualizar sin rev'));
    }
}

async function probarEliminarInexistente() {
    try {
        var doc = await db.get('mensaje-no-existe-999');
        await db.remove(doc);
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'eliminar documento inexistente'));
    }
}

async function probarAdjuntoInexistente() {
    try {
        var blob = await db.getAttachment('mensaje-spiderman001', 'imagen-inexistente.jpg');
        URL.createObjectURL(blob);
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'leer adjunto inexistente'));
    }
}

async function probarBaseCerrada() {
    db.close();
    try {
        await db.get('mensaje-spiderman001');
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'operar con base cerrada'));
    }
}

async function probarBaseDestruida() {
    await db.destroy();
    try {
        await db.post({
            personaje: 'hulk',
            texto: 'Después de destruir',
            tipo: 'mensaje'
        });
    } catch (error) {
        alert(manejarErrorPouchDB(error, 'operar con base destruida'));
    }
}

cargarMensajes();