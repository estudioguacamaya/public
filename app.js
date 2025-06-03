document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const loaderOverlay = document.getElementById('loader-overlay');
    const messageBox = document.getElementById('message-box');
    const messageBoxOverlay = document.getElementById('message-box-overlay');
    const messageBoxText = document.getElementById('message-box-text');
    const messageBoxCloseButton = document.getElementById('message-box-close');

    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');

    // Select all main tab buttons (desktop and mobile) using the common class
    const mainTabButtons = document.querySelectorAll('.tab-main-button');
    const contentSections = document.querySelectorAll('.content-section');

    const buscaloyaTabButtons = document.querySelectorAll('.buscaloya-tab-button');
    const buscaloyaTabContents = document.querySelectorAll('.buscaloya-tab-content');

    const thumbnailImages = document.querySelectorAll('.thumbnail-image');

    // Generic carousel buttons for scrollBy carousels
    const genericCarouselPrevBtns = document.querySelectorAll('.carousel-prev-btn');
    const genericCarouselNextBtns = document.querySelectorAll('.carousel-next-btn');

    // --- Global Utility Functions ---

    /**
     * Displays a custom message box with a given message.
     * @param {string} message - The message to display.
     */
    window.showMessageBox = (message) => {
        messageBoxText.textContent = message;
        messageBox.classList.add('show');
        messageBoxOverlay.classList.add('show');
        // Ensure overlay can capture clicks when visible
        if (messageBoxOverlay) {
            messageBoxOverlay.style.pointerEvents = 'auto';
        }
    };

    // Close message box event listener
    if (messageBoxCloseButton) {
        messageBoxCloseButton.addEventListener('click', () => {
            messageBox.classList.remove('show');
            messageBoxOverlay.classList.remove('show');
            // Prevent overlay from blocking clicks when hidden
            if (messageBoxOverlay) {
                messageBoxOverlay.style.pointerEvents = 'none';
            }
        });
    }

    /**
     * Shows the loader overlay.
     */
    function showLoader() {
        if (loaderOverlay) {
            loaderOverlay.classList.remove('hidden');
            loaderOverlay.style.opacity = '1';
            loaderOverlay.style.pointerEvents = 'auto'; // Allow interaction with loader (if any, typically none)
        }
    }

    /**
     * Hides the loader overlay.
     */
    function hideLoader() {
        if (loaderOverlay) {
            loaderOverlay.style.opacity = '0';
            loaderOverlay.style.pointerEvents = 'none'; // Prevent clicks during fade-out and when hidden
            loaderOverlay.addEventListener('transitionend', () => {
                loaderOverlay.classList.add('hidden');
            }, { once: true });
        }
    }

    // Simulate page load with loader
    showLoader();
    setTimeout(() => {
        hideLoader();
    }, 1000); // Hide loader after 1 second

    // Initialize message box overlay to be non-blocking by default
    if (messageBoxOverlay) {
        messageBoxOverlay.style.pointerEvents = 'none';
    }


    // --- Tab Switching Logic ---

    /**
     * Shows a specific content section and hides others.
     * Also updates the active state of main navigation buttons.
     * @param {string} targetId - The ID of the content section to show (e.g., 'content-marketplace').
     */
    function showTab(targetId) {
        // Hide all content sections
        contentSections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active', 'fade-in');
        });

        // Show the target section and apply fade-in
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active', 'fade-in');
        }

        // Update active state for main navigation buttons (desktop and mobile)
        mainTabButtons.forEach(button => {
            // Determine the content ID based on the button's ID
            let buttonContentId;
            if (button.id.startsWith('tab-')) {
                buttonContentId = 'content-' + button.id.replace('tab-', '');
            } else if (button.id.startsWith('mobile-main-nav-')) {
                buttonContentId = 'content-' + button.id.replace('mobile-main-nav-', '');
            }

            if (buttonContentId === targetId) {
                button.classList.remove('bg-white', 'text-gray-800', 'hover:bg-gray-200');
                button.classList.add('bg-yellow-600', 'text-white', 'hover:bg-yellow-700');
            } else {
                button.classList.remove('bg-yellow-600', 'text-white', 'hover:bg-yellow-700');
                button.classList.add('bg-white', 'text-gray-800', 'hover:bg-gray-200');
            }
        });

        // Close mobile menu if open
        if (mobileMenu && mobileMenu.classList.contains('slide-down-menu')) {
            mobileMenu.classList.remove('slide-down-menu');
            mobileMenu.classList.add('slide-up-menu');
            mobileMenu.addEventListener('animationend', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('slide-up-menu');
            }, { once: true });
            mobileMenuIcon.classList.remove('fa-times'); // Change back to hamburger icon
            mobileMenuIcon.classList.add('fa-bars');
        }
    }

    // Add click listeners to main tab buttons
    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            let targetTab;
            if (button.id.startsWith('tab-')) {
                targetTab = 'content-' + button.id.replace('tab-', '');
            } else if (button.id.startsWith('mobile-main-nav-')) {
                targetTab = 'content-' + button.id.replace('mobile-main-nav-', '');
            }
            if (targetTab) {
                showTab(targetTab);
            }
        });
    });

    // Initialize the marketplace tab to be active by default
    showTab('content-marketplace');

    // --- Mobile Menu Toggle Logic ---
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileMenu.classList.contains('hidden') || mobileMenu.classList.contains('slide-up-menu')) {
                mobileMenu.classList.remove('hidden', 'slide-up-menu');
                mobileMenu.classList.add('slide-down-menu');
                mobileMenuIcon.classList.remove('fa-bars');
                mobileMenuIcon.classList.add('fa-times'); // Change to close icon
            } else {
                mobileMenu.classList.remove('slide-down-menu');
                mobileMenu.classList.add('slide-up-menu');
                mobileMenu.addEventListener('animationend', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('slide-up-menu');
                }, { once: true });
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars'); // Change back to hamburger icon
            }
        });

        if (closeMobileMenuButton) {
            closeMobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.remove('slide-down-menu');
                mobileMenu.classList.add('slide-up-menu');
                mobileMenu.addEventListener('animationend', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('slide-up-menu');
                }, { once: true });
                mobileMenuIcon.classList.remove('fa-times');
                mobileMenuIcon.classList.add('fa-bars'); // Change back to hamburger icon
            });
        }
    }

    // --- Financing Sub-Tabs Logic (BuscaLoYa) ---
    buscaloyaTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all sub-tab buttons and hide content
            buscaloyaTabButtons.forEach(btn => {
                btn.classList.remove('bg-gray-900', 'text-white', 'shadow-md');
                btn.classList.add('text-gray-400', 'border', 'border-gray-300');
            });
            buscaloyaTabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('slide-in-right');
            });

            // Activate the clicked button
            button.classList.remove('text-gray-400', 'border', 'border-gray-300');
            button.classList.add('bg-gray-900', 'text-white', 'shadow-md');

            // Show the corresponding content
            const targetTab = button.dataset.tab;
            const targetContent = document.getElementById(`buscaloya-tab-content-${targetTab}`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
                targetContent.classList.add('slide-in-right');
            }
        });
    });

    // Initialize the financing sub-tabs to show 'Principal' by default
    const initialFinancingTab = document.querySelector('.buscaloya-tab-button[data-tab="principal"]');
    if (initialFinancingTab) {
        initialFinancingTab.click();
    }

    // --- Thumbnail Image Switching Logic ---
    thumbnailImages.forEach(thumbnail => {
        thumbnail.addEventListener('mouseover', (event) => {
            const mainImage = event.target.closest('article').querySelector('.main-category-image');
            if (mainImage) {
                mainImage.src = event.target.dataset.mainImage;
                // Optional: Add a subtle animation to the main image
                mainImage.style.opacity = '0';
                setTimeout(() => {
                    mainImage.style.opacity = '1';
                }, 50);
            }
        });
    });

    // --- Carousel Navigation Logic (for overflow-x-auto carousels like Marketplace and Products in Financiamiento) ---
    genericCarouselPrevBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetId = event.currentTarget.dataset.target;
            const carousel = document.getElementById(targetId);
            if (carousel) {
                // Get the first item within the carousel's direct flex container to calculate scroll amount
                const innerFlexContainer = carousel.querySelector('.flex.space-x-4');
                const firstItem = innerFlexContainer ? innerFlexContainer.querySelector('.flex-shrink-0') : null;

                if (!firstItem) {
                    console.warn(`No items found in carousel with ID: ${targetId}`);
                    return; // No items to scroll
                }

                const itemWidth = firstItem.offsetWidth;
                const itemStyle = window.getComputedStyle(firstItem);
                const itemMarginRight = parseFloat(itemStyle.marginRight);

                const scrollAmount = itemWidth + itemMarginRight;

                carousel.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            }
        });
    });

    genericCarouselNextBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetId = event.currentTarget.dataset.target;
            const carousel = document.getElementById(targetId);
            if (carousel) {
                // Get the first item within the carousel's direct flex container to calculate scroll amount
                const innerFlexContainer = carousel.querySelector('.flex.space-x-4');
                const firstItem = innerFlexContainer ? innerFlexContainer.querySelector('.flex-shrink-0') : null;

                if (!firstItem) {
                    console.warn(`No items found in carousel with ID: ${targetId}`);
                    return; // No items to scroll
                }

                const itemWidth = firstItem.offsetWidth;
                const itemStyle = window.getComputedStyle(firstItem);
                const itemMarginRight = parseFloat(itemStyle.marginRight);

                const scrollAmount = itemWidth + itemMarginRight;

                carousel.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Club BuscaLoYa Carousel (Auto-play and Manual Navigation - specific translateX logic) ---
    // Get the main carousel element and proceed only if it exists
    const clubBuscaloyaCarouselElement = document.getElementById('club-buscaloya-carousel');

    if (clubBuscaloyaCarouselElement) {
        let currentClubBuscaLoYaSlideIndex = 0;
        const clubBuscaloyaCarouselTrack = clubBuscaloyaCarouselElement.querySelector('#carousel-track');
        const clubBuscaloyaSlides = clubBuscaloyaCarouselTrack ? Array.from(clubBuscaloyaCarouselTrack.children) : [];
        const totalClubBuscaloyaSlides = clubBuscaloyaSlides.length;
        const clubBuscaloyaDotsContainer = clubBuscaloyaCarouselElement.querySelector('#buscaloya-carousel-dots');
        const clubBuscaloyaDots = clubBuscaloyaDotsContainer ? Array.from(clubBuscaloyaDotsContainer.children) : [];

        /**
         * Updates the carousel display to show a specific slide using translateX.
         * @param {number} index - The index of the slide to show.
         */
        function updateClubBuscaloyaCarousel(index) {
            // Ensure track and slides exist before attempting to update
            if (!clubBuscaloyaCarouselTrack || totalClubBuscaloyaSlides === 0) {
                console.warn('Carousel track or slides not found for update.');
                return;
            }

            currentClubBuscaLoYaSlideIndex = (index + totalClubBuscaloyaSlides) % totalClubBuscaloyaSlides; // Ensure index wraps around
            // Calculate offset based on the width of the carousel container, as each slide is w-full
            const offset = -currentClubBuscaLoYaSlideIndex * clubBuscaloyaCarouselTrack.offsetWidth;
            clubBuscaloyaCarouselTrack.style.transform = `translateX(${offset}px)`; // Use px for consistency

            // Update dots only if the container exists
            if (clubBuscaloyaDotsContainer) {
                clubBuscaloyaDots.forEach((dot, i) => {
                    if (i === currentClubBuscaLoYaSlideIndex) {
                        dot.classList.remove('bg-gray-600');
                        dot.classList.add('bg-white');
                    } else {
                        dot.classList.remove('bg-white');
                        dot.classList.add('bg-gray-600');
                    }
                });
            }
        }

        // Auto-play functionality for Club BuscaLoYa carousel
        let autoSlideInterval;
        function startAutoSlide() {
            stopAutoSlide(); // Clear any existing interval
            autoSlideInterval = setInterval(() => {
                updateClubBuscaloyaCarousel(currentClubBuscaLoYaSlideIndex + 1);
            }, 5000); // Change slide every 5 seconds
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // Manual navigation for Club BuscaLoYa carousel (using its specific buttons)
        document.querySelectorAll('.buscaloya-carousel-prev-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                stopAutoSlide();
                updateClubBuscaloyaCarousel(currentClubBuscaLoYaSlideIndex - 1);
                startAutoSlide(); // Restart auto-play after manual interaction
            });
        });

        document.querySelectorAll('.buscaloya-carousel-next-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                stopAutoSlide();
                updateClubBuscaloyaCarousel(currentClubBuscaLoYaSlideIndex + 1);
                startAutoSlide(); // Restart auto-play after manual interaction
            });
        });

        // Dots navigation for Club BuscaLoYa carousel
        if (clubBuscaloyaDotsContainer) {
            clubBuscaloyaDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    stopAutoSlide();
                    updateClubBuscaloyaCarousel(index);
                    startAutoSlide(); // Restart auto-play
                });
            });
        }

        // Initialize and start auto-play if club carousel exists and has more than one slide
        if (clubBuscaloyaCarouselTrack && totalClubBuscaloyaSlides > 1) {
            // Add a resize listener to update carousel on window resize
            window.addEventListener('resize', () => {
                updateClubBuscaloyaCarousel(currentClubBuscaLoYaSlideIndex); // Re-calculate offset on resize
            });
            updateClubBuscaloyaCarousel(0); // Show first slide
            startAutoSlide(); // Start auto-play
        }
    } else {
        console.warn('Club BuscaLoYa carousel element not found. Skipping carousel initialization.');
    }


    // --- Favorite Button Toggle ---
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', () => {
            const icon = button.querySelector('i');
            if (icon) { // Ensure the icon exists
                if (icon.classList.contains('far')) { // If it's the outlined heart
                    icon.classList.remove('far');
                    icon.classList.add('fas', 'text-red-600'); // Change to solid and red
                    showMessageBox('¡Anuncio añadido a favoritos!');
                } else { // If it's the solid heart
                    icon.classList.remove('fas', 'text-red-600');
                    icon.classList.add('far'); // Change back to outlined
                    showMessageBox('Anuncio eliminado de favoritos.');
                }
            }
        });
    });

    // --- Contact Button (inside product cards) ---
    document.querySelectorAll('.contact-btn').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.dataset.message || 'Contactando...';
            showMessageBox(message);
        });
    });

    // --- More Options Button (inside product cards) ---
    document.querySelectorAll('.more-options-btn').forEach(button => {
        button.addEventListener('click', () => {
            showMessageBox('Mostrando más opciones para este anuncio...');
        });
    });

    // --- Main Search and Filter Logic ---
    const searchInput = document.getElementById('buscaloya-search-input');
    const categorySelect = document.getElementById('buscaloya-category-select');
    const locationSelect = document.getElementById('buscaloya-location-select');
    const searchButton = document.getElementById('buscaloya-search-button');
    const clearSearchButton = document.getElementById('clear-search-btn'); // New: Clear search button

    // Get all product items that can be filtered across all relevant sections
    const allProductItems = document.querySelectorAll('.product-item');
    const marketplaceSection = document.getElementById('content-marketplace');
    // Elements within marketplace that are NOT product items and should be hidden during search
    const nonProductElements = marketplaceSection ? marketplaceSection.querySelectorAll('[data-non-product-content="true"]') : [];
    const noResultsMessage = document.getElementById('no-search-results-message'); // Message for no search results

    function filterProducts() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = categorySelect ? categorySelect.value.toLowerCase() : '';
        const selectedLocation = locationSelect ? locationSelect.value.toLowerCase() : '';

        let resultsFound = false;
        let firstMatchedProduct = null;

        // Determine if any search criteria is active
        const isSearchActive = searchTerm !== '' || selectedCategory !== '' || selectedLocation !== '';

        if (isSearchActive) {
            // Hide all non-product content in Marketplace when a search is active
            nonProductElements.forEach(el => el.classList.add('hidden'));
            // Ensure marketplace tab is active to show results
            showTab('content-marketplace');
        } else {
            // No search active, show all non-product content
            nonProductElements.forEach(el => el.classList.remove('hidden'));
        }

        allProductItems.forEach(item => {
            const itemSearchTerm = item.dataset.searchTerm ? item.dataset.searchTerm.toLowerCase() : '';
            const itemCategory = item.dataset.category ? item.dataset.category.toLowerCase() : '';
            const itemLocation = item.dataset.location ? item.dataset.location.toLowerCase() : '';

            const matchesSearch = searchTerm === '' || itemSearchTerm.includes(searchTerm);
            const matchesCategory = selectedCategory === '' || itemCategory === selectedCategory;
            const matchesLocation = selectedLocation === '' || itemLocation === selectedLocation;

            if (matchesSearch && matchesCategory && matchesLocation) {
                item.classList.remove('hidden');
                item.classList.add('fade-in'); // Optional: re-add fade-in animation
                resultsFound = true;
                if (!firstMatchedProduct) {
                    firstMatchedProduct = item; // Store the first matching product
                }
            } else {
                item.classList.add('hidden');
                item.classList.remove('fade-in');
            }
        });

        // Manage no results message
        if (noResultsMessage) {
            if (resultsFound) {
                noResultsMessage.classList.add('hidden');
            } else {
                if (isSearchActive) { // Only show message if a search was attempted and found nothing
                    noResultsMessage.classList.remove('hidden');
                } else {
                    noResultsMessage.classList.add('hidden'); // Hide if no search is active
                }
            }
        }

        // Manage clear search button visibility
        if (clearSearchButton) {
            if (isSearchActive) {
                clearSearchButton.classList.remove('hidden');
            } else {
                clearSearchButton.classList.add('hidden');
            }
        }

        // Scroll to the first found product if search is active and results are found
        if (isSearchActive && firstMatchedProduct) {
            firstMatchedProduct.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close any open message box after scrolling to the product
            messageBox.classList.remove('show');
            messageBoxOverlay.classList.remove('show');
            if (messageBoxOverlay) {
                messageBoxOverlay.style.pointerEvents = 'none';
            }
        }
    }

    // Attach event listeners for filtering
    if (searchButton) searchButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent form submission
        filterProducts();
        // Removed: showMessageBox('Realizando búsqueda...'); - visual feedback is now scrolling/filtering
    });
    if (searchInput) searchInput.addEventListener('input', filterProducts); // Live search
    if (categorySelect) categorySelect.addEventListener('change', filterProducts);
    if (locationSelect) locationSelect.addEventListener('change', filterProducts);

    // New: Event listener for clearing the search
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categorySelect) categorySelect.value = '';
            if (locationSelect) locationSelect.value = '';
            filterProducts(); // Re-run filter to show all products and non-product content
            showMessageBox('Búsqueda limpiada. Mostrando todo el contenido.');
        });
    }

    // --- Newsletter Signup Form (Marketplace) ---
    const buscaloyaNewsletterForm = document.getElementById('buscaloya-newsletter-form');
    if (buscaloyaNewsletterForm) {
        buscaloyaNewsletterForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            const emailInput = buscaloyaNewsletterForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (email) {
                showMessageBox(`¡Gracias por suscribirte con ${email} a las noticias de BuscaLoYa!`);
                if (emailInput) emailInput.value = ''; // Clear the input field
            } else {
                showMessageBox('Por favor, introduce un correo electrónico válido para suscribirte.');
            }
        });
    }

    // --- Newsletter Signup Form (Financing) ---
    const buscaloyaNewsletterFormFinanciamiento = document.getElementById('buscaloya-newsletter-form-financiamiento');
    if (buscaloyaNewsletterFormFinanciamiento) {
        buscaloyaNewsletterFormFinanciamiento.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = buscaloyaNewsletterFormFinanciamiento.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (email) {
                showMessageBox(`¡Gracias por suscribirte con ${email} a las noticias de Financiamiento BuscaLoYa!`);
                if (emailInput) emailInput.value = ''; // Clear the input field
            } else {
                showMessageBox('Por favor, introduce un correo electrónico válido para suscribirte.');
            }
        });
    }

    // --- Global Utility: Scroll to Top Button ---
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll to top
            });
        });
    }

    // --- Cookie banner functionality ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
    const viewCookiesBtn = document.getElementById('view-cookies-btn');

    // Check if cookie consent has been given
    const hasAcceptedCookies = localStorage.getItem('buscaloya_cookie_consent');
    if (hasAcceptedCookies === 'true') {
        if (cookieBanner) cookieBanner.classList.add('hidden');
    } else {
        if (cookieBanner) cookieBanner.classList.remove('hidden');
    }

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('buscaloya_cookie_consent', 'true');
            if (cookieBanner) cookieBanner.classList.add('hidden');
            // Eliminado: showMessageBox('¡Gracias por aceptar nuestras cookies!');
            // La eliminación del banner ya es suficiente confirmación.
            // Si se desea una notificación, debería ser un "toast" no bloqueante.
        });
    }

    if (viewCookiesBtn) {
        viewCookiesBtn.addEventListener('click', () => {
            showMessageBox('Redirigiendo a la página de políticas de cookies...');
        });
    }

    // FAQ accordion functionality (applied to Worldcoin section)
    const faqItems = document.querySelectorAll('#content-worldcoin .faq-item');
    faqItems.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                // Close other open FAQ items in the Worldcoin section
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });

    // --- Centralized Event Listeners for various links/buttons (previously inline onclick) ---
    // Top Banner Promo Link
    const promoLink = document.getElementById('promo-link');
    if (promoLink) {
        promoLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Redirigiendo a promociones...');
        });
    }

    // Logo Home Link
    const logoHomeLink = document.getElementById('logo-home-link');
    if (logoHomeLink) {
        logoHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Volviendo al inicio de BuscaLoYa...');
        });
    }

    // Desktop Publish Ad Button
    const publishAdDesktopBtn = document.getElementById('publish-ad-desktop-btn');
    if (publishAdDesktopBtn) {
        publishAdDesktopBtn.addEventListener('click', () => {
            showMessageBox('¡Preparando tu anuncio para publicar!');
        });
    }

    // Desktop My Account Button
    const myAccountDesktopBtn = document.getElementById('my-account-desktop-btn');
    if (myAccountDesktopBtn) {
        myAccountDesktopBtn.addEventListener('click', () => {
            showMessageBox('Accediendo a tu cuenta...');
        });
    }

    // Mobile Navigation Links
    const mobileHomeLink = document.getElementById('mobile-home-link');
    if (mobileHomeLink) {
        mobileHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTab('content-marketplace');
            showMessageBox('Navegando a Inicio...');
        });
    }

    const mobileBuscaloyaLink = document.getElementById('mobile-buscaloya-link');
    if (mobileBuscaloyaLink) {
        mobileBuscaloyaLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTab('content-marketplace');
            showMessageBox('Navegando a BuscaLoYa...');
        });
    }

    const mobileSellLink = document.getElementById('mobile-sell-link');
    if (mobileSellLink) {
        mobileSellLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Preparando para vender...');
        });
    }

    const mobileHelpLink = document.getElementById('mobile-help-link');
    if (mobileHelpLink) {
        mobileHelpLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando centro de ayuda...');
        });
    }

    const mobilePublishAdBtn = document.getElementById('mobile-publish-ad-btn');
    if (mobilePublishAdBtn) {
        mobilePublishAdBtn.addEventListener('click', () => {
            showMessageBox('¡Preparando tu anuncio para publicar!');
        });
    }

    const mobileMyAccountBtn = document.getElementById('mobile-my-account-btn');
    if (mobileMyAccountBtn) {
        mobileMyAccountBtn.addEventListener('click', () => {
            showMessageBox('Accediendo a tu cuenta...');
        });
    }

    // Marketplace Section Buttons/Links
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Redirigiendo a la sección de compras...');
        });
    }

    const publishFreeBtn = document.getElementById('publish-free-btn');
    if (publishFreeBtn) {
        publishFreeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Iniciando proceso para publicar gratis...');
        });
    }

    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Navegando a categoría...';
            showMessageBox(message);
        });
    });

    const sellNowBtn = document.getElementById('sell-now-btn');
    if (sellNowBtn) {
        sellNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Iniciando proceso para publicar tu anuncio...');
        });
    }

    // Financing Section Buttons/Links
    const buscaloyaViewAllStoresButton = document.getElementById('buscaloya-view-all-stores-button');
    if (buscaloyaViewAllStoresButton) {
        buscaloyaViewAllStoresButton.addEventListener('click', () => {
            showMessageBox('Cargando todas las tiendas aliadas...');
        });
    }

    document.querySelectorAll('.product-category-card').forEach(card => {
        card.addEventListener('click', () => {
            const message = card.dataset.message || 'Navegando a productos...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.product-category-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Ver todos los productos...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.financing-tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.dataset.message || 'Explorando opciones de pago...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.financing-benefit-card').forEach(card => {
        card.addEventListener('click', () => {
            const message = card.dataset.message || 'Información de beneficio de financiamiento.';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.financing-card-link').forEach(card => {
        card.addEventListener('click', () => {
            const message = card.dataset.message || 'Explorando línea de crédito...';
            showMessageBox(message);
        });
    });

    const financingMoreInstallmentsBtn = document.querySelector('.financing-more-installments-btn');
    if (financingMoreInstallmentsBtn) {
        financingMoreInstallmentsBtn.addEventListener('click', () => {
            showMessageBox('Explorando más cuotas...');
        });
    }

    document.querySelectorAll('.brand-logo-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Abriendo enlace de marca...';
            showMessageBox(message);
        });
    });

    const viewAllFinancingStoresBtn = document.getElementById('view-all-financing-stores-btn');
    if (viewAllFinancingStoresBtn) {
        viewAllFinancingStoresBtn.addEventListener('click', () => {
            showMessageBox('Cargando todas las tiendas aliadas...');
        });
    }

    document.querySelectorAll('.app-download-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Descargando la app...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.media-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Abriendo enlace de medios...';
            showMessageBox(message);
        });
    });

    const onlineSystemsLink = document.getElementById('online-systems-link');
    if (onlineSystemsLink) {
        onlineSystemsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Navegando a sistemas en línea...');
        });
    }

    // Worldcoin Section Buttons/Links
    const sellWorldcoinsBtn = document.getElementById('sell-worldcoins-btn');
    if (sellWorldcoinsBtn) {
        sellWorldcoinsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Redirigiendo a la venta de Worldcoin...');
        });
    }

    const howItWorksLink = document.getElementById('how-it-works-link');
    if (howItWorksLink) {
        howItWorksLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Explorando Worldcoin...');
        });
    }

    const buyWorldcoinBtn = document.getElementById('buy-worldcoin-btn');
    if (buyWorldcoinBtn) {
        buyWorldcoinBtn.addEventListener('click', () => {
            showMessageBox('Redirigiendo a la compra de Worldcoin...');
        });
    }

    document.querySelectorAll('.payment-logo').forEach(logo => {
        logo.addEventListener('click', () => {
            const altText = logo.alt || 'Logo de pago';
            showMessageBox(`Clic en ${altText}`);
        });
    });

    const contactUsWorldcoinBtn = document.getElementById('contact-us-worldcoin-btn');
    if (contactUsWorldcoinBtn) {
        contactUsWorldcoinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Contactando a Rapicambios X Fastwldtradex...');
        });
    }

    document.querySelectorAll('.worldcoin-how-to-buy-card').forEach(card => {
        card.addEventListener('click', () => {
            const message = card.dataset.message || 'Paso de compra de Worldcoin.';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.crypto-compatible-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Criptomoneda compatible.';
            showMessageBox(`Información de ${message}`);
        });
    });

    document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'País disponible.';
            showMessageBox(`Información de envío a ${message}`);
        });
    });

    const viewAllCountriesBtn = document.getElementById('view-all-countries-btn');
    if (viewAllCountriesBtn) {
        viewAllCountriesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Cargando todos los países...');
        });
    }

    document.querySelectorAll('.why-best-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Beneficio.';
            showMessageBox(`Detalle de ${message}`);
        });
    });

    const startNowWorldcoinBtn = document.getElementById('start-now-worldcoin-btn');
    if (startNowWorldcoinBtn) {
        startNowWorldcoinBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('¡Comenzando tu comercio de Worldcoins ahora!');
        });
    }

    document.querySelectorAll('.testimonial-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Testimonio.';
            showMessageBox(`Leyendo ${message}`);
        });
    });

    document.querySelectorAll('.help-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Ayuda.';
            showMessageBox(`Accediendo a ${message}`);
        });
    });

    document.querySelectorAll('.help-button').forEach(button => {
        button.addEventListener('click', () => {
            const message = button.dataset.message || 'Redirigiendo a ayuda.';
            showMessageBox(message);
        });
    });

    const sellWorldcoinsCtaBtn = document.getElementById('sell-worldcoins-cta-btn');
    if (sellWorldcoinsCtaBtn) {
        sellWorldcoinsCtaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('¡Preparando para vender Worldcoins!');
        });
    }

    // Prepaid Services Section Buttons/Links
    const explorePrepaidServicesBtn = document.getElementById('explore-prepaid-services-btn');
    if (explorePrepaidServicesBtn) {
        explorePrepaidServicesBtn.addEventListener('click', () => {
            showMessageBox('¡Explora nuestros servicios prepago!');
        });
    }

    document.querySelectorAll('.popular-service-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Servicio popular.';
            showMessageBox(`Información sobre ${message}`);
        });
    });

    document.querySelectorAll('.prepaid-category-item').forEach(item => {
        item.addEventListener('click', () => {
            const message = item.dataset.message || 'Categoría de prepago.';
            showMessageBox(message);
        });
    });

    const viewAllPrepaidServicesBtn = document.getElementById('view-all-prepaid-services-btn');
    if (viewAllPrepaidServicesBtn) {
        viewAllPrepaidServicesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Explorando todos los servicios prepago...');
        });
    }

    // Footer Links
    const footerHomeLink = document.getElementById('footer-home-link');
    if (footerHomeLink) {
        footerHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMessageBox('Volviendo al inicio...');
        });
    }

    document.querySelectorAll('.social-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Abriendo red social...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.footer-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Navegando...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.footer-support-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Cargando soporte...';
            showMessageBox(message);
        });
    });

    document.querySelectorAll('.footer-legal-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const message = link.dataset.message || 'Cargando información legal...';
            showMessageBox(message);
        });
    });

    // Chat Support Button
    const chatSupportBtn = document.getElementById('chat-support-btn');
    if (chatSupportBtn) {
        chatSupportBtn.addEventListener('click', () => {
            showMessageBox('Iniciando chat de soporte...');
        });
    }
});
