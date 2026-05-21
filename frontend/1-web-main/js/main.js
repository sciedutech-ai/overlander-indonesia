document.addEventListener("DOMContentLoaded", () => {
    
    // --- GLOBAL SETUP: LANGUAGE & CURRENCY ---
    const exchangeRates = {
        'EUR': { rate: 1, symbol: '€' },
        'USD': { rate: 1.08, symbol: '$' }, // Contoh kurs statis
        'GBP': { rate: 0.85, symbol: '£' }
    };

    let currentCurrency = localStorage.getItem('overlander_currency') || 'EUR';
    let currentLang = localStorage.getItem('overlander_lang') || 'EN';

    const currencyBtn = document.getElementById('currency-btn');
    const langBtn = document.getElementById('lang-btn');

    // Fungsi Update Teks Dropdown Utama
    const updateDropdownUI = () => {
        if(currencyBtn) currencyBtn.innerHTML = `${currentCurrency} (${exchangeRates[currentCurrency].symbol}) <i class="fas fa-angle-down"></i>`;
        if(langBtn) langBtn.innerHTML = `<i class="fas fa-globe"></i> ${currentLang} <i class="fas fa-angle-down"></i>`;
    };
    updateDropdownUI();

    // Fungsi Konversi Harga Global
    window.formatPrice = (priceEur) => {
        const converted = Math.round(priceEur * exchangeRates[currentCurrency].rate);
        return `${exchangeRates[currentCurrency].symbol}${converted}`;
    };

    // Event Listener Klik Mata Uang
    document.querySelectorAll('.currency-selector').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentCurrency = e.target.dataset.currency;
            localStorage.setItem('overlander_currency', currentCurrency);
            location.reload(); // Muat ulang halaman agar semua harga ter-update
        });
    });

    // Event Listener Klik Bahasa
    document.querySelectorAll('.lang-selector').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentLang = e.target.dataset.lang;
            localStorage.setItem('overlander_lang', currentLang);
            updateDropdownUI();
            alert(`Language switched to ${currentLang}. Full translation system will be integrated in the Backend Phase.`);
        });
    });


    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            // MENCEGAH BUG: Jika navbar punya class 'navbar-solid' (di halaman katalog), jangan ubah apa-apa
            if(navbar.classList.contains('navbar-solid')) return;

            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 1.5. Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Menambah/menghapus class 'active' untuk trigger animasi CSS
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Opsional: Mengubah background navbar jadi solid saat menu terbuka (walau di posisi atas)
            if (navLinks.classList.contains('active')) {
                navbar.classList.add('scrolled');
            } else if (window.scrollY <= 50) {
                // Kembalikan transparan jika menu ditutup dan posisi scroll masih di atas
                navbar.classList.remove('scrolled');
            }
        });

        // Menutup menu secara otomatis jika klien mengklik salah satu link menu
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); 

    // 3. Preloader Logic (Hanya jalan jika ada preloader)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 1500); 
        });
    }

    // 4. GDPR Cookie Consent Logic (Hanya jalan jika ada cookie banner)
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookie');
    const declineBtn = document.getElementById('decline-cookie');
    
    if (cookieBanner && acceptBtn && declineBtn) {
        setTimeout(() => {
            if (!localStorage.getItem('cookieConsent')) {
                cookieBanner.classList.add('show');
            }
        }, 3000); 

        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
        });

        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }

    // 5. Testimonial Slider Logic (Hanya jalan jika ada slider di halaman)
    const track = document.getElementById('testimonial-track');
    const dots = document.querySelectorAll('.slider-dots .dot');
    
    if (track && dots.length > 0) {
        let currentSlide = 0;
        const totalSlides = dots.length;
        let sliderInterval;

        const moveToSlide = (slideIndex) => {
            track.style.transform = `translateX(-${slideIndex * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            dots[slideIndex].classList.add('active');
            currentSlide = slideIndex;
        };

        const autoPlaySlide = () => {
            let nextSlide = (currentSlide + 1) % totalSlides;
            moveToSlide(nextSlide);
        };

        sliderInterval = setInterval(autoPlaySlide, 5000);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(sliderInterval); 
                moveToSlide(index);
                sliderInterval = setInterval(autoPlaySlide, 5000); 
            });
        });
    }

    // 6. Fetch Data JSON & Logika Filter Real-Time (E-commerce Style)
    const catalogGrid = document.getElementById('dynamic-catalog-grid');
    if (catalogGrid) {
        let allPackages = []; 
        const searchInput = document.getElementById('search-input'); // Ambil elemen search
        const priceSlider = document.getElementById('price-slider');
        const priceValue = document.getElementById('price-value');
        const checkboxes = document.querySelectorAll('.filter-list-inline input[type="checkbox"]');

        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                allPackages = data; 
                renderCatalog(allPackages); 
            })
            .catch(error => console.error('Error fetching catalog data:', error));
            
        function renderCatalog(packages) {
            catalogGrid.innerHTML = ''; 
            
            if(packages.length === 0) {
                catalogGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                        <h3 style="color: #555;">No journeys found</h3>
                        <p style="color: #888;">Try adjusting your search or filters.</p>
                    </div>`;
                return;
            }

            packages.forEach(pkg => {
                const card = document.createElement('div');
                card.classList.add('dynamic-card');
                
                card.innerHTML = `
                    <img src="${pkg.image}" alt="${pkg.title}">
                    <div class="dynamic-info">
                        <h3>${pkg.title}</h3>
                        <div class="dynamic-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${pkg.location}</span>
                            <span><i class="far fa-clock"></i> ${pkg.duration}</span>
                        </div>
                        <div class="dynamic-price">${window.formatPrice(pkg.price_eur)} <span style="font-size:0.8rem; color:#888;">/ person</span></div>
                        <a href="detail.html?id=${pkg.id}" class="btn-detail">View Details</a>
                    </div>
                `;
                catalogGrid.appendChild(card);
            });
        }

        function applyFilters() {
            const searchQuery = searchInput.value.toLowerCase(); // Ambil teks pencarian
            const maxPrice = parseInt(priceSlider.value);
            const checkedCategories = Array.from(checkboxes)
                                           .filter(box => box.checked)
                                           .map(box => box.value);
            
            const filteredData = allPackages.filter(pkg => {
                // Cek teks pencarian pada judul atau lokasi
                const matchSearch = pkg.title.toLowerCase().includes(searchQuery) || 
                                    pkg.location.toLowerCase().includes(searchQuery);
                const matchPrice = pkg.price_eur <= maxPrice;
                const matchCategory = checkedCategories.length === 0 || checkedCategories.includes(pkg.category);
                
                // Harus cocok dengan search, harga, dan kategori
                return matchSearch && matchPrice && matchCategory;
            });
            
            renderCatalog(filteredData);
        }

        // Event Listeners
        if(searchInput) searchInput.addEventListener('input', applyFilters); // Aktif saat diketik
        
        if(priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                priceValue.textContent = e.target.value; 
                applyFilters(); 
            });
        }

        checkboxes.forEach(box => {
            box.addEventListener('change', applyFilters);
        });
    }

    // 7. Inner Card Image Slider (Autoplay & Swipeable)
    const sliderCards = document.querySelectorAll('.catalog-card.has-slider');

    sliderCards.forEach(card => {
        const track = card.querySelector('.card-slider-track');
        const prevBtn = card.querySelector('.prev-btn');
        const nextBtn = card.querySelector('.next-btn');
        const dots = card.querySelectorAll('.c-dot');
        const images = track.querySelectorAll('img');
        
        let currentIndex = 0;
        const totalImages = images.length;
        let autoplayInterval;

        // Fungsi untuk menggeser gambar
        const updateSlider = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach(dot => dot.classList.remove('active'));
            if(dots[index]) dots[index].classList.add('active');
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalImages;
            updateSlider(currentIndex);
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + totalImages) % totalImages;
            updateSlider(currentIndex);
        };

        // --- Fitur Autoplay ---
        const startAutoplay = () => {
            // Gambar berganti otomatis setiap 3,5 detik
            autoplayInterval = setInterval(nextSlide, 3500);
        };

        const stopAutoplay = () => {
            clearInterval(autoplayInterval);
        };

        // Mulai autoplay saat pertama kali dimuat
        startAutoplay();

        // Hentikan autoplay saat mouse berada di atas kartu (hover) agar klien bisa melihat gambar, lanjut saat mouse pergi
        card.addEventListener('mouseenter', stopAutoplay);
        card.addEventListener('mouseleave', startAutoplay);

        // --- Event Klik Panah & Titik ---
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            nextSlide();
        });

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            prevSlide();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                currentIndex = index;
                updateSlider(currentIndex);
            });
        });

        // --- Fitur Swipe (Layar Sentuh Mobile) ---
        let startX = 0;
        let endX = 0;

        // Saat jari menyentuh layar
        track.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            stopAutoplay(); // Hentikan autoplay saat jari menempel
        }, {passive: true});

        // Saat jari dilepas dari layar
        track.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoplay(); // Lanjutkan autoplay
        });

        // Logika mendeteksi arah geseran
        const handleSwipe = () => {
            const threshold = 40; // Jarak minimal geseran (px) agar dihitung sebagai swipe
            if (startX - endX > threshold) {
                // Jari menggeser ke kiri (Next)
                nextSlide();
            } else if (endX - startX > threshold) {
                // Jari menggeser ke kanan (Prev)
                prevSlide();
            }
        };
    });

    // 8. Accordion Itinerary (Detail Page)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                
                // Opsional: Tutup accordion yang lain saat satu dibuka
                // document.querySelectorAll('.accordion-item').forEach(otherItem => {
                //     if(otherItem !== item) otherItem.classList.remove('active');
                // });

                // Toggle class active pada accordion yang diklik
                item.classList.toggle('active');
            });
        });
    }

    // 9. Fetch Data Detail Page Dinamis
    const detailHeroImg = document.getElementById('detail-hero-img');
    
    if (detailHeroImg) { // Memastikan ini hanya jalan di detail.html
        // Ambil ID dari parameter URL (misal: ?id=pkg-01)
        const urlParams = new URLSearchParams(window.location.search);
        
        // PENTING: Fallback! Jika dibuka langsung tanpa klik dari katalog, otomatis tampilkan 'pkg-01'
        const packageId = urlParams.get('id') || 'pkg-01'; 

        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                // Cari paket yang ID-nya cocok
                const pkg = data.find(item => item.id === packageId);
                
                if (pkg) {
                    // 1. Render Hero & Meta Info
                    detailHeroImg.src = pkg.image;
                    document.getElementById('detail-title').innerHTML = `${pkg.title} <br><span style="font-size: 1.5rem; font-style: italic; color: var(--accent-color);">${pkg.subtitle}</span>`;
                    document.getElementById('detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${pkg.location}`;
                    document.getElementById('detail-duration').innerHTML = `<i class="far fa-clock"></i> ${pkg.duration}`;
                    document.getElementById('detail-overview').textContent = pkg.overview;
                    document.getElementById('detail-price').innerHTML = `${window.formatPrice(pkg.price_eur)} <span class="per-person">/ person</span>`;
                    document.getElementById('form-tour-name').value = pkg.title;

                    // 2. Render Itinerary Accordion
                    const accordionContainer = document.getElementById('itinerary-accordion');
                    accordionContainer.innerHTML = ''; // Kosongkan data awal HTML

                    pkg.itinerary.forEach((day, index) => {
                        const accItem = document.createElement('div');
                        accItem.classList.add('accordion-item');
                        
                        // Buka hari pertama secara default
                        if(index === 0) accItem.classList.add('active');

                        accItem.innerHTML = `
                            <button class="accordion-header">
                                <span>${day.day}: ${day.title}</span>
                                <i class="fas fa-plus"></i>
                            </button>
                            <div class="accordion-body">
                                <img src="${day.image}" alt="${day.day}">
                                <p>${day.description}</p>
                            </div>
                        `;
                        accordionContainer.appendChild(accItem);
                    });

                    // 3. Render Inclusions, Exclusions & What to Bring
                    const mainContent = document.querySelector('.detail-main-content');
                    
                    // Cek agar tidak duplikat jika script dijalankan ulang
                    if(!document.getElementById('facilities-block')) {
                        const facilityHTML = `
                            <div class="detail-block" id="facilities-block">
                                <h2>What's Included</h2>
                                <ul class="facility-list include">
                                    ${pkg.inclusions.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                                </ul>
                                <h2 style="margin-top: 40px;">Not Included</h2>
                                <ul class="facility-list exclude">
                                    ${pkg.exclusions.map(item => `<li><i class="fas fa-times"></i> ${item}</li>`).join('')}
                                </ul>
                                <h2 style="margin-top: 40px;">What to Bring (Gear & Wear)</h2>
                                <ul class="facility-list include">
                                    ${pkg.what_to_bring.map(item => `<li><i class="fas fa-camera"></i> ${item}</li>`).join('')}
                                </ul>
                            </div>
                        `;
                        mainContent.insertAdjacentHTML('beforeend', facilityHTML);
                    }

                    // 4. Inisialisasi ulang fungsi klik Accordion karena elemen baru saja dibuat
                    const newHeaders = document.querySelectorAll('.accordion-header');
                    newHeaders.forEach(header => {
                        header.addEventListener('click', () => {
                            header.parentElement.classList.toggle('active');
                        });
                    });
                }
            })
            .catch(error => console.error('Error fetching package details:', error));
    }

    // 10. Booking Form Logic & WhatsApp Redirect (Detail Page)
    const bookingFormElement = document.getElementById('booking-form');
    const bookingModal = document.getElementById('booking-modal');
    const closeModalBtn = document.getElementById('close-modal');

    if (bookingFormElement && bookingModal) {
        bookingFormElement.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            // Ambil semua data dari form
            const tourName = document.getElementById('form-tour-name').value;
            const dateInput = document.getElementById('form-date').value;
            const guestInput = document.getElementById('form-guests').value;
            const clientName = document.getElementById('form-name').value;
            const nationality = document.getElementById('form-nationality').value;
            const email = document.getElementById('form-email').value;
            const message = document.getElementById('form-message').value;
            
            // Tampilkan Modal Sukses
            bookingModal.classList.add('active');

            // Format Pesan WhatsApp yang sangat rapi dan profesional
            const waNumber = "6285748175548"; // Ganti dengan Nomor Overlander
            
            const waMessage = `*NEW BOOKING INQUIRY*%0A%0AHello Overlander Indonesia, I would like to request a bespoke journey. Here are my details:%0A%0A*--- TOUR DETAILS ---*%0A📌 *Tour:* ${tourName}%0A📅 *Date:* ${dateInput}%0A👥 *Guests:* ${guestInput} Person(s)%0A%0A*--- CLIENT DETAILS ---*%0A👤 *Name:* ${clientName}%0A🌍 *Nationality:* ${nationality}%0A✉️ *Email:* ${email}%0A%0A*--- MESSAGE ---*%0A💬 "${message}"%0A%0A_✅ I confirm that I have read and agreed to the Terms & Conditions._`;
            
            const waURL = `https://wa.me/${waNumber}?text=${waMessage}`;

            // Saat tombol di pop-up diklik, buka WA & tutup modal
            closeModalBtn.onclick = () => {
                bookingModal.classList.remove('active');
                window.open(waURL, '_blank');
            };
        });
    }

    // 11. Gallery Masonry & Filter Logic (Gallery Page)
    const masonryGrid = document.getElementById('masonry-grid');
    const filterPills = document.querySelectorAll('.filter-pill');

    if (masonryGrid) {
        // Data Dummy Foto Galeri (Campuran Potret & Lanskap)
        const galleryData = [
            { id: 1, src: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "java", title: "Mount Bromo Sunrise" },
            { id: 2, src: "https://images.unsplash.com/photo-1559628233-eb1b1a45564b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "papua", title: "Raja Ampat Islands" },
            { id: 3, src: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "komodo", title: "Padar Island" },
            { id: 4, src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "bali", title: "Ubud Water Temple" },
            { id: 5, src: "https://images.unsplash.com/photo-1604999333679-b86d54738315?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "java", title: "Tumpak Sewu Waterfall" },
            { id: 6, src: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "bali", title: "Lempuyang Gates" },
            { id: 7, src: "https://images.unsplash.com/photo-1501179691527-711696568b20?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "java", title: "Ijen Blue Fire Crater" },
            { id: 8, src: "https://images.unsplash.com/photo-1596404768340-410c550dfb6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "java", title: "Borobudur Temple" },
            { id: 9, src: "https://images.unsplash.com/photo-1582662121703-a178971f11e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", location: "bali", title: "Nusa Penida Coast" }
        ];

        // Fungsi Render Galeri
        const renderGallery = () => {
            masonryGrid.innerHTML = ''; // Kosongkan
            galleryData.forEach(item => {
                const imgCard = document.createElement('div');
                imgCard.classList.add('masonry-item');
                imgCard.setAttribute('data-loc', item.location);
                
                imgCard.innerHTML = `
                    <img src="${item.src}" alt="${item.title}" loading="lazy">
                    <div class="masonry-overlay">
                        <h3>${item.title}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${item.location.toUpperCase()}</p>
                    </div>
                `;
                masonryGrid.appendChild(imgCard);
            });
        };

        // Render pertama kali (tampilkan semua)
        renderGallery();

        // Logika Filter
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                // Hapus class active dari semua tombol, lalu tambahkan ke yang diklik
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filterValue = pill.getAttribute('data-filter');
                const allItems = document.querySelectorAll('.masonry-item');

                // Sembunyikan atau tampilkan gambar berdasarkan filter
                allItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-loc') === filterValue) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }
});