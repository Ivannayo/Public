// script.js (SOLO con corrección de /api en fetch)

document.addEventListener('DOMContentLoaded', function() {

    // --- Selectores de Elementos ---
    const registroLink = document.getElementById('registro-link');
    const reservaLink = document.getElementById('reserva-link'); // Link para ABRIR el form de buscar reserva
    const contactoLink = document.getElementById('contacto-link');
    const contenedorFormularios = document.getElementById('contenedor-formularios');
    const registroSeccion = document.getElementById('registro');
    const reservaSeccion = document.getElementById('reserva'); // SECCIÓN del form para buscar reserva
    const contactoSeccion = document.getElementById('contacto');
    const realizarReservaSeccion = document.getElementById('realizar-reserva'); // SECCIÓN del form para crear reserva
    const botonesReservaHabitacion = document.querySelectorAll('.habitacion button');

    // Formularios específicos
    const formularioReserva = document.getElementById('formulario-reserva'); // Form para CREAR reserva
    const formularioContacto = document.querySelector('#contacto .contacto-form');
    const formularioRegistro = document.querySelector('#registro form');
    const formularioBuscarReserva = document.querySelector('#reserva form'); // Form para BUSCAR reserva

    // --- Configuración ---
    const API_BASE_URL = 'https://hotel-api-fpu3.onrender.com'; // URL Base API Desplegada

    // --- Estado ---
    let currentRoomType = null; // Guarda el tipo de habitación elegida para reservar

    // --- Funciones Auxiliares (Mostrar/Ocular Modales) ---
    function mostrarModal(seccionVisible) {
        [registroSeccion, reservaSeccion, contactoSeccion, realizarReservaSeccion].forEach(sec => {
            if (sec) sec.style.display = 'none';
        });
        if (seccionVisible) seccionVisible.style.display = 'block';
        contenedorFormularios.style.display = 'flex';
        // No se llama a cerrarCustomAlert aquí porque no se están usando
    }

    // --- Event Listeners para Links del Header ---
    registroLink.addEventListener('click', function(event) {
        event.preventDefault();
        mostrarModal(registroSeccion);
    });
    reservaLink.addEventListener('click', function(event) {
        event.preventDefault();
        mostrarModal(reservaSeccion);
    });
    contactoLink.addEventListener('click', function(event) {
        event.preventDefault();
        mostrarModal(contactoSeccion);
    });

    // --- Event Listener para cerrar el modal haciendo clic fuera ---
    contenedorFormularios.addEventListener('click', function(event) {
        if (event.target === contenedorFormularios) {
            contenedorFormularios.style.display = 'none';
            currentRoomType = null;
            // No se llama a cerrarCustomAlert aquí
        }
    });

    // --- Event Listener para botones "Reservar" de cada habitación ---
    botonesReservaHabitacion.forEach(boton => {
        boton.addEventListener('click', function() {
            currentRoomType = this.getAttribute('data-habitacion');
            console.log('Selected room type:', currentRoomType);
            mostrarModal(realizarReservaSeccion);
        });
    });

    // --- Manejar envío del formulario de CONTACTO ---
    formularioContacto.addEventListener('submit', async function(event) {
        event.preventDefault();
        const nombreInput = contactoSeccion.querySelector('#nombre');
        const emailInput = contactoSeccion.querySelector('#email-contacto');
        const mensajeInput = contactoSeccion.querySelector('#mensaje');

        const nombre = nombreInput ? nombreInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const mensaje = mensajeInput ? mensajeInput.value : '';

        if (!nombre || !email || !mensaje) {
            alert('Por favor, completa todos los campos del formulario de contacto.');
            return;
        }

        try {
            // *** CORRECCIÓN AQUÍ ***
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, mensaje })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                alert('Mensaje enviado con éxito.');
                formularioContacto.reset();
                contenedorFormularios.style.display = 'none';
            } else {
                const errorMsg = result.errors ? result.errors.map(e => e.msg).join('\n') : result.message;
                alert(`Error al enviar: ${errorMsg || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error en fetch contacto:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });

    // --- Manejar envío del formulario de REGISTRO ---
    formularioRegistro.addEventListener('submit', async function(event) {
        event.preventDefault();
        const emailInput = registroSeccion.querySelector('#email');
        const nombreInput = registroSeccion.querySelector('#nombre');
        const promosInput = registroSeccion.querySelector('#promos');

        const email = emailInput ? emailInput.value : '';
        const nombre = nombreInput ? nombreInput.value : '';
        const promos = promosInput ? promosInput.checked : false;

        if (!email) {
            alert('El correo electrónico es obligatorio para registrarse.');
            return;
        }

        try {
             
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, nombre, promos })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                alert('¡Registro exitoso!');
                formularioRegistro.reset();
                contenedorFormularios.style.display = 'none';
            } else {
                 const errorMsg = result.errors ? result.errors.map(e => e.msg).join('\n') : result.message;
                 alert(`Error en el registro: ${errorMsg || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error en fetch registro:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });

    
    formularioBuscarReserva.addEventListener('submit', async function(event) {
        event.preventDefault();
        const numeroInput = reservaSeccion.querySelector('#numero');
        const emailReservaInput = reservaSeccion.querySelector('#email-reserva');
        const numero = numeroInput ? numeroInput.value.trim() : '';
        const emailReserva = emailReservaInput ? emailReservaInput.value.trim() : '';

        if (!numero && !emailReserva) {
             alert('Por favor, ingresa el número de reserva o tu correo electrónico.');
             return;
        }

        const searchData = {};
        if (numero) searchData.numero = numero;
        if (emailReserva) searchData.emailReserva = emailReserva;

        try {
             
            const response = await fetch(`${API_BASE_URL}/api/reservations/lookup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchData)
            });

            // --- Verificación básica de respuesta (antes de asumir JSON) ---
            if (!response.ok) {
                // Si la respuesta NO es ok (ej 404, 500)
                let errorMsg = `Error ${response.status}: ${response.statusText}`;
                if(response.status === 404) {
                    errorMsg = 'No se encontró la ruta de búsqueda en el servidor (Error 404). Verifica la URL.';
                } else {
                    // Intenta obtener más detalles si es posible
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.message || errorMsg;
                    } catch(e) { /* Ignora si no es JSON */ }
                }
                console.error('Error en fetch buscar reserva:', response.status, response.statusText);
                alert(`Error al buscar: ${errorMsg}`);
                return; // Detiene la ejecución aquí
            }

            // Si la respuesta HTTP fue OK (2xx)
            const result = await response.json();

            if (result.success) {
                const reservations = result.data;
                if (!reservations || reservations.length === 0) {
                     alert('No se encontraron reservas con los datos proporcionados.');
                } else if (reservations.length === 1) {
                     const res = reservations[0];
                     alert(`Reserva encontrada:\nHabitación: ${res.room_type}\nEntrada: ${res.check_in_date}\nSalida: ${res.check_out_date}\nNúmero: ${res.reservation_number}`);
                } else {
                     let message = `Se encontraron ${reservations.length} reservas para ${emailReserva || 'el número '+numero}:\n\n`;
                     reservations.forEach((res, index) => {
                          message += `${index + 1}. Hab: ${res.room_type}, Entrada: ${res.check_in_date}, Salida: ${res.check_out_date}, Num: ${res.reservation_number}\n`;
                     });
                     message += "\n(Mostrando resumen)";
                     alert(message);
                }
                formularioBuscarReserva.reset();
            } else {
                 // El backend respondió OK pero con success: false
                const errorMsg = result.message || (result.errors ? result.errors.map(e => e.msg).join('\n') : 'No se encontró la reserva o hubo un error.');
                alert(`Error al buscar: ${errorMsg}`);
            }
        } catch (error) {
            // Error en la comunicación fetch (red, CORS, etc.) o al parsear JSON
            console.error('Error en fetch buscar reserva:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });

    // --- Manejar envío del formulario REALIZAR RESERVA ---
    formularioReserva.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!currentRoomType) {
            alert('Error inesperado: No se ha seleccionado un tipo de habitación. Por favor, cierra esto y vuelve a hacer clic en "Reservar" en la habitación deseada.');
            contenedorFormularios.style.display = 'none';
            return;
        }
        const nombreReserva = document.getElementById('nombre-reserva').value;
        const apellidoReserva = document.getElementById('apellido-reserva').value;
        const emailReserva = document.querySelector('#realizar-reserva #email-reserva').value;
        const checkInDateValue = document.getElementById('fecha-entrada').value;
        const checkOutDateValue = document.getElementById('fecha-salida').value;

        if (!nombreReserva || !apellidoReserva || !emailReserva || !checkInDateValue || !checkOutDateValue) {
            alert('Por favor, completa todos los campos para realizar la reserva.');
            return;
        }

        const checkIn = new Date(checkInDateValue);
        const checkOut = new Date(checkOutDateValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
             alert('La fecha de entrada no puede ser anterior a hoy.');
             return;
        }
        if (checkOut <= checkIn) {
             alert('La fecha de salida debe ser posterior a la fecha de entrada.');
             return;
        }

        const reservaData = {
            nombreReserva,
            apellidoReserva,
            emailReserva,
            checkInDate: checkInDateValue,
            checkOutDate: checkOutDateValue,
            roomType: currentRoomType
        };

        console.log('Enviando datos de reserva:', reservaData);

        try {
             
            const response = await fetch(`${API_BASE_URL}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservaData)
            });

            // --- Verificación básica de respuesta ---
             if (!response.ok) {
                 let errorMsg = `Error ${response.status}: ${response.statusText}`;
                 try {
                     const errorData = await response.json();
                     errorMsg = errorData.message || (errorData.errors ? errorData.errors.map(e => e.msg).join('\n') : errorMsg);
                 } catch (e) { /* Ignora si no es JSON */ }
                 console.error('Error en fetch realizar reserva:', response.status, response.statusText);
                 alert(`Error al realizar la reserva: ${errorMsg}`);
                 return;
             }

            const result = await response.json();

            if (result.success) {
                alert(`Reserva realizada con éxito.\nEntrada: ${result.data.check_in_date}\nSalida: ${result.data.check_out_date}\nNúmero de reserva: ${result.data.reservation_number}\n¡Gracias!`);
                formularioReserva.reset();
                contenedorFormularios.style.display = 'none';
                currentRoomType = null;
            } else {
                 const errorMsg = result.errors ? result.errors.map(e => e.msg).join('\n') : result.message;
                 alert(`Error al realizar la reserva: ${errorMsg || 'Error desconocido del servidor.'}`);
            }
        } catch (error) {
            console.error('Error en fetch realizar reserva:', error);
            alert('Hubo un problema al conectar con el servidor.');
        }
    });

});// Fin de DOMContentLoaded

