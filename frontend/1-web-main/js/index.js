// =========================================================================
// 1. IMPORT FIREBASE (VERSI MODULAR)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAmwdMuT1QZoXlZHHYePek8RSzhHMxklE4",
    authDomain: "overlander-indonesia.firebaseapp.com",
    projectId: "overlander-indonesia",
    storageBucket: "overlander-indonesia.firebasestorage.app",
    messagingSenderId: "1051273807388",
    appId: "1:1051273807388:web:58ea90eb62f7ef979601d9",
    measurementId: "G-6F07G6X96R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================================
// 2. FETCH DATA DARI FIRESTORE (SINKRONISASI AMAN UNTUK SEMUA HALAMAN)
// =========================================================================
async function fetchWebsiteData() {
    try {
        // --- A. HERO BANNER ---
        const heroSnap = await getDoc(doc(db, "website_content", "hero_section"));
        if (heroSnap.exists()) {
            const data = heroSnap.data();
            const bgEl = document.getElementById('db-hero-bg');
            const titleEl = document.getElementById('db-hero-title');
            const subEl = document.getElementById('db-hero-subtitle');
            const btnEl = document.getElementById('db-hero-btn');
            
            if (data.bgUrl && bgEl) bgEl.src = data.bgUrl;
            if (data.title && titleEl) titleEl.innerText = data.title;
            if (data.subtitle && subEl) subEl.innerText = data.subtitle;
            if (data.buttonText && btnEl) btnEl.innerText = data.buttonText;
        }

        // --- B. ABOUT SECTION ---
        const aboutSnap = await getDoc(doc(db, "website_content", "about_section"));
        if (aboutSnap.exists()) {
            const data = aboutSnap.data();
            const aboutTitleEl = document.getElementById('db-about-title');
            const aboutTextEl = document.getElementById('db-about-text');
            
            if (data.title && aboutTitleEl) aboutTitleEl.innerText = data.title;
            if ((data.p1 || data.p2) && aboutTextEl) {
                aboutTextEl.innerHTML = `<p>${data.p1}</p><p>${data.p2}</p>`;
            }
        }

        // --- C. DESTINATIONS SLIDER ---
        const destSnap = await getDocs(collection(db, "destinations"));
        const track = document.getElementById('fs-destinations-track');
        const dotsContainer = document.getElementById('db-fs-dots');
        if (track && dotsContainer) {
            let slideHTML = ""; let dotsHTML = ""; let count = 0;
            destSnap.forEach(doc => {
                const data = doc.data();
                if (data.status !== "Suspended") {
                    slideHTML += `
                    <div class="fs-slide">
                        <img src="${data.heroBgUrl}" alt="${data.title}">
                        <div class="fs-overlay"></div>
                        <h3 class="fs-title">${data.location} | ${data.title}</h3>
                    </div>`;
                    dotsHTML += `<span class="fs-dot ${count === 0 ? 'active' : ''}" data-index="${count}"></span>`;
                    count++;
                }
            });
            track.innerHTML = slideHTML; dotsContainer.innerHTML = dotsHTML;
            if(typeof initFullscreenSlider === "function") initFullscreenSlider(); 
        }

        // --- C2. DESTINATIONS CATALOG (Khusus Halaman destinations.html) ---
        const destCatalogGrid = document.getElementById('db-dest-catalog-grid');
        if (destCatalogGrid && typeof destSnap !== 'undefined') {
            let catalogHTML = "";
            
            destSnap.forEach(doc => {
                const data = doc.data();
                if (data.status !== "Suspended") {
                    
                    // Membersihkan string untuk dimasukkan ke atribut pencarian (data-*)
                    const tierClean = (data.tier || '').toLowerCase().replace(/\s+/g, '-');
                    const locationClean = (data.location || '').toLowerCase();
                    
                    catalogHTML += `
                    <div class="dest-card reveal" data-tier="${tierClean}" data-location="${locationClean}">
                        <div class="dest-img-holder">
                            <img src="${data.heroBgUrl}" alt="${data.title}">
                            <span class="dest-badge">${data.location || 'Indonesia'}</span>
                        </div>
                        <div class="dest-details">
                            <h3>${data.title}</h3>
                            <p class="dest-meta">${data.tier || 'Signature Tier'} &bull; ${data.duration || 'Flexible'}</p>
                            <p class="dest-summary">${data.overview ? data.overview.substring(0, 150) + '...' : 'Discover an unforgettable journey with Overlander.'}</p>
                            <a href="destination-detail.html?id=${doc.id}" class="btn-discover">Explore Journey <i class="fas fa-arrow-right"></i></a>
                        </div>
                    </div>`;
                }
            });
            
            destCatalogGrid.innerHTML = catalogHTML || '<p style="text-align: center; color: #888; grid-column: 1 / -1;">No expedition routes available at the moment.</p>';
            
            // Panggil fitur Filter dan Animasi setelah kartu selesai dimuat ke HTML
            if (typeof initDestinationsFilter === 'function') initDestinationsFilter();
            if (typeof triggerRevealAnimation === 'function') triggerRevealAnimation();
        }


        // --- C3. DESTINATION DETAIL PAGE (Khusus Halaman destination-detail.html) ---
        const urlParams = new URLSearchParams(window.location.search);
        const destId = urlParams.get('id');
        const detailTitleEl = document.getElementById('db-detail-title');
        
        if (detailTitleEl && destId) {
            const destDocRef = doc(db, "destinations", destId);
            const destDoc = await getDoc(destDocRef);
            
            if (destDoc.exists()) {
                const data = destDoc.data();
                
                // 1. Update Info Dasar
                document.getElementById('db-detail-hero-bg').src = data.heroBgUrl || '';
                document.getElementById('db-detail-location').innerText = data.location || '';
                document.getElementById('db-detail-duration').innerText = data.duration || '';
                detailTitleEl.innerText = data.title || '';
                document.getElementById('db-detail-subtitle').innerHTML = `${data.tier} &bull; ${data.location}`;
                document.getElementById('db-detail-overview').innerText = data.overview || '';
                document.getElementById('db-detail-price').innerText = data.price ? data.price.toLocaleString('id-ID') : '0';
                document.getElementById('db-detail-price-type').innerText = data.priceType || '/ person';
                
                // Set nama Tour ke dalam Form Input WhatsApp
                document.getElementById('book-tour').value = data.title || ''; 

                // 2. Build Daily Itinerary (Accordion)
                if (data.itinerary && data.itinerary.length > 0) {
                    let itinHTML = "";
                    data.itinerary.forEach((day) => {
                        itinHTML += `
                        <div class="accordion-item">
                            <button class="accordion-header">
                                <span>${day.title}</span>
                                <i class="fas fa-plus"></i>
                            </button>
                            <div class="accordion-body">
                                <div class="accordion-content-inner">
                                    ${day.imageUrl ? `<img src="${day.imageUrl}" alt="${day.title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;">` : ''}
                                    <p>${day.desc.replace(/\n/g, '<br>')}</p>
                                </div>
                            </div>
                        </div>`;
                    });
                    document.getElementById('db-detail-itinerary').innerHTML = itinHTML;
                } else {
                    document.getElementById('db-detail-itinerary').innerHTML = '<p>Itinerary tidak tersedia.</p>';
                }

                // 3. Build Essentials & Inclusions List
                let essentialsHTML = "";
                const buildList = (text, icon, title) => {
                    if(!text) return "";
                    let html = `<h3 style="font-family:var(--font-body); font-size:1.1rem; color:var(--text-dark); margin:20px 0 10px; text-transform:uppercase; letter-spacing:1px;">${title}</h3><ul class="highlights-list">`;
                    text.split('\n').forEach(line => {
                        if(line.trim() !== '') html += `<li><i class="fas ${icon}"></i> ${line}</li>`;
                    });
                    html += `</ul>`;
                    return html;
                };
                
                essentialsHTML += buildList(data.included, 'fa-check', 'Included in the Price');
                essentialsHTML += buildList(data.notIncluded, 'fa-times', 'Not Included');
                essentialsHTML += buildList(data.gear, 'fa-box', 'What to Bring');
                essentialsHTML += buildList(data.clothing, 'fa-tshirt', 'Clothing & Wear');
                
                document.getElementById('db-detail-essentials').innerHTML = essentialsHTML;

                // 4. Panggil Fungsi Inisialisasi Accordion setelah HTML dirender
                if (typeof window.initAccordion === 'function') {
                    window.initAccordion();
                }

            } else {
                detailTitleEl.innerText = "Journey Not Found";
                document.getElementById('db-detail-overview').innerText = "Mohon maaf, destinasi yang Anda cari tidak tersedia atau telah dihapus.";
            }
        }
        

        // --- C4. VISUAL STORIES (Sinkronisasi dengan Data EXPERIENCES) ---
        const storyContainer = document.getElementById('db-story-container');
        const storyModals = document.getElementById('db-story-modals');
        
        if (storyContainer && storyModals) {
            // Mengambil data dari koleksi EXPERIENCES (Bukan stories)
            const expStorySnap = await getDocs(collection(db, "experiences"));
            
            if (!expStorySnap.empty) {
                let bannersHTML = "";
                let modalsHTML = "";
                let count = 1;
                
                expStorySnap.forEach(doc => {
                    const data = doc.data();
                    if (data.status !== "Suspended") {
                        const storyId = `story-${doc.id}`;
                        const chapterStr = `Chapter ${count.toString().padStart(2, '0')}`;
                        
                        // Buat Subjudul (Meta) dengan Tagline jika ada
                        const metaText = data.tagline ? `${chapterStr} &bull; ${data.tagline}` : chapterStr;
                        
                        // 1. Render Banner Depan
                        bannersHTML += `
                        <section class="story-banner">
                            <img src="${data.heroBgUrl || 'https://via.placeholder.com/1920x1080?text=No+Image'}" alt="${data.title}" class="story-bg">
                            <div class="story-overlay"></div>
                            <div class="story-content">
                                <span class="story-meta">${metaText}</span>
                                <h2 style="color: #fff;">${data.title}</h2>
                                <button class="btn-read-story" data-story="${storyId}">
                                    <span class="circle"><i class="fas fa-play"></i></span>
                                    <span class="text">DISCOVER THE STORY</span>
                                </button>
                            </div>
                        </section>`;

                        // 2. Render Amenities (Jika di CMS admin diisi fasilitasnya)
                        let amenitiesHTML = "";
                        if (data.amenities && data.amenities.length > 0) {
                            amenitiesHTML += `<div style="margin-top: 50px; padding-top: 40px; border-top: 1px solid #eee;">`;
                            amenitiesHTML += `<h3 style="font-family: var(--font-heading); font-size: 2rem; color: var(--primary-color); margin-bottom: 30px;">The Signature Experiences</h3>`;
                            amenitiesHTML += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">`;
                            
                            data.amenities.forEach(amenity => {
                                amenitiesHTML += `
                                <div style="display: flex; align-items: flex-start; gap: 15px;">
                                    <i class="${amenity.icon || 'fas fa-star'}" style="font-size: 1.5rem; color: var(--vela-orange); margin-top: 3px;"></i>
                                    <div>
                                        <h4 style="font-family: var(--font-body); font-size: 0.95rem; font-weight: 700; color: var(--text-dark); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">${amenity.title}</h4>
                                        <p style="font-size: 0.95rem; color: #555; line-height: 1.6;">${amenity.desc}</p>
                                    </div>
                                </div>`;
                            });
                            
                            amenitiesHTML += `</div></div>`;
                        }

                        // 3. Render Artikel Modal (Foto Full Rasio & Penambahan Amenities)
                        modalsHTML += `
                        <div id="${storyId}" class="story-modal-fullscreen">
                            <div class="story-modal-nav">
                                <span class="story-modal-title">${chapterStr} / ${data.title}</span>
                                <button class="close-story-modal"><i class="fas fa-times"></i></button>
                            </div>
                            
                            <div class="story-modal-body" style="max-width: 1000px; margin: 0 auto; padding-bottom: 80px;">
                                <div class="story-article">
                                    <h1 style="margin-bottom: 35px; text-align: center;">${data.title}</h1>
                                    
                                    <img src="${data.heroBgUrl || ''}" alt="${data.title}" style="width: 100%; height: auto; object-fit: contain; border-radius: 4px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); margin-bottom: 50px;">
                                    
                                    <p class="lead">${data.overview ? data.overview.replace(/\n/g, '<br>') : ''}</p>
                                    <p style="margin-top: 25px; line-height: 1.9;">${data.routes ? data.routes.replace(/\n/g, '<br>') : ''}</p>
                                    
                                    ${amenitiesHTML}
                                </div>
                            </div>
                        </div>`;
                        count++;
                    }
                });

                storyContainer.innerHTML = bannersHTML || '<p style="text-align: center; color: #fff; padding-top: 20vh;">No experiences published yet.</p>';
                storyModals.innerHTML = modalsHTML;

                // WAJIB: Panggil ulang fungsi klik JS setelah merender ulang HTML baru
                if (typeof window.initStoryModals === 'function') window.initStoryModals();
            }
        }
        // --- D. EXPERIENCES GRID ---
        const expGrid = document.getElementById('db-exp-grid');
        if (expGrid) {
            const expSnap = await getDocs(collection(db, "experiences"));
            let expHTML = "";
            expSnap.forEach(doc => {
                const data = doc.data();
                if (data.status !== "Suspended") {
                    expHTML += `
                    <a href="experience-detail.html?id=${doc.id}" class="exp-image-card">
                        <div class="exp-img-wrapper">
                            <img src="${data.heroBgUrl}" alt="${data.title}">
                            <div class="exp-overlay"></div>
                            <h3 class="exp-title">${data.title}</h3>
                        </div>
                    </a>`;
                }
            });
            expGrid.innerHTML = expHTML;
        }

        // --- E. SUSTAINABILITY ---
        const susTitleEl = document.getElementById('db-sus-title');
        const susDescEl = document.getElementById('db-sus-desc');
        if (susTitleEl || susDescEl) {
            const susSnap = await getDoc(doc(db, "website_content", "sustainability_section"));
            if (susSnap.exists()) {
                const data = susSnap.data();
                if(data.title && susTitleEl) susTitleEl.innerText = data.title;
                if(data.desc && susDescEl) susDescEl.innerText = data.desc;
            }
        }

        // --- F. FULL GALLERY MASONRY (Khusus Halaman gallery.html) & PREVIEW (index.html) ---
        const galSnap = await getDocs(collection(db, "gallery"));
        
        // F1. Untuk PREVIEW di Home Index (id: db-gallery-grid)
        const homeGalGrid = document.getElementById('db-gallery-grid');
        if (homeGalGrid && !galSnap.empty) {
            let homeGalHTML = ""; let indexCount = 0;
            galSnap.forEach(doc => {
                const data = doc.data();
                if (data.isActive !== false && indexCount < 5) { 
                    const isLarge = indexCount === 0 ? "gm-large" : "";
                    homeGalHTML += `
                    <a href="gallery.html" class="gm-item ${isLarge}">
                        <img src="${data.url}" alt="${data.title || 'Overlander Gallery'}">
                        <div class="gm-overlay"><span>Discover More</span></div>
                    </a>`;
                    indexCount++;
                }
            });
            homeGalGrid.innerHTML = homeGalHTML;
        }

        // F2. Untuk FULL GALLERY di gallery.html (id: db-luxury-masonry)
        const fullGalGrid = document.getElementById('db-luxury-masonry');
        if (fullGalGrid && !galSnap.empty) {
            let fullGalHTML = "";
            galSnap.forEach(doc => {
                const data = doc.data();
                if (data.isActive !== false) {
                    // Ekstrak kategori untuk keperluan filter (default: overland jika kosong)
                    const itemCategory = data.category ? data.category.toLowerCase() : 'overland';
                    
                    fullGalHTML += `
                    <div class="masonry-item" data-category="${itemCategory}">
                        <img src="${data.url}" alt="${data.title || 'Visual Diary'}">
                        <div class="masonry-overlay">
                            <span>${data.title || 'Overlander Indonesia'}</span>
                        </div>
                    </div>`;
                }
            });
            
            fullGalGrid.innerHTML = fullGalHTML || '<p style="text-align: center; width: 100%;">No visual archives available.</p>';
            
            // Panggil inisialisasi filter setelah gambar masuk
            if (typeof window.initGalleryFilter === 'function') {
                window.initGalleryFilter();
            }
        }

        // --- G. FOOTER & LEGAL MODALS ---
        const footerSnap = await getDoc(doc(db, "website_content", "footer_section"));
        if (footerSnap.exists()) {
            const data = footerSnap.data();
            
            // Pengecekan aman untuk setiap elemen Footer
            const fDesc = document.getElementById('db-footer-desc');
            const fPhone = document.getElementById('db-footer-phone');
            const fEmail = document.getElementById('db-footer-email');
            const fAddress = document.getElementById('db-footer-address');
            
            if(fDesc && data.desc) fDesc.innerText = data.desc;
            if(fPhone && data.phone) fPhone.innerText = data.phone;
            if(fEmail && data.email) fEmail.innerText = data.email;
            if(fAddress && data.address) fAddress.innerText = data.address;
            
            const wa = document.getElementById('db-social-wa');
            const fb = document.getElementById('db-social-fb');
            const ig = document.getElementById('db-social-ig');
            const yt = document.getElementById('db-social-yt');
            
            if(wa && data.whatsapp) wa.href = data.whatsapp;
            if(fb && data.facebook) fb.href = data.facebook;
            if(ig && data.instagram) ig.href = data.instagram;
            if(yt && data.youtube) yt.href = data.youtube;

            const mTerms = document.getElementById('db-modal-terms');
            const mPrivacy = document.getElementById('db-modal-privacy');
            const mCookie = document.getElementById('db-modal-cookie');
            
            if(mTerms && data.terms) mTerms.innerHTML = data.terms;
            if(mPrivacy && data.privacy) mPrivacy.innerHTML = data.privacy;
            if(mCookie && data.cookie) mCookie.innerHTML = data.cookie;
        }

    } catch (error) {
        console.error("Gagal menarik data dari database: ", error);
    }
}
// =========================================================================
// 3. UI LOGIC & EVENTS (Dieksekusi setelah DOM siap)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    
    // Tarik data Firebase pertama kali
    fetchWebsiteData();

    // 3.1 PRELOADER
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
            }, 800);
        });
    }

    // 3.2 NAVBAR SCROLL & WHATSAPP
    const navbar = document.getElementById('navbar');
    const heroSection = document.querySelector('.hero');
    const waButton = document.querySelector('.floating-concierge');

    if (navbar && heroSection) {
        const handleScroll = () => {
            const scrollThreshold = heroSection.offsetHeight - 80;
            if (window.scrollY > scrollThreshold) {
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
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); 
    }

    // 3.3 HAMBURGER MENU
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // 3.4 SCROLL REVEAL (Intersection Observer)
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(reveal => revealObserver.observe(reveal));

    // 3.5 MODAL LEGAL (TERMS, PRIVACY)
    const modalTriggers = document.querySelectorAll('.open-modal');
    const modals = document.querySelectorAll('.legal-modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentModal = btn.closest('.legal-modal');
            currentModal.classList.remove('active');
            document.body.style.overflow = 'auto'; 
        });
    });

    // 3.6 WHATSAPP FORM INQUIRY LOGIC
    const inquiryForm = document.getElementById('wa-inquiry-form');
    if(inquiryForm){
        inquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const adminWaNumber = "6285748175548"; // Ganti dengan nomor Anda
            const name = document.getElementById('inq-name').value;
            const destination = document.getElementById('inq-destination').value;
            const phone = document.getElementById('inq-phone').value;
            const guests = document.getElementById('inq-guests').value;
            const date = document.getElementById('inq-date').value;
            const msg = document.getElementById('inq-message').value;
            
            const waText = `*NEW EXPEDITION INQUIRY*%0A%0AName: ${name}%0APhone: ${phone}%0ADestination: ${destination}%0AGuests: ${guests}%0ADate: ${date}%0AMessage: ${msg}`;
            window.open(`https://wa.me/${adminWaNumber}?text=${waText}`, '_blank');
        });
    }
});

