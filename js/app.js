/* VARIABLES Y SELECTORES */
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');




/* EVENTOS */
eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto)

    formulario.addEventListener('submit', agregarGasto);
}



/* CLASES */
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto) // Se pone con Number para convertirlo a numero porque se guarda como string
        this.restante = presupuesto;           // De inicio el presupuesto está intacto, entonces al restante le pasamos el mismo valor del presupuesto
        this.gastos = [];
    }


    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.toLocal();
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
        if(this.restante > 0 ){
            formulario.querySelector('button[type="submit"]').disabled = false;
        }
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );  // Quita el elemento que estamos eliminando del arreglo
        this.calcularRestante();
        this.toLocal();
    }

    toLocal() {
        localStorage.setItem('gasto', JSON.stringify(this.gastos))
    }
}



// Serán Métodos para imprimir HTML basados en la clase de Presupuestos
class UI {
    insertarPresupuesto(cantidad) {
        const {presupuesto, restante} = cantidad ; // Destructuring de los valores
        // Agregando al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        // Crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        // Mensaje de error
        divMensaje.textContent = mensaje ;

        // Insertar en el HTML
        document.querySelector('.primario').insertBefore( divMensaje , formulario );

        setTimeout (() => {
            divMensaje.remove();
        }, 3000)
    }

    agregarGastosListados(gastos) {
        this.limpiarHTML();

        // Iterar sobre los gastos
        gastos.forEach(gasto => {
            const {cantidad, nombre, id} = gasto;  // Destructuring

            // Crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center'; // se usa .className porque son varias clases a añadir
            nuevoGasto.setAttribute('data-id', id);

            // Crear el HTML de gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $${cantidad} </span>`;

            // Agregar botón para borrar el gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.textContent = 'Borrar x';
            btnBorrar.onclick = () => {
                eliminarGasto(id)
            }

            nuevoGasto.appendChild(btnBorrar);


            // Agregar TODO al HTML
            gastoListado.appendChild(nuevoGasto);

        })
    }

    limpiarHTML() {
        while(gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj) {
        const { presupuesto, restante} = presupuestoObj;

        const restanteDiv = document.querySelector('.restante')

        // Coprobar 25%
        if( (presupuesto / 4) > restante ) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
            } else if( (presupuesto / 2) > restante) {
                restanteDiv.classList.remove('alert-success');
                restanteDiv.classList.add('alert-warning');
            } else{
                restanteDiv.classList.remove('alert-warning', 'alert-danger');
                restanteDiv.classList.add('alert-success');
            }

        // Si el restante es <= 0
        console.log(restante);
        if(restante <= 0) {
            ui.imprimirAlerta('No mame ya no alcanza la feria', 'error');

            // Deshabilitando el botón
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

    restLocal() {
        gastos = JSON.parse(localStorage.getItem('gasto')) || [];
        console.log(gastos)
        ui.agregarGastosListados(gastos);
    }
}
// Instanciando UI de forma global para poderlo llamar en cualquier función o cualquier parte 
const ui = new UI();

// Variable para almacenar el presupuesto, se declara fuera de la función para que esté disponible globalmente
let presupuesto;



/* FUNCIONES */

// Ventana flotante que pregunta el presupuesto
function preguntarPresupuesto() { 
    ui.restLocal()
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ) {  // isNan es para validar que no se tecleen letras
        window.location.reload();   // Va a recargar la página actual en caso de tener un string vacío en presupuesto
    }

    // Ya tenemos un presupuesto válido, hay que instanciarlo
    presupuesto = new Presupuesto(presupuestoUsuario);  // La varible presupuesto está decladara más arriba

    ui.insertarPresupuesto(presupuesto);
    // console.log(presupuesto);
}

// Añade gastos

function agregarGasto(e) {  // Al ser un sunbmit le pasamos una e, de evento
    e.preventDefault();
    
    // Leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Revisa bien los campos papito, ponte verga', 'error');
    } else if ( cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('No mame revise bien la cantidad', 'error');
    } else {

         // Generar un objeto con el gasto

         const gasto = {nombre, cantidad, id: Date.now() } ;   // Lo contrario a destructuring, estamos creando un objeto
         console.log(gasto);

         // Añade un nuevo gasto al objeto
         presupuesto.nuevoGasto( gasto );

        //Mnesjae de que se añadió
         ui.imprimirAlerta('No sabes en que gastar la feria, pero bueno', 'success');

         // Imprimir los gatos
         const {gastos, restante} = presupuesto
         ui.agregarGastosListados(gastos);

         ui.actualizarRestante(restante);

         ui.comprobarPresupuesto(presupuesto);

        // Ya Agregado el gasto y mostrada la alerta reinicia el formulario, le puse setTimeout para reinciiarlo a la par que se quita el mensaje
        setTimeout( () => {
            formulario.reset();
        }, 500)
    }
}

function eliminarGasto(id) {
    // Elimina los gastos del arreglo
    presupuesto.eliminarGasto(id);

    // Elimina los gastos del HTML
    const {gastos, restante} = presupuesto;
    ui.agregarGastosListados(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
}


function cargaLocal() {
    console.log('Desde la clase Presupuesto');
}