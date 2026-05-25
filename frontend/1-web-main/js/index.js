document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. PRELOADER LOGIC
    // ==========================================
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 800); // Waktu tunda sebelum hilang agar animasi logo terlihat
        });
    }

    // ==========================================
    // 2. NAVBAR SCROLL & WHATSAPP BUTTON LOGIC
    // ==========================================
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('home') || document.querySelector('.hero') || document.querySelector('.detail-hero');
    const waButton = document.querySelector('.floating-concierge');
    const footerElement = document.querySelector('.footer');

    if (navbar && heroSection) {
        // KUNCI NILAI THRESHOLD DI LUAR EVENT SCROLL
        // Mengambil tinggi awal navbar agar tidak berubah-ubah saat ukuran padding mengecil
        const initialNavbarHeight = navbar.offsetHeight || 80;
        const scrollThreshold = heroSection.offsetHeight - initialNavbarHeight;

        const handleScroll = () => {
            // 1. Logika Sticky Navbar & Memunculkan Tombol WA
            if (window.scrollY > scrollThreshold) {
                // Gunakan pengecekan !contains agar class tidak dipaksa re-add terus menerus
                if (!navbar.classList.contains('fixed-top')) {
                    navbar.classList.add('fixed-top');
                    navbar.classList.remove('navbar-bottom');
                }
                if (waButton) waButton.classList.add('show');
            } else {
                if (navbar.classList.contains('fixed-top')) {
                    navbar.classList.remove('fixed-top');
                    navbar.classList.add('navbar-bottom');
                }
                if (waButton) waButton.classList.remove('show');
            }

            // 2. Logika Tombol WA "Nyantol" Tepat Di Atas Konten Footer
            if (waButton && footerElement) {
                const footerRect = footerElement.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Cek apakah bagian atas footer sudah mulai masuk ke layar monitor
                if (footerRect.top < windowHeight) {
                    const overlap = windowHeight - footerRect.top;
                    // Dorong tombol WA ke atas setinggi footer yang muncul + jarak aman 30px
                    waButton.style.bottom = `${30 + overlap}px`;
                } else {
                    waButton.style.bottom = '30px'; // Kembalikan ke posisi semula jika aman
                }
            }
        };

        // Jalankan event scroll
        window.addEventListener('scroll', handleScroll);
        // Panggil sekali saat dimuat untuk mengecek posisi awal
        handleScroll(); 
        
    } else if (navbar) {
        // FALLBACK LOGIC: Untuk halaman lain seperti Catalog / Gallery yang tidak punya Banner Header Besar
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                if (waButton) waButton.classList.add('show');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Tetap jalankan fungsi nyantol di footer untuk halaman sekunder
            if (waButton && footerElement) {
                const footerRect = footerElement.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (footerRect.top < windowHeight) {
                    const overlap = windowHeight - footerRect.top;
                    waButton.style.bottom = `${30 + overlap}px`;
                } else {
                    waButton.style.bottom = '30px';
                }
            }
        });
    }

    // ==========================================
    // 3. HAMBURGER MENU (MOBILE)
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Tutup menu otomatis jika salah satu link diklik
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ==========================================
    // 4. SCROLL REVEAL ANIMATION (INTERSECTION OBSERVER)
    // ==========================================
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15, // Animasi mulai saat 15% elemen terlihat
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animasi hanya berjalan 1 kali
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // ==========================================
    // 5. FULL-SCREEN DESTINATIONS SLIDER (SAILVELA STYLE)
    // ==========================================
    const fsTrack = document.getElementById('fs-destinations-track');
    const fsPrev = document.querySelector('.fs-prev');
    const fsNext = document.querySelector('.fs-next');
    const fsDots = document.querySelectorAll('.fs-dot');

    if (fsTrack) {
        const totalFsSlides = document.querySelectorAll('.fs-slide').length;
        let currentFsIndex = 0;
        let fsAutoplay;

        const updateFsSlider = (index) => {
            fsTrack.style.transform = `translateX(-${index * 100}%)`;
            fsDots.forEach(dot => dot.classList.remove('active'));
            if(fsDots[index]) fsDots[index].classList.add('active');
        };

        const nextFsSlide = () => {
            currentFsIndex = (currentFsIndex + 1) % totalFsSlides;
            updateFsSlider(currentFsIndex);
        };

        const prevFsSlide = () => {
            currentFsIndex = (currentFsIndex - 1 + totalFsSlides) % totalFsSlides;
            updateFsSlider(currentFsIndex);
        };

        // Event Klik Panah
        if (fsNext) fsNext.addEventListener('click', () => { nextFsSlide(); resetFsAutoplay(); });
        if (fsPrev) fsPrev.addEventListener('click', () => { prevFsSlide(); resetFsAutoplay(); });

        // Event Klik Titik
        fsDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentFsIndex = index;
                updateFsSlider(currentFsIndex);
                resetFsAutoplay();
            });
        });

        // Fitur Autoplay
        const startFsAutoplay = () => { fsAutoplay = setInterval(nextFsSlide, 4500); };
        const resetFsAutoplay = () => { clearInterval(fsAutoplay); startFsAutoplay(); };
        startFsAutoplay(); // Mulai otomatis

        // Fitur Swipe (Untuk HP)
        let startX = 0;
        let endX = 0;
        
        fsTrack.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
            clearInterval(fsAutoplay);
        }, {passive: true});

        fsTrack.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            if (startX - endX > 50) nextFsSlide();
            else if (endX - startX > 50) prevFsSlide();
            startFsAutoplay();
        });
    }

    // ==========================================
    // 6. COOKIE BANNER LOGIC
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookie');
    const declineBtn = document.getElementById('decline-cookie');

    if (cookieBanner) {
        // Cek jika user belum memberikan persetujuan sebelumnya
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 3000); // Muncul setelah 3 detik
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'accepted');
                cookieBanner.classList.remove('show');
            });
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'declined');
                cookieBanner.classList.remove('show');
            });
        }
    }

    // ==========================================
    // INQUIRY FORM: COUNTRY CODES & WHATSAPP LOGIC
    // ==========================================
    const inquiryForm = document.getElementById('wa-inquiry-form');
    const countrySelect = document.getElementById('inq-country-code');
    const phoneInput = document.getElementById('inq-phone');

    if (inquiryForm) {
        
        // 1. Memuat Daftar Kode Negara Sedunia
        const countryCodes = [
            { code: "+62", name: "ID (+62)" },
            { code: "+1", name: "US/CA (+1)" },
            { code: "+44", name: "UK (+44)" },
            { code: "+61", name: "AU (+61)" },
            { code: "+65", name: "SG (+65)" },
            { code: "+60", name: "MY (+60)" },
            { code: "+81", name: "JP (+81)" },
            { code: "+82", name: "KR (+82)" },
            { code: "+86", name: "CN (+86)" },
            { code: "+91", name: "IN (+91)" },
            { code: "+31", name: "NL (+31)" },
            { code: "+33", name: "FR (+33)" },
            { code: "+49", name: "DE (+49)" },
            { code: "+39", name: "IT (+39)" },
            { code: "+34", name: "ES (+34)" },
            { code: "+41", name: "CH (+41)" },
            { code: "+971", name: "AE (+971)" }
            // Anda bisa menambah ratusan kode negara lain di sini jika diperlukan
        ];

        if (countrySelect) {
            countryCodes.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
            // Atur Indonesia (+62) sebagai default yang terpilih
            countrySelect.value = "+62";
        }

        // 2. Mencegah input selain angka & MENGHAPUS angka 0 di awal
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                // Langkah 1: Menghapus semua karakter yang bukan angka (0-9)
                let cleanedValue = this.value.replace(/[^0-9]/g, '');
                
                // Langkah 2: Menghapus angka 0 jika diketik di posisi paling depan
                // (^0+ artinya cari satu atau lebih angka 0 yang berada di awal string)
                cleanedValue = cleanedValue.replace(/^0+/, '');
                
                // Terapkan nilai yang sudah bersih ke dalam kolom input
                this.value = cleanedValue;
            });
        }

        // 3. Logika Submit ke WhatsApp
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah reload halaman
            
            // Mengambil semua nilai dari form
            const name = document.getElementById('inq-name').value;
            const destination = document.getElementById('inq-destination').value;
            const date = document.getElementById('inq-date').value;
            const guests = document.getElementById('inq-guests').value;
            const email = document.getElementById('inq-email').value;
            const cCode = countrySelect.value;
            const phone = phoneInput.value;
            const message = document.getElementById('inq-message').value;
            
            // Gabungkan kode negara dan nomor (Misal: +6281234...)
            const fullWhatsAppNumber = `${cCode}${phone}`;
            
            // Nomor WhatsApp Admin Overlander (Ganti dengan nomor Anda)
            const adminWaNumber = "6285748175548"; 
            
            // Menyusun format pesan rapi
            const waText = `*NEW EXPEDITION INQUIRY*%0A%0AHello Overlander Indonesia, I would like to plan a bespoke journey. Here are my details:%0A%0A👤 *Name:* ${name}%0A✉️ *Email:* ${email}%0A📞 *WhatsApp:* ${fullWhatsAppNumber}%0A📍 *Destination:* ${destination}%0A📅 *Planned Date:* ${date}%0A👥 *Guests:* ${guests}%0A%0A💬 *Message:*%0A${message}`;
            
            // Membuat URL dan membuka tab baru ke WhatsApp
            const waURL = `https://wa.me/${adminWaNumber}?text=${waText}`;
            window.open(waURL, '_blank');
        });
    }

    // ==========================================
    // LEGAL MODALS (TERMS, PRIVACY, COOKIE)
    // ==========================================
    const modalTriggers = document.querySelectorAll('.open-modal');
    const modals = document.querySelectorAll('.legal-modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Membuka Modal
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Mencegah layar kembali ke paling atas
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Mengunci scroll halaman utama
            }
        });
    });

    // Menutup Modal dengan tombol X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentModal = btn.closest('.legal-modal');
            currentModal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Mengembalikan fungsi scroll
        });
    });

    // Menutup Modal jika user mengklik area gelap (luar kotak putih)
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });


    // ==========================================
    // RECTIVE DESTINATIONS FILTER & SEARCH LOGIC
    // ==========================================
    const searchInput = document.getElementById('dest-search');
    const categoryFilter = document.getElementById('filter-category');
    const priceFilter = document.getElementById('filter-price');
    const destCards = document.querySelectorAll('.dest-card');

    if (searchInput && categoryFilter && priceFilter) {
        const filterDestinations = () => {
            const searchValue = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;
            const selectedPrice = priceFilter.value;

            destCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const summary = card.querySelector('.dest-summary').textContent.toLowerCase();
                const cardCategory = card.getAttribute('data-category');
                const cardPrice = card.getAttribute('data-price');

                // Cek kesesuaian kata kunci search
                const matchesSearch = title.includes(searchValue) || summary.includes(searchValue);
                // Cek kesesuaian dropdown kategori
                const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
                // Cek kesesuaian dropdown harga
                const matchesPrice = selectedPrice === 'all' || cardPrice === selectedPrice;

                // Jika semua filter terpenuhi, tampilkan kartu dengan mulus
                if (matchesSearch && matchesCategory && matchesPrice) {
                    card.style.display = 'flex';
                    setTimeout(() => { card.style.opacity = '1'; }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.display = 'none';
                }
            });
        };

        // Pasang event listener ke seluruh widget filter
        searchInput.addEventListener('input', filterDestinations);
        categoryFilter.addEventListener('change', filterDestinations);
        priceFilter.addEventListener('change', filterDestinations);
    }
});