// =========================================================================
// 4. FULLSCREEN SLIDER LOGIC (Hanya Berjalan Setelah Data Ditarik)
// =========================================================================
function initFullscreenSlider() {
    const fsTrack = document.getElementById('fs-destinations-track');
    const fsPrev = document.querySelector('.fs-prev');
    const fsNext = document.querySelector('.fs-next');
    const fsDots = document.querySelectorAll('.fs-dot');

    if (fsTrack && document.querySelectorAll('.fs-slide').length > 0) {
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

        if (fsNext) fsNext.addEventListener('click', () => { nextFsSlide(); resetFsAutoplay(); });
        if (fsPrev) fsPrev.addEventListener('click', () => { prevFsSlide(); resetFsAutoplay(); });

        fsDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentFsIndex = index;
                updateFsSlider(currentFsIndex);
                resetFsAutoplay();
            });
        });

        const startFsAutoplay = () => { fsAutoplay = setInterval(nextFsSlide, 4500); };
        const resetFsAutoplay = () => { clearInterval(fsAutoplay); startFsAutoplay(); };
        startFsAutoplay();
    }
}

// Tambahkan di luar fungsi fetchWebsiteData, misalnya di bagian 3.4
function triggerRevealAnimation() {
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    
    reveals.forEach(reveal => revealObserver.observe(reveal));
}

