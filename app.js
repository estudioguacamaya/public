// Importar los módulos de Firebase necesarios
// NOTA: En el entorno de Canvas, estas variables globales (__firebase_config, __initial_auth_token)
// se proporcionan automáticamente, por lo que no es necesario importar directamente desde CDN aquí.
// Sin embargo, para un entorno de desarrollo local, necesitarías estas importaciones:
/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithCustomToken, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
*/

document.addEventListener('DOMContentLoaded', async () => {
    // --- Referencias de Elementos del DOM ---
    const loaderOverlay = document.getElementById('loader-overlay');
    const messageBox = document.getElementById('message-box');
    const messageBoxOverlay = document.getElementById('message-box-overlay');
    const messageBoxText = document.getElementById('message-box-text');
    const messageBoxCloseButton = document.getElementById('message-box-close');

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenuButton = document = document.getElementById('close-mobile-menu-button');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    // Seleccionar todos los botones principales de las pestañas (escritorio y móvil) usando la clase común
    const mainTabButtons = document.querySelectorAll('.tab-main-button');
    const contentSections = document.querySelectorAll('.content-section');

    const buscaloyaTabButtons = document.querySelectorAll('.buscaloya-tab-button');
    const buscaloyaTabContents = document.querySelectorAll('.buscaloya-tab-content');

    const thumbnailImages = document.querySelectorAll('.thumbnail-image');

    // Botones genéricos del carrusel para carruseles con scrollBy
    const genericCarouselPrevBtns = document.querySelectorAll('.carousel-prev-btn');
    const genericCarouselNextBtns = document.querySelectorAll('.carousel-next-btn');

    // Elementos específicos de la Sección Mi Cuenta
    const loginRegisterSection = document.getElementById('login-register-section');
    const userDashboardSection = document.getElementById('user-dashboard-section');
    const publishProductSection = document.getElementById('publish-product-section');

    const authTitle = document.getElementById('auth-title');
    const authMessage = document.getElementById('auth-message');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterFormBtn = document.getElementById('show-register-form');
    const showLoginFormBtn = document.getElementById('show-login-form');

    const userEmailDisplay = document.getElementById('user-email-display');
    const userIdDisplay = document.getElementById('user-id-display');
    const postsRemainingDisplay = document.getElementById('posts-remaining-display');
    const showPublishFormBtn = document.getElementById('show-publish-form-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userProductsList = document.getElementById('user-products-list');
    const noUserProductsMessage = document.getElementById('no-user-products-message');

    const publishProductForm = document.getElementById('publish-product-form');
    const productImagesInput = document.getElementById('product-images');
    const imagePreviewContainer = document.getElementById('image-preview');
    const cancelPublishBtn = document.getElementById('cancel-publish-btn');
    const publishMessage = document.getElementById('publish-message');

    // Elementos específicos de Worldcoin
    const worldcoinPriceElement = document.querySelector('#hero-worldcoin .text-5xl');
    const worldcoinPriceStatus = document.querySelector('#hero-worldcoin .text-gray-600');

    // --- Variables Globales de Firebase (Proporcionadas por el Entorno Canvas) ---
    let app, auth, db, storage;
    let currentUserId = null; // Para almacenar el ID del usuario autenticado
    const MAX_FREE_POSTS = 10; // Límite para usuarios gratuitos
    let firebaseInitialized = false; // Variable para controlar si Firebase se inicializó

    // --- Configuración de la API de Criptomonedas ---
    // Usaremos la API pública de Binance para obtener el precio de WLD/USDT.
    const BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/price?symbol=WLDUSDT";
    let worldcoinPriceInterval = null; // Para almacenar el ID del intervalo para las actualizaciones de precio
    let messageBoxTimeout = null; // Para almacenar el timeout del cuadro de mensaje

    // --- Funciones de Utilidad ---

    // Función para mostrar la superposición del cargador
    function showLoader() {
        if (loaderOverlay) {
            loaderOverlay.classList.remove('hidden');
            loaderOverlay.style.opacity = '1';
            loaderOverlay.style.pointerEvents = 'auto'; // Permitir interacción con el cargador (si la hay, típicamente ninguna)
        }
    }

    // Función para ocultar la superposición del cargador
    function hideLoader() {
        if (loaderOverlay) {
            loaderOverlay.style.opacity = '0';
            loaderOverlay.style.pointerEvents = 'none';
            loaderOverlay.addEventListener('transitionend', () => {
                loaderOverlay.classList.add('hidden');
            }, { once: true }); // Ejecutar solo una vez
        }
    }

    /**
     * Función para mostrar un cuadro de mensaje.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de mensaje (info, success, warning, error).
     * @param {boolean} autoHide - Si el mensaje debe ocultarse automáticamente.
     * @param {number} delay - El retardo en milisegundos para ocultar si autoHide es true.
     */
    function showMessageBox(message, type = 'info', autoHide = false, delay = 7000) { // Valor predeterminado de 7 segundos
        if (messageBox && messageBoxText && messageBoxOverlay) {
            // Limpiar cualquier timeout existente para evitar que el mensaje desaparezca prematuramente
            if (messageBoxTimeout) {
                clearTimeout(messageBoxTimeout);
            }

            messageBoxText.textContent = message;
            // Restablecer clases
            messageBox.classList.remove('bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-yellow-100', 'border-yellow-400', 'text-yellow-700', 'bg-white', 'border-gray-200', 'text-gray-800');
            
            // Aplicar estilo específico del tipo
            switch (type) {
                case 'error':
                    messageBox.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                    break;
                case 'success':
                    messageBox.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
                    break;
                case 'warning':
                    messageBox.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
                    break;
                default: // 'info' o cualquier otro
                    messageBox.classList.add('bg-white', 'border-gray-200', 'text-gray-800');
            }

            // Mostrar el cuadro de mensaje
            messageBox.classList.add('show', 'fade-in');
            messageBoxOverlay.classList.add('show', 'fade-in');
            messageBoxOverlay.style.pointerEvents = 'auto'; // Permitir que la superposición capture clics

            // Configurar auto-ocultar si se solicita
            if (autoHide) {
                messageBoxTimeout = setTimeout(() => {
                    hideMessageBox();
                }, delay);
            }
        }
    }

    // Función para ocultar el cuadro de mensaje
    function hideMessageBox() {
        if (messageBox && messageBoxOverlay) {
            messageBox.classList.remove('show', 'fade-in');
            messageBoxOverlay.classList.remove('show', 'fade-in');
            messageBoxOverlay.style.pointerEvents = 'none'; // Evitar clics durante el desvanecimiento y cuando está oculto
            // Limpiar cualquier botón añadido dinámicamente para confirmación
            const confirmBtn = messageBox.querySelector('#confirm-action-btn');
            if (confirmBtn) {
                confirmBtn.remove();
            }
            // Limpiar el timeout del cuadro de mensaje si existe
            if (messageBoxTimeout) {
                clearTimeout(messageBoxTimeout);
                messageBoxTimeout = null;
            }
            // Volver a añadir el oyente de cierre predeterminado si fue eliminado (por confirmación)
            messageBoxCloseButton.removeEventListener('click', hideMessageBox);
            messageBoxCloseButton.addEventListener('click', hideMessageBox);
        }
    }

    // Función para mostrar mensajes de autenticación (para formularios de inicio de sesión/registro)
    function showAuthMessage(message, type = 'error') {
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
            if (type === 'error') {
                authMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
            } else if (type === 'success') {
                authMessage.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
            } else if (type === 'warning') {
                authMessage.classList.add('bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
            }
            authMessage.classList.remove('hidden');
        }
    }

    // Función para ocultar mensajes de autenticación
    function hideAuthMessage() {
        if (authMessage) {
            authMessage.classList.add('hidden');
        }
    }

    /**
     * Muestra una sección de contenido específica y oculta las demás.
     * También actualiza el estado activo de los botones de navegación principales y gestiona el intervalo de precios de Worldcoin.
     * @param {string} sectionId - El ID de la sección de contenido a mostrar (por ejemplo, 'content-marketplace').
     */
    function showContentSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('fade-in');
        });
        const activeSection = document.getElementById(sectionId);
        if (activeSection) {
            activeSection.classList.remove('hidden');
            activeSection.classList.add('fade-in');
            // Desplazarse a la parte superior del área de contenido principal
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Actualizar el estilo del botón de la pestaña activa
        mainTabButtons.forEach(button => {
            if (button.id === `tab-${sectionId.replace('content-', '')}` || button.id === `mobile-main-nav-${sectionId.replace('content-', '')}`) {
                button.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-200');
                button.classList.add('bg-yellow-600', 'text-white', 'hover:bg-yellow-700');
            } else {
                button.classList.remove('bg-yellow-600', 'text-white', 'hover:bg-yellow-700');
                button.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-200');
            }
        });

        // Cerrar el menú móvil si está abierto
        mobileMenu.classList.remove('translate-y-0');
        mobileMenu.classList.add('-translate-y-full');
        mobileMenu.classList.add('hidden'); // Asegurarse de que esté oculto después de la animación
        mobileMenuIcon.classList.remove('fa-times');
        mobileMenuIcon.classList.add('fa-bars');

        // --- Gestión de Actualización de Precios de Worldcoin ---
        if (sectionId === 'content-worldcoin') {
            fetchWorldcoinPrice(); // Obtener inmediatamente cuando se abre la pestaña
            if (worldcoinPriceInterval) {
                clearInterval(worldcoinPriceInterval); // Limpiar cualquier intervalo existente
            }
            worldcoinPriceInterval = setInterval(fetchWorldcoinPrice, 30000); // Actualizar cada 30 segundos
        } else {
            if (worldcoinPriceInterval) {
                clearInterval(worldcoinPriceInterval); // Dejar de actualizar si no está en la pestaña de Worldcoin
                worldcoinPriceInterval = null;
            }
        }
    }

    // --- Inicialización y Autenticación de Firebase ---

    // Inicializar Firebase condicionalmente
    showLoader(); // Mostrar cargador mientras Firebase intenta inicializar
    if (typeof firebase !== 'undefined' && typeof __firebase_config !== 'undefined') {
        try {
            const firebaseConfig = JSON.parse(__firebase_config);
            app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            storage = firebase.storage();
            firebaseInitialized = true; // Indicar que Firebase se inicializó correctamente

            // Oyente de Estado de Autenticación de Firebase
            onAuthStateChanged(auth, async (user) => {
                hideLoader(); // Ocultar cargador una vez que se conoce el estado de autenticación
                if (user) {
                    currentUserId = user.uid;
                    userEmailDisplay.textContent = user.email || 'Usuario';
                    userIdDisplay.textContent = user.uid;
                    loginRegisterSection.classList.add('hidden');
                    userDashboardSection.classList.remove('hidden');
                    publishProductSection.classList.add('hidden'); // Ocultar el formulario de publicación inicialmente

                    // Obtener y mostrar los productos del usuario
                    await fetchUserProducts(currentUserId);
                    await checkUserPostCount(currentUserId);
                } else {
                    currentUserId = null;
                    loginRegisterSection.classList.remove('hidden');
                    userDashboardSection.classList.add('hidden');
                    publishProductSection.classList.add('hidden');
                    authTitle.textContent = 'Inicia Sesión';
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                }
            });

            // Iniciar sesión con token personalizado proporcionado por Canvas o anónimamente
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                try {
                    await auth.signInWithCustomToken(__initial_auth_token);
                    console.log("Signed in with custom token.");
                } catch (error) {
                    console.error("Error signing in with custom token:", error);
                    showMessageBox(`Error al iniciar sesión con token: ${error.message}`, 'error', true); // autoHide para errores de inicio de sesión
                    // Volver a la inicio de sesión anónimo si el token personalizado falla
                    try {
                        await auth.signInAnonymously();
                        console.log("Signed in anonymously as fallback.");
                    } catch (anonError) {
                        console.error("Error signing in anonymously:", anonError);
                        showMessageBox(`Error al iniciar sesión anónimamente: ${anonError.message}`, 'error', true); // autoHide
                    }
                }
            } else {
                // Si no hay token personalizado, iniciar sesión anónimamente
                try {
                    await auth.signInAnonymously();
                    console.log("Signed in anonymously.");
                } catch (error) {
                    console.error("Error signing in anonymously:", error);
                    showMessageBox(`Error al iniciar sesión anónimamente: ${error.message}`, 'error', true); // autoHide
                }
            }
        } catch (initError) {
            firebaseInitialized = false;
            console.error('Error al inicializar Firebase:', initError);
            showMessageBox('Error: No se pudo inicializar Firebase. Las funcionalidades de usuario (Mi Cuenta) no estarán disponibles.', 'error', true); // autoHide
            hideLoader();
        }
    } else {
        // Firebase no inicializado (probablemente ejecución local)
        firebaseInitialized = false;
        hideLoader(); // Ocultar cargador si Firebase no se inicializa
        showMessageBox('Firebase no está configurado. Las funcionalidades de usuario (Mi Cuenta, Publicar Anuncio) no estarán disponibles.', 'warning', true); // autoHide
        console.warn('Firebase no inicializado. Asegúrate de que las variables globales __firebase_config y __initial_auth_token estén definidas para que las funcionalidades de usuario funcionen.');
        // Asegurarse de que las secciones de usuario estén ocultas y se muestre un mensaje si se intenta acceder
        if (loginRegisterSection) loginRegisterSection.classList.add('hidden');
        if (userDashboardSection) userDashboardSection.classList.add('hidden');
        if (publishProductSection) publishProductSection.classList.add('hidden');

        // Deshabilitar botones o formularios relacionados con Firebase
        if (showPublishFormBtn) showPublishFormBtn.disabled = true;
        if (loginForm) loginForm.addEventListener('submit', (e) => { e.preventDefault(); showMessageBox('Firebase no está activo. No puedes iniciar sesión o registrarte.', 'error', true); });
        if (registerForm) registerForm.addEventListener('submit', (e) => { e.preventDefault(); showMessageBox('Firebase no está activo. No puedes iniciar sesión o registrarte.', 'error', true); });
        if (logoutBtn) logoutBtn.addEventListener('click', () => { showMessageBox('Firebase no está activo. No hay sesión para cerrar.', 'error', true); });
        if (publishProductForm) publishProductForm.addEventListener('submit', (e) => { e.preventDefault(); showMessageBox('Firebase no está activo. No puedes publicar anuncios.', 'error', true); });

        // Mensaje para el panel de usuario si se intenta acceder
        if (userDashboardSection && userDashboardSection.classList.contains('hidden')) {
            const tempMessageDiv = document.createElement('div');
            tempMessageDiv.className = 'p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center mx-auto mt-8 max-w-lg';
            tempMessageDiv.textContent = 'Las funcionalidades de Mi Cuenta y Publicar Anuncio requieren que Firebase esté activo. Por favor, sube tu aplicación a un entorno que proporcione la configuración de Firebase.';
            loginRegisterSection.parentNode.insertBefore(tempMessageDiv, loginRegisterSection);
        }
    }

    // --- Funciones de Autenticación (ahora verifican firebaseInitialized) ---

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes iniciar sesión o registrarte.', 'error', true);
                return;
            }
            showLoader();
            hideAuthMessage();
            const email = loginForm['login-email'].value;
            const password = loginForm['login-password'].value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                showMessageBox('¡Inicio de sesión exitoso!', 'success', true);
                loginForm.reset();
            } catch (error) {
                showAuthMessage(`Error al iniciar sesión: ${error.message}`, 'error');
                console.error("Error al iniciar sesión:", error);
            } finally {
                hideLoader();
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes iniciar sesión o registrarte.', 'error', true);
                return;
            }
            showLoader();
            hideAuthMessage();
            const email = registerForm['register-email'].value;
            const password = registerForm['register-password'].value;

            if (password.length < 6) {
                showAuthMessage('La contraseña debe tener al menos 6 caracteres.', 'warning');
                hideLoader();
                return;
            }

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Guardar datos adicionales del usuario en Firestore
                await db.collection('users').doc(user.uid).set({
                    email: user.email,
                    postsCount: 0, // Inicializar el contador de publicaciones para el nuevo usuario
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showMessageBox('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success', true);
                registerForm.reset();
                // Cambiar automáticamente al formulario de inicio de sesión después del registro exitoso
                showLoginFormBtn.click();
            } catch (error) {
                showAuthMessage(`Error al registrar: ${error.message}`, 'error');
                console.error("Error al registrar:", error);
            } finally {
                hideLoader();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No hay sesión para cerrar.', 'error', true);
                return;
            }
            showLoader();
            try {
                await auth.signOut();
                showMessageBox('Has cerrado sesión exitosamente.', 'info', true);
            } catch (error) {
                showMessageBox(`Error al cerrar sesión: ${error.message}`, 'error', true);
                console.error("Error al cerrar sesión:", error);
            } finally {
                hideLoader();
            }
        });
    }

    if (showRegisterFormBtn) {
        showRegisterFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes acceder a los formularios de autenticación.', 'error', true);
                return;
            }
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            authTitle.textContent = 'Regístrate';
            hideAuthMessage();
        });
    }

    if (showLoginFormBtn) {
        showLoginFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes acceder a los formularios de autenticación.', 'error', true);
                return;
            }
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authTitle.textContent = 'Inicia Sesión';
            hideAuthMessage();
        });
    }

    // --- Funciones CRUD de Productos (ahora verifican firebaseInitialized) ---

    // Obtener productos del usuario de Firestore
    async function fetchUserProducts(userId) {
        if (!firebaseInitialized) {
            console.warn('Firebase no inicializado. No se pueden cargar productos.');
            noUserProductsMessage.classList.remove('hidden'); // Mostrar mensaje de no productos
            return;
        }
        showLoader();
        userProductsList.innerHTML = ''; // Limpiar productos anteriores
        noUserProductsMessage.classList.add('hidden');

        try {
            const productsCollection = db.collection('products');
            const q = productsCollection.where('userId', '==', userId);
            const querySnapshot = await q.get();

            if (querySnapshot.empty) {
                noUserProductsMessage.classList.remove('hidden');
            } else {
                querySnapshot.forEach((doc) => {
                    const product = doc.data();
                    const productId = doc.id;
                    displayUserProduct(product, productId);
                });
            }
        } catch (error) {
            showMessageBox(`Error al cargar tus publicaciones: ${error.message}`, 'error', true);
            console.error("Error fetching user products:", error);
        } finally {
            hideLoader();
        }
    }

    // Mostrar un solo producto del usuario en el panel
    function displayUserProduct(product, productId) {
        const productCard = document.createElement('article');
        productCard.className = 'bg-white rounded-xl shadow-lg border border-gray-200 p-4 relative hover:shadow-xl transition-all card-hover-effect';
        productCard.innerHTML = `
            <div class="relative">
                <img src="${product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/288x160/cccccc/333333?text=No+Image'}" alt="${product.title}" class="rounded-t-xl w-full h-40 object-cover">
                <button aria-label="Eliminar publicación" class="delete-product-btn absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 text-xs hover:bg-red-600 transition-colors shadow-md" data-id="${productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="p-4 text-sm">
                <p class="font-bold text-gray-900 text-lg">$${product.price.toFixed(2)}</p>
                <p class="text-gray-600">${product.location}</p>
                <p class="font-semibold mt-1">${product.title}</p>
                <p class="text-gray-500 text-xs mt-1">${product.description.substring(0, 50)}...</p>
                <button aria-label="Editar publicación" class="edit-product-btn mt-4 w-full bg-blue-500 text-white rounded-full text-sm py-2 font-semibold hover:bg-blue-600 transition-colors shadow-md" data-id="${productId}">
                    Editar
                </button>
            </div>
        `;
        userProductsList.appendChild(productCard);

        // Añadir oyentes de eventos para los botones de eliminar y editar
        productCard.querySelector('.delete-product-btn').addEventListener('click', (e) => {
            const idToDelete = e.currentTarget.dataset.id;
            
            // Mostrar mensaje de confirmación personalizado (este no se auto-oculta para requerir confirmación)
            showMessageBox('¿Estás seguro de que quieres eliminar esta publicación? Esto no se puede deshacer.', 'warning', false);
            
            const existingConfirmBtn = messageBox.querySelector('#confirm-action-btn');
            if (existingConfirmBtn) {
                existingConfirmBtn.remove(); // Eliminar cualquier botón de confirmación anterior
            }

            const confirmDeleteBtn = document.createElement('button');
            confirmDeleteBtn.id = 'confirm-action-btn'; // Añadir un ID para facilitar la eliminación
            confirmDeleteBtn.textContent = 'Confirmar';
            confirmDeleteBtn.className = 'bg-red-500 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-red-600 transition-colors mr-2';
            
            // Eliminar el oyente de cierre anterior para evitar que se dispare dos veces
            messageBoxCloseButton.removeEventListener('click', hideMessageBox);

            confirmDeleteBtn.addEventListener('click', async () => {
                hideMessageBox();
                await deleteProduct(idToDelete);
            }, { once: true }); // Asegurarse de que este oyente se ejecute solo una vez

            // Reemplazar temporalmente el comportamiento del botón de cierre para esta confirmación específica
            messageBoxCloseButton.addEventListener('click', () => {
                hideMessageBox(); // Solo ocultar, no confirmar la acción
            }, { once: true }); // Asegurarse de que este oyente se ejecute solo una vez

            messageBox.appendChild(confirmDeleteBtn);
        });

        productCard.querySelector('.edit-product-btn').addEventListener('click', (e) => {
            const idToEdit = e.currentTarget.dataset.id;
            // Implementar funcionalidad de edición (por ejemplo, poblar el formulario de publicación con datos existentes)
            showMessageBox(`Funcionalidad de edición para el producto ID: ${idToEdit} (no implementada completamente en este demo).`, 'info', true); // autoHide
        });
    }

    // Comprobar el recuento de publicaciones del usuario y actualizar la interfaz de usuario
    async function checkUserPostCount(userId) {
        if (!firebaseInitialized) {
            console.warn('Firebase no inicializado. No se puede verificar el recuento de publicaciones.');
            postsRemainingDisplay.textContent = `N/A / ${MAX_FREE_POSTS}`;
            if (showPublishFormBtn) {
                showPublishFormBtn.disabled = true;
                showPublishFormBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
            return;
        }
        try {
            const userDocRef = db.collection('users').doc(userId);
            const userDocSnap = await userDocRef.get();

            if (userDocSnap.exists) {
                const userData = userDocSnap.data();
                const postsCount = userData.postsCount || 0;
                const remainingPosts = MAX_FREE_POSTS - postsCount;
                postsRemainingDisplay.textContent = `${remainingPosts} / ${MAX_FREE_POSTS}`;

                if (remainingPosts <= 0) {
                    if (showPublishFormBtn) {
                        showPublishFormBtn.disabled = true;
                        showPublishFormBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    }
                    showMessageBox(`Has alcanzado el límite de ${MAX_FREE_POSTS} publicaciones para la cuenta gratuita. ¡Considera mejorar tu plan!`, 'info', true); // autoHide
                } else {
                    if (showPublishFormBtn) {
                        showPublishFormBtn.disabled = false;
                        showPublishFormBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    }
                }
            } else {
                postsRemainingDisplay.textContent = `0 / ${MAX_FREE_POSTS}`; // No debería ocurrir si el usuario está autenticado
            }
        } catch (error) {
            console.error("Error checking user post count:", error);
            postsRemainingDisplay.textContent = `Error`;
        }
    }

    // Añadir un nuevo producto a Firestore
    if (publishProductForm) {
        publishProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                publishMessage.textContent = 'Firebase no está activo. No puedes publicar anuncios.';
                publishMessage.classList.remove('hidden');
                publishMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                return;
            }
            showLoader();
            hideAuthMessage(); // Usar publishMessage para esta sección
            publishMessage.classList.add('hidden');

            if (!currentUserId) {
                publishMessage.textContent = 'Debes iniciar sesión para publicar un artículo.';
                publishMessage.classList.remove('hidden');
                publishMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                hideLoader();
                return;
            }

            try {
                const userDocRef = db.collection('users').doc(currentUserId);
                const userDocSnap = await userDocRef.get();
                const userData = userDocSnap.data();
                const postsCount = userData.postsCount || 0;

                if (postsCount >= MAX_FREE_POSTS) {
                    publishMessage.textContent = `Has alcanzado el límite de ${MAX_FREE_POSTS} publicaciones para la cuenta gratuita.`;
                    publishMessage.classList.remove('hidden');
                    publishMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                    hideLoader();
                    return;
                }

                const title = document.getElementById('product-title').value;
                const description = document.getElementById('product-description').value;
                const price = parseFloat(document.getElementById('product-price').value);
                const category = document.getElementById('product-category').value;
                const location = document.getElementById('product-location').value;
                const files = productImagesInput.files;

                if (!title || !description || isNaN(price) || !category || !location) {
                    publishMessage.textContent = 'Por favor, completa todos los campos requeridos.';
                    publishMessage.classList.remove('hidden');
                    publishMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                    hideLoader();
                    return;
                }

                const imageUrls = [];
                if (files.length > 0) {
                    for (let i = 0; i < Math.min(files.length, 3); i++) { // Limitar a 3 imágenes
                        const file = files[i];
                        const storageRef = storage.ref(`product_images/${currentUserId}/${Date.now()}_${file.name}`);
                        const uploadTask = await storageRef.put(file);
                        const downloadURL = await uploadTask.ref.getDownloadURL();
                        imageUrls.push(downloadURL);
                    }
                }

                await db.collection('products').add({
                    userId: currentUserId,
                    title,
                    description,
                    price,
                    category,
                    location,
                    images: imageUrls,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Incrementar el contador de publicaciones del usuario
                await userDocRef.update({
                    postsCount: postsCount + 1
                });

                publishProductForm.reset();
                imagePreviewContainer.innerHTML = ''; // Limpiar la vista previa de la imagen
                showMessageBox('¡Artículo publicado exitosamente!', 'success', true); // autoHide
                publishMessage.textContent = '¡Artículo publicado exitosamente!';
                publishMessage.classList.remove('hidden', 'bg-red-100', 'border-red-400', 'text-red-700');
                publishMessage.classList.add('bg-green-100', 'border-green-400', 'text-green-700');

                // Actualizar productos del usuario y el recuento de publicaciones
                await fetchUserProducts(currentUserId);
                await checkUserPostCount(currentUserId);

                // Ocultar el formulario de publicación y mostrar el panel de control
                publishProductSection.classList.add('hidden');
                userDashboardSection.classList.remove('hidden');

            } catch (error) {
                publishMessage.textContent = `Error al publicar: ${error.message}`;
                publishMessage.classList.remove('hidden');
                publishMessage.classList.add('bg-red-100', 'border-red-400', 'text-red-700');
                console.error("Error adding product:", error);
            } finally {
                hideLoader();
            }
        });
    }

    // Eliminar un producto de Firestore
    async function deleteProduct(productId) {
        if (!firebaseInitialized) {
            showMessageBox('Firebase no está activo. No se puede eliminar publicaciones.', 'error', true);
            return;
        }
        showLoader();
        try {
            await db.collection('products').doc(productId).delete();

            // Decrementar el contador de publicaciones del usuario
            const userDocRef = db.collection('users').doc(currentUserId);
            const userDocSnap = await userDocRef.get();
            if (userDocSnap.exists) {
                const userData = userDocSnap.data();
                const newPostsCount = Math.max(0, (userData.postsCount || 0) - 1);
                await userDocRef.update({
                    postsCount: newPostsCount
                });
            }

            showMessageBox('Publicación eliminada exitosamente.', 'success', true); // autoHide
            await fetchUserProducts(currentUserId); // Actualizar la lista
            await checkUserPostCount(currentUserId); // Actualizar la visualización del recuento de publicaciones
        } catch (error) {
            showMessageBox(`Error al eliminar publicación: ${error.message}`, 'error', true);
            console.error("Error deleting product:", error);
        } finally {
            hideLoader();
        }
    }

    // Vista previa de la imagen para la carga de productos
    if (productImagesInput) {
        productImagesInput.addEventListener('change', (event) => {
            imagePreviewContainer.innerHTML = ''; // Limpiar vistas previas anteriores
            const files = event.target.files;
            if (files) {
                for (let i = 0; i < Math.min(files.length, 3); i++) { // Limitar a 3 imágenes
                    const file = files[i];
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'w-24 h-24 object-cover rounded-lg shadow-md';
                        imagePreviewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    // Mostrar formulario de publicación de productos
    if (showPublishFormBtn) {
        showPublishFormBtn.addEventListener('click', () => {
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes publicar anuncios.', 'error', true);
                return;
            }
            publishProductSection.classList.remove('hidden');
            userDashboardSection.classList.add('hidden');
            publishProductForm.reset(); // Limpiar formulario
            imagePreviewContainer.innerHTML = ''; // Limpiar vista previa de la imagen
            publishMessage.classList.add('hidden'); // Ocultar cualquier mensaje anterior
        });
    }

    // Cancelar publicación de producto
    if (cancelPublishBtn) {
        cancelPublishBtn.addEventListener('click', () => {
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes cancelar la publicación.', 'error', true);
                return;
            }
            publishProductSection.classList.add('hidden');
            userDashboardSection.classList.remove('hidden');
            publishProductForm.reset(); // Limpiar formulario
            imagePreviewContainer.innerHTML = ''; // Limpiar vista previa de la imagen
            publishMessage.classList.add('hidden'); // Ocultar cualquier mensaje anterior
        });
    }

    // --- Función de Obtención de Precios de Worldcoin ---
    async function fetchWorldcoinPrice() {
        if (!worldcoinPriceElement || !worldcoinPriceStatus) {
            console.warn('Elementos HTML para el precio de Worldcoin no encontrados. Saltando la actualización del precio.');
            return;
        }

        worldcoinPriceElement.textContent = 'Cargando...';
        worldcoinPriceStatus.textContent = 'Actualizando precio...';

        try {
            // Se usa la API de Binance para obtener el precio de WLD/USDT
            const response = await fetch(BINANCE_API_URL);

            if (!response.ok) {
                const errorText = await response.text(); // Obtener el texto del error
                throw new Error(`Network response was not ok: ${response.status} - ${response.statusText}. Error response: ${errorText}`);
            }

            const data = await response.json();

            // La API de Binance para el ticker de precio devuelve un objeto simple
            // { "symbol": "WLDUSDT", "price": "1.14500000" }
            if (data && data.price) {
                const price = parseFloat(data.price);
                const formattedPrice = price.toFixed(3); // Mantener 3 decimales
                worldcoinPriceElement.textContent = `${formattedPrice} $USD`;
                worldcoinPriceStatus.textContent = 'Precio en vivo (vía Binance)';
            } else {
                worldcoinPriceElement.textContent = 'N/A $USD';
                worldcoinPriceStatus.textContent = 'Precio no disponible';
                console.warn('La estructura de datos de la API de Binance no es la esperada para WLDUSDT. Respuesta completa:', data);
            }

        } catch (error) {
            console.error('Error al obtener el precio de Worldcoin desde Binance:', error);
            worldcoinPriceElement.textContent = 'Error $USD';
            worldcoinPriceStatus.textContent = 'No se pudo cargar el precio';
            showMessageBox(`No se pudo actualizar el precio de Worldcoin. Detalle: ${error.message}. Consulta la consola para más información.`, 'error', true); // autoHide
        }
    }


    // --- Interacciones Generales de la Interfaz de Usuario ---

    // Botón de Cerrar Cuadro de Mensaje
    if (messageBoxCloseButton) {
        messageBoxCloseButton.addEventListener('click', hideMessageBox);
    }

    // Alternar Menú Móvil
    if (mobileMenuButton && mobileMenu && closeMobileMenuButton && mobileMenuIcon) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden') || mobileMenu.classList.contains('slide-up-menu')) {
                mobileMenu.classList.remove('hidden', 'slide-up-menu');
                mobileMenu.classList.add('translate-y-0'); // Aplicar transformación directamente
                mobileMenuIcon.classList.remove('fa-bars');
                mobileMenuIcon.classList.add('fa-times'); // Cambiar a icono de cierre
            } else {
                mobileMenu.classList.remove('translate-y-0');
                mobileMenu.classList.add('-translate-y-full');
                mobileMenu.addEventListener('transitionend', () => { // Usar transitionend para ocultar
                    mobileMenu.classList.add('hidden');
                }, { once: true });
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars'); // Volver a cambiar al icono de hamburguesa
            }
        });

        closeMobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-y-0');
            mobileMenu.classList.add('-translate-y-full');
            mobileMenu.addEventListener('transitionend', () => { // Usar transitionend para ocultar
                mobileMenu.classList.add('hidden');
            }, { once: true });
            mobileMenuIcon.classList.remove('fa-times');
            mobileMenuIcon.classList.add('fa-bars'); // Volver a cambiar al icono de hamburguesa
        });
    }

    // Navegación de Pestañas Principales
    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            let targetId;
            if (button.id.startsWith('tab-')) {
                targetId = 'content-' + button.id.replace('tab-', '');
            } else if (button.id.startsWith('mobile-main-nav-')) {
                targetId = 'content-' + button.id.replace('mobile-main-nav-', '');
            }
            if (targetId) {
                showContentSection(targetId);
            }
        });
    });

    // Inicializar la pestaña de Marketplace como activa al cargar
    showContentSection('content-marketplace');

    // Subpestañas de Buscaloya (sección Financiamiento)
    buscaloyaTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            buscaloyaTabButtons.forEach(btn => {
                btn.classList.remove('bg-gray-900', 'text-white', 'shadow-md');
                btn.classList.add('text-gray-400', 'border', 'border-gray-300');
            });
            buscaloyaTabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('slide-in-right');
            });

            button.classList.remove('text-gray-400', 'border', 'border-gray-300');
            button.classList.add('bg-gray-900', 'text-white', 'shadow-md');

            const targetTab = button.dataset.tab;
            const targetContent = document.getElementById(`buscaloya-tab-content-${targetTab}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('slide-in-right');
            }
        });
    });

    // Inicializar las subpestañas de financiamiento para mostrar 'Principal' por defecto
    const initialFinancingTab = document.querySelector('.buscaloya-tab-button[data-tab="principal"]');
    if (initialFinancingTab) {
        initialFinancingTab.click();
    }

    // Manejador de clic de imagen en miniatura
    thumbnailImages.forEach(thumbnail => {
        thumbnail.addEventListener('click', (e) => {
            const mainImage = e.target.closest('article').querySelector('.main-category-image');
            if (mainImage) {
                mainImage.src = e.target.dataset.mainImage;
                mainImage.alt = e.target.alt;
            }
        });
    });

    // Navegación Genérica del Carrusel
    genericCarouselPrevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetCarouselId = btn.dataset.target;
            const carousel = document.getElementById(targetCarouselId);
            if (carousel) {
                carousel.scrollBy({ left: -carousel.offsetWidth * 0.8, behavior: 'smooth' });
            }
        });
    });

    genericCarouselNextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetCarouselId = btn.dataset.target;
            const carousel = document.getElementById(targetCarouselId);
            if (carousel) {
                carousel.scrollBy({ left: carousel.offsetWidth * 0.8, behavior: 'smooth' });
            }
        });
    });

    // Puntos del Carrusel de Worldcoin
    const worldcoinCarousel = document.getElementById('club-buscaloya-carousel');
    const carouselTrack = document.getElementById('carousel-track');
    const carouselDotsContainer = document.getElementById('buscaloya-carousel-dots');
    if (worldcoinCarousel && carouselTrack && carouselDotsContainer) {
        const slides = carouselTrack.children;
        const totalSlides = slides.length;
        let currentSlide = 0;

        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            Array.from(carouselDotsContainer.children).forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('bg-white');
                    dot.classList.remove('bg-gray-600');
                } else {
                    dot.classList.add('bg-gray-600');
                    dot.classList.remove('bg-white');
                }
            });
        }

        // Auto-avanzar carrusel
        let autoSlideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }, 5000); // Cambiar diapositiva cada 5 segundos

        // Navegación manual para el carrusel de Worldcoin
        document.querySelectorAll('.buscaloya-carousel-prev-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(autoSlideInterval); // Detener el auto-deslizamiento en la interacción manual
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides; // Lógica corregida para retroceder
                updateCarousel();
                autoSlideInterval = setInterval(() => { // Reiniciar auto-deslizamiento
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateCarousel();
                }, 5000);
            });
        });

        document.querySelectorAll('.buscaloya-carousel-next-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(autoSlideInterval); // Detener el auto-deslizamiento en la interacción manual
                currentSlide = (currentSlide + 1) % totalSlides;
                updateCarousel();
                autoSlideInterval = setInterval(() => { // Reiniciar auto-deslizamiento
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateCarousel();
                }, 5000);
            });
        });

        carouselDotsContainer.querySelectorAll('span').forEach(dot => {
            dot.addEventListener('click', (e) => {
                clearInterval(autoSlideInterval); // Detener el auto-deslizamiento en la interacción manual
                currentSlide = parseInt(e.target.dataset.slideIndex);
                updateCarousel();
                autoSlideInterval = setInterval(() => { // Reiniciar auto-deslizamiento
                    currentSlide = (currentSlide + 1) % totalSlides;
                    updateCarousel();
                }, 5000);
            });
        });

        updateCarousel(); // Actualización inicial
    }

    // Funcionalidad del botón de desplazamiento hacia arriba
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Mostrar botón después de desplazarse 300px
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showMessageBox('Volviendo al inicio...', 'info', true, 2000); // autoHide para mensajes informativos
        });
    }

    // Manejadores de clic genéricos para varios enlaces/botones
    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Abriendo red social...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.footer-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Navegando...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.footer-support-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Cargando soporte...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.footer-legal-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Cargando información legal...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Botón de Soporte de Chat
    const chatSupportBtn = document.getElementById('chat-support-btn');
    if (chatSupportBtn) {
        chatSupportBtn.addEventListener('click', () => {
            showMessageBox('Iniciando chat de soporte...', 'info', true, 2000); // autoHide
        });
    }

    // Enlace de Promoción
    const promoLink = document.getElementById('promo-link');
    if (promoLink) {
        promoLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando nuestras últimas ofertas y promociones exclusivas...', 'info', true, 2000); // autoHide
        });
    }

    // Botones de Publicar Anuncio
    document.querySelectorAll('#publish-ad-desktop-btn, #mobile-publish-ad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes publicar anuncios.', 'error', true); // autoHide
                return;
            }
            showMessageBox('Redirigiendo a la sección de publicación de anuncios...', 'info', true, 2000); // autoHide
            showContentSection('content-my-account'); // Cambiar a la pestaña Mi Cuenta
            // Lógica adicional para mostrar el formulario de publicación si el usuario ha iniciado sesión
            if (currentUserId) {
                userDashboardSection.classList.add('hidden');
                publishProductSection.classList.remove('hidden');
            } else {
                showMessageBox('Por favor, inicia sesión para publicar un anuncio.', 'info', true); // autoHide
                loginRegisterSection.classList.remove('hidden');
                userDashboardSection.classList.add('hidden');
                publishProductSection.classList.add('hidden');
            }
        });
    });

    // Botón de Mi Cuenta de Escritorio
    const myAccountDesktopBtn = document.getElementById('my-account-desktop-btn');
    if (myAccountDesktopBtn) {
        myAccountDesktopBtn.addEventListener('click', () => {
            showContentSection('content-my-account');
        });
    }

    // Botones de Comprar Ahora y Publicar Gratis
    document.querySelectorAll('#buy-now-btn, #publish-free-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = e.target.dataset.message || 'Realizando acción...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Botón de Búsqueda
    const buscaloyaSearchButton = document.getElementById('buscaloya-search-button');
    const buscaloyaSearchInput = document.getElementById('buscaloya-search-input');
    const buscaloyaCategorySelect = document.getElementById('buscaloya-category-select');
    const buscaloyaLocationSelect = document.getElementById('buscaloya-location-select');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const clearSearchContainer = document.getElementById('clear-search-container');
    const noSearchResultsMessage = document.getElementById('no-search-results-message');
    const marketplaceProductsContainer = document.getElementById('marketplace-products-container'); // Este es el contenedor de productos

    function filterProducts() {
        const searchTerm = buscaloyaSearchInput.value.toLowerCase().trim();
        const selectedCategory = buscaloyaCategorySelect.value.toLowerCase();
        const selectedLocation = buscaloyaLocationSelect.value.toLowerCase();

        let productsFound = false;
        const allProductItems = document.querySelectorAll('.product-item'); // Obtener todos los artículos del producto

        // Determinar si algún criterio de búsqueda está activo
        const isSearchActive = searchTerm !== '' || selectedCategory !== '' || selectedLocation !== '';

        // Elementos dentro del marketplace que NO son artículos de producto y deben ocultarse/mostrarse
        const marketplaceSection = document.getElementById('content-marketplace');
        const nonProductElements = marketplaceSection ? marketplaceSection.querySelectorAll('[data-non-product-content="true"]') : [];

        if (isSearchActive) {
            // Ocultar todo el contenido no relacionado con productos en Marketplace cuando una búsqueda está activa
            nonProductElements.forEach(el => el.classList.add('hidden'));
            // Asegurarse de que la pestaña de marketplace esté activa para mostrar los resultados
            showContentSection('content-marketplace'); // Usar showContentSection para asegurar que la pestaña esté activa
        } else {
            // No hay búsqueda activa, mostrar todo el contenido no relacionado con productos
            nonProductElements.forEach(el => el.classList.remove('hidden'));
        }

        let firstMatchedProduct = null;

        allProductItems.forEach(productItem => {
            const productCategory = productItem.dataset.category ? productItem.dataset.category.toLowerCase() : '';
            const productLocation = productItem.dataset.location ? productItem.dataset.location.toLowerCase() : '';
            // Combinar título y descripción para una búsqueda más amplia
            const productSearchTermContent = (productItem.querySelector('.font-semibold.mt-1')?.textContent || '').toLowerCase() + ' ' +
                                             (productItem.querySelector('.text-gray-500.text-xs.mt-1')?.textContent || '').toLowerCase();


            const matchesSearch = searchTerm === '' || productSearchTermContent.includes(searchTerm);
            const matchesCategory = selectedCategory === '' || productCategory === selectedCategory;
            const matchesLocation = selectedLocation === '' || productLocation === selectedLocation;

            if (matchesSearch && matchesCategory && matchesLocation) {
                productItem.classList.remove('hidden');
                productsFound = true;
                if (!firstMatchedProduct) {
                    firstMatchedProduct = productItem; // Almacenar el primer producto coincidente
                }
            } else {
                productItem.classList.add('hidden');
            }
        });

        if (productsFound) {
            noSearchResultsMessage.classList.add('hidden');
        } else {
            if (isSearchActive) {
                noSearchResultsMessage.classList.remove('hidden');
            } else {
                noSearchResultsMessage.classList.add('hidden');
            }
        }

        // Mostrar/ocultar el botón de limpiar búsqueda
        if (clearSearchContainer) {
            if (isSearchActive) {
                clearSearchContainer.classList.remove('hidden');
            } else {
                clearSearchContainer.classList.add('hidden');
            }
        }

        // Desplazarse al primer producto encontrado si la búsqueda está activa y se encuentran resultados
        if (isSearchActive && firstMatchedProduct) {
            // Dar un pequeño retraso para permitir que la pestaña complete la transición si cambió
            setTimeout(() => {
                firstMatchedProduct.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100); // Pequeño retraso
        }
    }

    if (buscaloyaSearchButton) buscaloyaSearchButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevenir el envío del formulario
        filterProducts();
    });
    if (buscaloyaSearchInput) buscaloyaSearchInput.addEventListener('input', filterProducts); // Búsqueda en vivo
    if (buscaloyaCategorySelect) buscaloyaCategorySelect.addEventListener('change', filterProducts);
    if (buscaloyaLocationSelect) buscaloyaLocationSelect.addEventListener('change', filterProducts);

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            buscaloyaSearchInput.value = '';
            buscaloyaCategorySelect.value = '';
            buscaloyaLocationSelect.value = '';
            filterProducts(); // Volver a ejecutar el filtro para mostrar todos los productos
            showMessageBox('Búsqueda limpiada. Mostrando todo el contenido.', 'info', true, 2000); // autoHide
        });
    }

    // Filtro inicial al cargar para asegurar una visualización correcta
    filterProducts();

    // Enlaces de Categoría
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Navegando a la categoría...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Botones de Contacto
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = btn.dataset.message || 'Contactando...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Botón Vender Ahora
    const sellNowBtn = document.getElementById('sell-now-btn');
    if (sellNowBtn) {
        sellNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!firebaseInitialized) {
                showMessageBox('Firebase no está activo. No puedes publicar anuncios.', 'error', true); // autoHide
                return;
            }
            showMessageBox('Redirigiendo a la sección para publicar tu anuncio...', 'info', true, 2000); // autoHide
            showContentSection('content-my-account'); // Cambiar a la pestaña Mi Cuenta
            // Lógica adicional para mostrar el formulario de publicación si el usuario ha iniciado sesión
            if (currentUserId) {
                userDashboardSection.classList.add('hidden');
                publishProductSection.classList.remove('hidden');
            } else {
                showMessageBox('Por favor, inicia sesión para publicar un anuncio.', 'info', true); // autoHide
                loginRegisterSection.classList.remove('hidden');
                userDashboardSection.classList.add('hidden');
                publishProductSection.classList.add('hidden');
            }
        });
    }

    // Botones de la Sección de Financiamiento
    document.querySelectorAll('.financing-benefit-card, .financing-tab-button, .financing-card-link, .financing-more-installments-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = e.target.dataset.message || e.currentTarget.dataset.message || 'Explorando opciones de financiamiento...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('#buscaloya-view-all-stores-button, #view-all-financing-stores-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando todas las tiendas aliadas...', 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.product-category-card, .product-category-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = e.target.dataset.message || e.currentTarget.dataset.message || 'Navegando a la categoría de productos...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.app-download-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Iniciando descarga de la app...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Formularios de Newsletter
    document.querySelectorAll('#buscaloya-newsletter-form, #buscaloya-newsletter-form-financiamiento').forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevenir el envío predeterminado del formulario
            const emailInput = form.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                showMessageBox(`¡Gracias por suscribirte con ${emailInput.value}!`, 'success', true); // autoHide
                emailInput.value = ''; // Limpiar la entrada
            } else {
                showMessageBox('Por favor, introduce un correo electrónico válido.', 'error', true); // autoHide
            }
        });
    });

    document.querySelectorAll('.media-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Abriendo enlace en los medios...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    const onlineSystemsLink = document.getElementById('online-systems-link');
    if (onlineSystemsLink) {
        onlineSystemsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando sistemas en línea...', 'info', true, 2000); // autoHide
        });
    }

    // Botones/Enlaces de la Sección Worldcoin
    document.querySelectorAll('#sell-worldcoins-btn, #buy-worldcoin-btn, #contact-us-worldcoin-btn, #start-now-worldcoin-btn, #sell-worldcoins-cta-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = e.target.dataset.message || e.currentTarget.dataset.message || 'Redirigiendo a la acción de Worldcoin...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('#how-it-works-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando cómo funciona Worldcoin...', 'info', true, 2000); // autoHide
            document.getElementById('how-to-buy').scrollIntoView({ behavior: 'smooth' });
        });
    });

    document.querySelectorAll('.payment-logo, .crypto-compatible-item, .country-item, .why-best-item, .testimonial-item, .faq-item, .help-item, .help-button').forEach(item => {
        item.addEventListener('click', (e) => {
            const message = e.currentTarget.dataset.message || 'Información adicional...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Botones de Servicios Prepago
    document.querySelectorAll('#explore-prepaid-services-btn, #view-all-prepaid-services-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const message = e.target.dataset.message || 'Explorando servicios prepago...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    document.querySelectorAll('.popular-service-item, .prepaid-category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const message = e.currentTarget.dataset.message || 'Navegando a servicio/categoría prepago...';
            showMessageBox(message, 'info', true, 2000); // autoHide
        });
    });

    // Funcionalidad del Banner de Cookies
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const viewCookiesBtn = document.getElementById('view-cookies-btn');

    // Comprobar el consentimiento de las cookies al cargar
    if (localStorage.getItem('buscaloya_cookie_consent') === 'true') {
        if (cookieBanner) cookieBanner.classList.add('hidden');
    } else {
        if (cookieBanner) cookieBanner.classList.remove('hidden');
    }

    // Oyente de eventos para aceptar cookies
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('buscaloya_cookie_consent', 'true');
            if (cookieBanner) cookieBanner.classList.add('hidden');
            showMessageBox('¡Gracias por aceptar nuestras cookies!', 'success', true); // autoHide
        });
    }

    // Oyente de eventos para ver más sobre las cookies
    if (viewCookiesBtn) {
        viewCookiesBtn.addEventListener('click', () => {
            showMessageBox('Redirigiendo a la política de cookies para más información.', 'info', true, 2000); // autoHide
            // En una aplicación real, navegarías a una página de política de cookies dedicada
        });
    }
});