// =========================================================================
// 5. REATIVE DESTINATION FILTER & SEARCH LOGIC
// =========================================================================
window.initDestinationsFilter = function() {
    const searchInput = document.getElementById('dest-search');
    const regionFilter = document.getElementById('filter-category'); 
    const tierFilter = document.getElementById('filter-price');
    const destCards = document.querySelectorAll('.dest-card');

    if (!searchInput || destCards.length === 0) return;

    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const regionVal = regionFilter ? regionFilter.value.toLowerCase() : 'all';
        const tierVal = tierFilter ? tierFilter.value.toLowerCase() : 'all';

        destCards.forEach(card => {
            // Ambil teks dari dalam kartu
            const title = card.querySelector('h3').textContent.toLowerCase();
            const summary = card.querySelector('.dest-summary').textContent.toLowerCase();
            const badgeLoc = card.querySelector('.dest-badge').textContent.toLowerCase();
            
            // Ambil data atribut
            const cardTier = card.getAttribute('data-tier');
            const cardLoc = card.getAttribute('data-location');

            // 1. Cek Pencarian Teks
            const matchesSearch = title.includes(searchTerm) || summary.includes(searchTerm) || badgeLoc.includes(searchTerm);
            
            // 2. Cek Kesesuaian Wilayah (Region)
            const matchesRegion = regionVal === 'all' || cardLoc.includes(regionVal);
            
            // 3. Cek Kesesuaian Tingkatan (Tier)
            const matchesTier = tierVal === 'all' || cardTier.includes(tierVal);

            // Jika lolos semua filter, tampilkan
            if (matchesSearch && matchesRegion && matchesTier) {
                card.style.display = 'flex';
                setTimeout(() => { card.style.opacity = '1'; }, 50);
            } else {
                // Jika tidak cocok, sembunyikan
                card.style.opacity = '0';
                setTimeout(() => { card.style.display = 'none'; }, 300); // Transisi halus
            }
        });
    };

    // Pasang alat pendengar (event listeners) ke input dan dropdown
    searchInput.addEventListener('input', applyFilters);
    if(regionFilter) regionFilter.addEventListener('change', applyFilters);
    if(tierFilter) tierFilter.addEventListener('change', applyFilters);
};