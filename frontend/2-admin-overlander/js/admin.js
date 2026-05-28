// =========================================================================
// 1. IMPORT FIREBASE (HANYA SATU BLOK DI PALING ATAS)
// =========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Lanjutkan dengan kode konfigurasi firebaseConfig, inisialisasi, dsb...

// ==========================================
// KONFIGURASI FIREBASE & CLOUDINARY
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAmwdMuT1QZoXlZHHYePek8RSzhHMxklE4",
    authDomain: "overlander-indonesia.firebaseapp.com",
    projectId: "overlander-indonesia",
    storageBucket: "overlander-indonesia.firebasestorage.app",
    messagingSenderId: "1051273807388",
    appId: "1:1051273807388:web:58ea90eb62f7ef979601d9",
    measurementId: "G-6F07G6X96R"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Konfigurasi Cloudinary
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dtzuichae/image/upload";
const CLOUDINARY_PRESET = "eneles.id"; 

// ==========================================
// 1. OTENTIKASI ADMIN (LOGIN/LOGOUT)
// ==========================================
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');

// Listener Status Login
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'flex';
        document.getElementById('admin-user-email').innerText = user.email;
        
        // Load data awal saat berhasil masuk
        loadHeroData(); 
        loadAboutData();
        listenToDestinations(); // Muat tabel destinasi secara real-time
        listenToExperiences(); // Muat tabel experience secara real-time
        loadSustainabilityData(); // Muat data sustainability
        listenToGallery(); // Muat galeri foto secara real-time
        loadFooterData(); // Muat data footer
    } else {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }
});

// Eksekusi Login
document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            document.getElementById('login-error').innerText = "Otorisasi Gagal: Periksa Email/Password.";
            console.error(error);
        });
});

// Eksekusi Logout
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth);
});

// ==========================================
// 2. NAVIGASI SIDEBAR DASHBOARD
// ==========================================
const menuLinks = document.querySelectorAll('.sidebar-menu a');
const panels = document.querySelectorAll('.admin-panel');

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Hapus status aktif dari semua menu dan panel
        menuLinks.forEach(l => l.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        // Aktifkan menu dan panel yang diklik
        link.classList.add('active');
        const target = link.getAttribute('data-target');
        const targetPanel = document.getElementById(target);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// ==========================================
// 3. FUNGSI UPLOAD CLOUDINARY GLOBAL
// ==========================================
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        return data.secure_url; // Kembalikan URL gambar
    } catch (error) {
        alert("Gagal mengunggah gambar ke server.");
        console.error(error);
        return null;
    }
}

// ==========================================
// 4. CRUD: HERO BANNER SECTION
// ==========================================
// Upload Gambar Hero
document.getElementById('hero-bg-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(file) {
        document.getElementById('hero-bg-preview').style.backgroundImage = `url('https://via.placeholder.com/400x200?text=Uploading...')`; 
        const url = await uploadToCloudinary(file);
        if(url) {
            document.getElementById('hero-bg-url').value = url;
            document.getElementById('hero-bg-preview').style.backgroundImage = `url('${url}')`;
        }
    }
});

// Baca Data Hero
async function loadHeroData() {
    const docRef = doc(db, "website_content", "hero_section");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('hero-title').value = data.title || "";
        document.getElementById('hero-subtitle').value = data.subtitle || "";
        document.getElementById('hero-btn-text').value = data.buttonText || "";
        
        if(data.bgUrl) {
            document.getElementById('hero-bg-url').value = data.bgUrl;
            document.getElementById('hero-bg-preview').style.backgroundImage = `url('${data.bgUrl}')`;
        }
    }
}

// Simpan Data Hero
window.saveHeroData = async () => {
    try {
        await setDoc(doc(db, "website_content", "hero_section"), {
            title: document.getElementById('hero-title').value,
            subtitle: document.getElementById('hero-subtitle').value,
            buttonText: document.getElementById('hero-btn-text').value,
            bgUrl: document.getElementById('hero-bg-url').value
        });
        alert("Hero Banner berhasil diperbarui!");
    } catch (e) {
        console.error("Error saving document: ", e);
    }
};

// ==========================================
// 5. CRUD: ABOUT SECTION
// ==========================================
// Baca Data About
async function loadAboutData() {
    const docRef = doc(db, "website_content", "about_section");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('about-title').value = data.title || "";
        document.getElementById('about-p1').value = data.p1 || "";
        document.getElementById('about-p2').value = data.p2 || "";
    }
}

// Simpan Data About
window.saveAboutData = async () => {
    try {
        await setDoc(doc(db, "website_content", "about_section"), {
            title: document.getElementById('about-title').value,
            p1: document.getElementById('about-p1').value,
            p2: document.getElementById('about-p2').value
        });
        alert("About Section berhasil diperbarui!");
    } catch (e) {
        console.error("Error: ", e);
    }
};

// ==========================================
// 6. CRUD & LOGIC: DESTINATIONS SECTION
// ==========================================
const destTableView = document.getElementById('dest-table-view');
const destFormView = document.getElementById('dest-form-view');

// 6A. Kontrol Visibilitas Form Destinasi
window.openCreateDestination = () => {
    // Kosongkan form untuk pembuatan baru
    document.getElementById('edit-dest-id').value = "";
    document.getElementById('dest-title').value = "";
    document.getElementById('dest-location').value = "";
    document.getElementById('dest-duration').value = "";
    document.getElementById('dest-tier').value = "";
    document.getElementById('dest-price').value = "";
    document.getElementById('dest-price-type').value = "/ person";
    document.getElementById('dest-hero-url').value = "";
    document.getElementById('dest-hero-preview').style.backgroundImage = "none";
    document.getElementById('dest-overview').value = "";
    document.getElementById('itinerary-builder-container').innerHTML = ""; 
    
    
    document.getElementById('dest-included').value = "";
    document.getElementById('dest-not-included').value = "";
    document.getElementById('dest-gear').value = "";
    document.getElementById('dest-clothing').value = "";

    window.addItineraryDay(); 
    document.getElementById('form-view-title').innerText = "Draft New Destination";
    if(destTableView) destTableView.style.display = "none";
    if(destFormView) destFormView.style.display = "block";

};

window.closeDestinationForm = () => {
    if(destFormView) destFormView.style.display = "none";
    if(destTableView) destTableView.style.display = "block";
};

// 6B. Event Listener Upload Gambar Utama Destinasi
document.getElementById('dest-hero-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(file) {
        document.getElementById('dest-hero-preview').style.backgroundImage = `url('https://via.placeholder.com/400x200?text=Uploading...')`;
        const url = await uploadToCloudinary(file);
        if(url) {
            document.getElementById('dest-hero-url').value = url;
            document.getElementById('dest-hero-preview').style.backgroundImage = `url('${url}')`;
        }
    }
});

// 6C. Baca & Sinkronisasi Tabel Destinasi (Real-time)
function listenToDestinations() {
    const colRef = collection(db, "destinations");
    onSnapshot(colRef, (snapshot) => {
        const tableBody = document.getElementById('destinations-list-table');
        if(!tableBody) return; // Cegah error jika elemen belum dirender
        
        tableBody.innerHTML = ""; 
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const status = data.status || "Active";
            
            const rowHTML = `
                <tr>
                    <td><img src="${data.heroBgUrl || 'https://via.placeholder.com/80'}" alt="Cover" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td>
                        <strong>${data.title}</strong><br>
                        <span style="font-size:0.8rem; color:#718096;"><i class="fas fa-map-marker-alt"></i> ${data.location} (${data.duration || ''})</span>
                    </td>
                    <td style="text-transform:uppercase; font-size:0.8rem;">${data.tier || '-'}</td>
                    <td>€${data.price} <span style="font-size:0.8rem; color:#718096;">${data.priceType || ''}</span></td>
                    <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-action edit" onclick="editDestination('${id}')" title="Edit Content"><i class="fas fa-edit"></i></button>
                            <button class="btn-action suspend" onclick="toggleSuspendDestination('${id}', '${status}')" title="${status === 'Active' ? 'Suspend' : 'Activate'}"><i class="fas fa-ban"></i></button>
                            <button class="btn-action suspend" style="color:#cbd5e0;" onclick="deleteDestination('${id}')" title="Delete Permanent"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', rowHTML);
        });
    });
}

// 6D. Edit Destinasi (Tarik Data ke Form)
window.editDestination = async (id) => {
    const docRef = doc(db, "destinations", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Isi Form Dasar
        document.getElementById('edit-dest-id').value = id;
        document.getElementById('dest-title').value = data.title || "";
        document.getElementById('dest-location').value = data.location || "";
        document.getElementById('dest-duration').value = data.duration || "";
        document.getElementById('dest-tier').value = data.tier || "";
        document.getElementById('dest-price').value = data.price || "";
        document.getElementById('dest-price-type').value = data.priceType || "/ person";
        document.getElementById('dest-hero-url').value = data.heroBgUrl || "";
        document.getElementById('dest-hero-preview').style.backgroundImage = `url('${data.heroBgUrl || ''}')`;
        document.getElementById('dest-overview').value = data.overview || "";
        
        document.getElementById('dest-included').value = data.included || "";
        document.getElementById('dest-not-included').value = data.notIncluded || "";
        document.getElementById('dest-gear').value = data.gear || "";
        document.getElementById('dest-clothing').value = data.clothing || "";

        // Susun Ulang Itinerary Hari
        const container = document.getElementById('itinerary-builder-container');
        container.innerHTML = "";
        
        if (data.itinerary && data.itinerary.length > 0) {
            data.itinerary.forEach((day) => {
                const dayBox = document.createElement('div');
                dayBox.className = 'itinerary-day-box';
                dayBox.style.cssText = 'background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-bottom: 20px; border-radius: 5px; position: relative;';
                dayBox.innerHTML = `
                    <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i> Remove</button>
                    <div class="form-group">
                        <label>Day Title</label>
                        <input type="text" class="itin-title" value="${day.title || ''}">
                    </div>
                    <div class="form-group">
                        <label>Activity Description</label>
                        <textarea class="itin-desc" rows="3">${day.desc || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Highlight Image for this Day</label>
                        <input type="file" class="itin-image-upload" accept="image/*" onchange="uploadItinImage(this)">
                        <input type="hidden" class="itin-image-url" value="${day.imageUrl || ''}">
                        <span class="upload-status" style="font-size: 0.8rem; color: green; margin-top: 5px; display: block;">${day.imageUrl ? '✓ Existing Image Loaded' : ''}</span>
                    </div>
                `;
                container.appendChild(dayBox);
            });
        } else {
            window.addItineraryDay();
        }
        
        document.getElementById('form-view-title').innerText = "Modify Destination Details";
        if(destTableView) destTableView.style.display = "none";
        if(destFormView) destFormView.style.display = "block";
    }
};

// 6E. Simpan atau Update Destinasi
window.saveDestinationData = async () => {
    const id = document.getElementById('edit-dest-id').value;
    
    const title = document.getElementById('dest-title').value;
    const locationName = document.getElementById('dest-location').value;
    const duration = document.getElementById('dest-duration').value;
    const tier = document.getElementById('dest-tier').value;
    const price = document.getElementById('dest-price').value;
    const priceType = document.getElementById('dest-price-type').value;
    const heroBgUrl = document.getElementById('dest-hero-url').value;
    const overview = document.getElementById('dest-overview').value;
    
    const included = document.getElementById('dest-included').value;
    const notIncluded = document.getElementById('dest-not-included').value;
    const gear = document.getElementById('dest-gear').value;
    const clothing = document.getElementById('dest-clothing').value;
    
    // PERBAIKAN: Hanya mengambil kotak itinerary yang benar-benar ada di dalam form Destinasi
    const itineraryData = [];
    const dayBoxes = document.querySelectorAll('#itinerary-builder-container .itinerary-day-box');
    
    dayBoxes.forEach((box) => {
        // Pengecekan aman untuk memastikan elemen input benar-benar ada
        const titleInput = box.querySelector('.itin-title');
        const descInput = box.querySelector('.itin-desc');
        const imageInput = box.querySelector('.itin-image-url');

        if(titleInput && descInput && imageInput) {
            itineraryData.push({
                title: titleInput.value,
                desc: descInput.value,
                imageUrl: imageInput.value
            });
        }
    });

    const finalPayload = {
        title: title,
        location: locationName,
        duration: duration,
        tier: tier,
        price: parseInt(price) || 0,
        priceType: priceType,
        heroBgUrl: heroBgUrl,
        overview: overview,
        itinerary: itineraryData,
        status: "Active",
        included: included,
        notIncluded: notIncluded,
        gear: gear,
        clothing: clothing,
        status: "Active"
    };

    try {
        if (id) {
            await updateDoc(doc(db, "destinations", id), finalPayload);
            alert("Journey data successfully updated!");
        } else {
            await addDoc(collection(db, "destinations"), finalPayload);
            alert("New Journey successfully published!");
        }
        window.closeDestinationForm();
    } catch (e) {
        console.error("Save failed: ", e);
        alert("Gagal menyimpan destinasi.");
    }
};

// 6F. Ganti Status (Suspend/Active)
window.toggleSuspendDestination = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    if (confirm(`Are you sure you want to change status to ${nextStatus}?`)) {
        await updateDoc(doc(db, "destinations", id), { status: nextStatus });
    }
};

// 6G. Hapus Permanen
window.deleteDestination = async (id) => {
    if (confirm("This action cannot be undone. Delete this destination permanently from directories?")) {
        await deleteDoc(doc(db, "destinations", id));
    }
};

// ==========================================
// 7. ITINERARY DYNAMIC BUILDER LOGIC
// ==========================================
// Tambah Baris Hari
window.addItineraryDay = () => {
    const container = document.getElementById('itinerary-builder-container');
    if(!container) return;

    const dayBox = document.createElement('div');
    dayBox.className = 'itinerary-day-box';
    dayBox.style.cssText = 'background: #f9f9f9; padding: 20px; border: 1px solid #eee; margin-bottom: 20px; border-radius: 5px; position: relative;';
    
    dayBox.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i> Remove</button>
        <div class="form-group">
            <label>Day Title</label>
            <input type="text" class="itin-title" placeholder="e.g. Day 02 / Padar Island">
        </div>
        <div class="form-group">
            <label>Activity Description</label>
            <textarea class="itin-desc" rows="3" placeholder="Describe the day's activities..."></textarea>
        </div>
        <div class="form-group">
            <label>Highlight Image for this Day</label>
            <input type="file" class="itin-image-upload" accept="image/*" onchange="uploadItinImage(this)">
            <input type="hidden" class="itin-image-url">
            <span class="upload-status" style="font-size: 0.8rem; color: var(--accent); margin-top: 5px; display: block;"></span>
        </div>
    `;
    container.appendChild(dayBox);
};

// Upload Gambar per-Hari
window.uploadItinImage = async (inputElement) => {
    const file = inputElement.files[0];
    const statusText = inputElement.parentElement.querySelector('.upload-status');
    const urlInput = inputElement.parentElement.querySelector('.itin-image-url');
    
    if(file) {
        statusText.innerText = "Mengunggah gambar ke server...";
        statusText.style.color = "#df6e4b"; // Warna orange/terracotta
        const url = await uploadToCloudinary(file); 
        if(url) {
            urlInput.value = url;
            statusText.innerText = "✓ Gambar berhasil diunggah!";
            statusText.style.color = "green";
        } else {
            statusText.innerText = "✗ Gagal mengunggah gambar.";
            statusText.style.color = "red";
        }
    }
};

// ==========================================
// 8. CRUD & LOGIC: EXPERIENCES SECTION
// ==========================================


const expTableView = document.getElementById('exp-table-view');
const expFormView = document.getElementById('exp-form-view');

// 8A. Kontrol Visibilitas Form Experience
window.openCreateExperience = () => {
    document.getElementById('edit-exp-id').value = "";
    document.getElementById('exp-title').value = "";
    document.getElementById('exp-tagline').value = "";
    document.getElementById('exp-subtext').value = "";
    document.getElementById('exp-hero-url').value = "";
    document.getElementById('exp-hero-preview').style.backgroundImage = "none";
    document.getElementById('exp-overview').value = "";
    document.getElementById('exp-routes').value = "";
    document.getElementById('amenity-builder-container').innerHTML = ""; 
    window.addAmenityBox(); // Munculkan 1 kotak amenity kosong

    document.getElementById('exp-form-view-title').innerText = "Draft New Experience";
    if(expTableView) expTableView.style.display = "none";
    if(expFormView) expFormView.style.display = "block";
};

window.closeExperienceForm = () => {
    if(expFormView) expFormView.style.display = "none";
    if(expTableView) expTableView.style.display = "block";
};

// 8B. Event Listener Upload Gambar Hero Experience
document.getElementById('exp-hero-upload')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(file) {
        document.getElementById('exp-hero-preview').style.backgroundImage = `url('https://via.placeholder.com/400x200?text=Uploading...')`;
        const url = await uploadToCloudinary(file);
        if(url) {
            document.getElementById('exp-hero-url').value = url;
            document.getElementById('exp-hero-preview').style.backgroundImage = `url('${url}')`;
        }
    }
});

// 8C. Baca & Sinkronisasi Tabel Experience (Real-time)
window.listenToExperiences = () => {
    const colRef = collection(db, "experiences");
    onSnapshot(colRef, (snapshot) => {
        const tableBody = document.getElementById('experiences-list-table');
        if(!tableBody) return; 
        
        tableBody.innerHTML = ""; 
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const status = data.status || "Active";
            
            const rowHTML = `
                <tr>
                    <td><img src="${data.heroBgUrl || 'https://via.placeholder.com/80'}" alt="Cover" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                    <td><strong>${data.title}</strong></td>
                    <td><span style="font-size:0.8rem; color:#718096;">${data.tagline || ''} <br> ${data.subtext || ''}</span></td>
                    <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-action edit" onclick="editExperience('${id}')" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-action suspend" onclick="toggleSuspendExperience('${id}', '${status}')" title="${status === 'Active' ? 'Suspend' : 'Activate'}"><i class="fas fa-ban"></i></button>
                            <button class="btn-action suspend" style="color:#cbd5e0;" onclick="deleteExperience('${id}')" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', rowHTML);
        });
    });
};

// 8D. Edit Experience (Tarik Data ke Form)
window.editExperience = async (id) => {
    const docRef = doc(db, "experiences", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        document.getElementById('edit-exp-id').value = id;
        document.getElementById('exp-title').value = data.title || "";
        document.getElementById('exp-tagline').value = data.tagline || "";
        document.getElementById('exp-subtext').value = data.subtext || "";
        document.getElementById('exp-hero-url').value = data.heroBgUrl || "";
        document.getElementById('exp-hero-preview').style.backgroundImage = `url('${data.heroBgUrl || ''}')`;
        document.getElementById('exp-overview').value = data.overview || "";
        document.getElementById('exp-routes').value = data.routes || "";
        
        // Susun Ulang Amenity Builder
        const container = document.getElementById('amenity-builder-container');
        container.innerHTML = "";
        
        if (data.amenities && data.amenities.length > 0) {
            data.amenities.forEach((amenity) => {
                const box = document.createElement('div');
                box.className = 'itinerary-day-box amenity-box';
                box.style.cssText = 'background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 5px; position: relative;';
                box.innerHTML = `
                    <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    <div class="form-group">
                        <label>FontAwesome Icon</label>
                        <input type="text" class="amenity-icon" value="${amenity.icon || ''}">
                    </div>
                    <div class="form-group">
                        <label>Amenity Title</label>
                        <input type="text" class="amenity-title" value="${amenity.title || ''}">
                    </div>
                    <div class="form-group" style="grid-column: span 2;">
                        <label>Description</label>
                        <textarea class="amenity-desc" rows="2">${amenity.desc || ''}</textarea>
                    </div>
                `;
                container.appendChild(box);
            });
        } else {
            window.addAmenityBox();
        }
        
        document.getElementById('exp-form-view-title').innerText = "Modify Experience Details";
        if(expTableView) expTableView.style.display = "none";
        if(expFormView) expFormView.style.display = "block";
    }
};

// 8E. Simpan atau Update Experience
window.saveExperienceData = async () => {
    const id = document.getElementById('edit-exp-id').value;
    
    // PERBAIKAN: Hanya mengambil kotak amenity di dalam form Experience
    const amenitiesData = [];
    const amenityBoxes = document.querySelectorAll('#amenity-builder-container .amenity-box');
    
    amenityBoxes.forEach((box) => {
        const iconInput = box.querySelector('.amenity-icon');
        const titleInput = box.querySelector('.amenity-title');
        const descInput = box.querySelector('.amenity-desc');
        
        if (iconInput && titleInput && descInput) {
            amenitiesData.push({
                icon: iconInput.value,
                title: titleInput.value,
                desc: descInput.value
            });
        }
    });

    const finalPayload = {
        title: document.getElementById('exp-title').value,
        tagline: document.getElementById('exp-tagline').value,
        subtext: document.getElementById('exp-subtext').value,
        heroBgUrl: document.getElementById('exp-hero-url').value,
        overview: document.getElementById('exp-overview').value,
        routes: document.getElementById('exp-routes').value,
        amenities: amenitiesData,
        status: "Active" 
    };

    try {
        if (id) {
            await updateDoc(doc(db, "experiences", id), finalPayload);
            alert("Experience data successfully updated!");
        } else {
            await addDoc(collection(db, "experiences"), finalPayload);
            alert("New Experience successfully published!");
        }
        window.closeExperienceForm();
    } catch (e) {
        console.error("Save failed: ", e);
        alert("Gagal menyimpan experience.");
    }
};

// 8F. Ganti Status & Delete
window.toggleSuspendExperience = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    if (confirm(`Change status to ${nextStatus}?`)) {
        await updateDoc(doc(db, "experiences", id), { status: nextStatus });
    }
};
window.deleteExperience = async (id) => {
    if (confirm("Delete this experience permanently?")) {
        await deleteDoc(doc(db, "experiences", id));
    }
};

// 8G. Dynamic Builder Amenity Box
window.addAmenityBox = () => {
    const container = document.getElementById('amenity-builder-container');
    if(!container) return;

    const box = document.createElement('div');
    box.className = 'itinerary-day-box amenity-box';
    box.style.cssText = 'background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 5px; position: relative;';
    
    box.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i> Remove</button>
        <div class="form-group">
            <label>FontAwesome Icon Code</label>
            <input type="text" class="amenity-icon" placeholder="e.g. fas fa-bed">
        </div>
        <div class="form-group">
            <label>Amenity Title</label>
            <input type="text" class="amenity-title" placeholder="e.g. Master Suites">
        </div>
        <div class="form-group" style="grid-column: span 2;">
            <label>Description</label>
            <textarea class="amenity-desc" rows="2" placeholder="e.g. Spacious cabins with panoramic ocean windows..."></textarea>
        </div>
    `;
    container.appendChild(box);
};

// ==========================================
// 7. CRUD: SUSTAINABILITY SECTION
// ==========================================

// Fungsi untuk menambah baris form pilar inisiatif (dinamis)
window.addSusPillarBox = (title = "", desc = "", icon = "fas fa-leaf") => {
    const container = document.getElementById('sus-pillars-container');
    if(!container) return;

    const box = document.createElement('div');
    box.className = 'sus-pillar-box';
    box.style.cssText = 'background: #f9f9f9; padding: 20px; border: 1px solid #eee; border-radius: 5px; position: relative; margin-bottom: 15px;';
    
    box.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:10px; color:red; border:none; background:none; cursor:pointer;"><i class="fas fa-trash"></i> Remove</button>
        <div class="form-grid">
            <div class="form-group">
                <label>Icon Code (FontAwesome)</label>
                <input type="text" class="pillar-icon" value="${icon}" placeholder="e.g. fas fa-tree">
            </div>
            <div class="form-group">
                <label>Pillar Title</label>
                <input type="text" class="pillar-title" value="${title}" placeholder="e.g. Ocean Conservation">
            </div>
        </div>
        <div class="form-group">
            <label>Short Description</label>
            <textarea class="pillar-desc" rows="2" placeholder="Brief explanation about this pillar...">${desc}</textarea>
        </div>
    `;
    container.appendChild(box);
};

// Baca Data Sustainability dari Firebase
async function loadSustainabilityData() {
    const docRef = doc(db, "website_content", "sustainability_section");
    const docSnap = await getDoc(docRef);
    
    const container = document.getElementById('sus-pillars-container');
    if (container) container.innerHTML = ''; // Bersihkan kontainer sebelum memuat data

    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById('sus-title').value = data.title || "";
        document.getElementById('sus-desc').value = data.desc || "";
        
        // Looping untuk memuat semua pilar yang sudah tersimpan
        if (data.pillars && data.pillars.length > 0) {
            data.pillars.forEach(p => {
                window.addSusPillarBox(p.title, p.desc, p.icon);
            });
        } else {
            window.addSusPillarBox(); // Jika kosong, beri 1 form kosong default
        }
    } else {
        window.addSusPillarBox(); // Jika tidak ada dokumen di firebase
    }
}

// Simpan Data Sustainability ke Firebase
window.saveSustainabilityData = async () => {
    const title = document.getElementById('sus-title').value;
    const desc = document.getElementById('sus-desc').value;
    
    // Ambil semua data pilar secara dinamis
    const pillars = [];
    document.querySelectorAll('.sus-pillar-box').forEach(box => {
        pillars.push({
            icon: box.querySelector('.pillar-icon').value,
            title: box.querySelector('.pillar-title').value,
            desc: box.querySelector('.pillar-desc').value
        });
    });

    try {
        await setDoc(doc(db, "website_content", "sustainability_section"), {
            title: title,
            desc: desc,
            pillars: pillars
        });
        alert("Data Sustainability berhasil diperbarui!");
    } catch (e) {
        console.error("Error saving document: ", e);
        alert("Gagal menyimpan data.");
    }
};

// ==========================================
// 8. CRUD: GALLERY PREVIEW
// ==========================================

// A. Real-time Listener untuk Menampilkan Galeri
function listenToGallery() {
    const q = collection(db, "gallery");
    
    onSnapshot(q, (snapshot) => {
        const container = document.getElementById('gallery-grid');
        if (!container) return;
        
        container.innerHTML = ''; // Bersihkan kontainer
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Cek status aktif (jika undefined, anggap true)
            const isActive = data.isActive !== false; 
            const opacity = isActive ? '1' : '0.4'; // Jika disuspend, gambar jadi agak transparan
            const statusIcon = isActive ? 'fa-eye-slash' : 'fa-eye';
            const statusText = isActive ? 'Suspend' : 'Publish';
            const statusColor = isActive ? '#f6ad55' : '#48bb78'; // Orange untuk suspend, Hijau untuk publish
            
            // Buat elemen kartu gambar (Image Card)
            const card = document.createElement('div');
            card.style.cssText = `border: 1px solid #eee; border-radius: 5px; overflow: hidden; background: #fff; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05); opacity: ${opacity}; transition: opacity 0.3s;`;
            
            card.innerHTML = `
                <img src="${data.url}" alt="${data.title}" style="width: 100%; height: 150px; object-fit: cover; display: block; background: #eee;">
                
                ${!isActive ? '<span style="position:absolute; top:10px; left:10px; background:red; color:white; padding:2px 8px; font-size:10px; border-radius:3px; font-weight:bold;">SUSPENDED</span>' : ''}
                
                <div style="padding: 10px;">
                    <p style="font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${data.title}">${data.title}</p>
                    
                    <div style="display: flex; justify-content: space-between; gap: 5px;">
                        <button onclick="editGalleryImage('${id}', '${data.title.replace(/'/g, "\\'")}')" style="color: var(--primary); border: none; background: #eee; cursor: pointer; font-size: 0.75rem; padding: 5px 8px; border-radius: 3px; flex: 1;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="toggleGalleryStatus('${id}', ${isActive})" style="color: white; border: none; background: ${statusColor}; cursor: pointer; font-size: 0.75rem; padding: 5px 8px; border-radius: 3px; flex: 1;">
                            <i class="fas ${statusIcon}"></i> ${statusText}
                        </button>
                        <button onclick="deleteGalleryImage('${id}')" style="color: white; border: none; background: #e53e3e; cursor: pointer; font-size: 0.75rem; padding: 5px 8px; border-radius: 3px; flex: 1;">
                            <i class="fas fa-trash"></i> Del
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });
}
// B. Fungsi Mengunggah Gambar ke Cloudinary & Menyimpan ke Firestore
window.addGalleryImage = async () => {
    const title = document.getElementById('gallery-title').value.trim();
    const fileInput = document.getElementById('gallery-file');
    const statusText = document.getElementById('upload-status');
    
    // Validasi apakah file ada
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Harap pilih foto dari perangkat Anda.");
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!title) {
        alert("Harap isi Judul gambar.");
        return;
    }

    try {
        // 1. Tampilkan status upload
        statusText.style.display = 'block';
        statusText.style.color = '#df6e4b'; 
        statusText.innerText = "Mengunggah foto ke server... Mohon tunggu.";
        
        // 2. Gunakan fungsi global uploadToCloudinary yang sudah ada!
        const imageUrl = await uploadToCloudinary(file);
        
        // Jika upload gagal, fungsi global akan me-return null
        if (!imageUrl) {
            throw new Error("Gagal mengunggah atau mendapatkan URL dari server.");
        }

        // 3. Simpan URL tersebut ke Firebase Firestore
        statusText.innerText = "Menyimpan data ke database...";
        await addDoc(collection(db, "gallery"), {
            title: title,
            url: imageUrl,
            isActive: true, // <--- TAMBAHKAN BARIS INI
            createdAt: new Date().toISOString()
        });
        
        // 4. Reset Form dan sukses
        document.getElementById('gallery-title').value = '';
        fileInput.value = '';
        statusText.style.display = 'none';
        
    } catch (e) {
        console.error("Error upload: ", e);
        statusText.style.display = 'none';
        alert("Terjadi kesalahan: " + e.message);
    }
};
// C. Fungsi Menghapus Gambar dari Galeri
window.deleteGalleryImage = async (id) => {
    if (confirm("Hapus gambar ini dari galeri secara permanen?")) {
        try {
            await deleteDoc(doc(db, "gallery", id));
        } catch (e) {
            console.error("Error deleting image: ", e);
            alert("Gagal menghapus gambar.");
        }
    }

    
};
// D. Fungsi Edit Judul Gambar
window.editGalleryImage = async (id, currentTitle) => {
    const newTitle = prompt("Edit judul gambar:", currentTitle);
    
    // Jika user klik cancel atau membiarkan kosong, batalkan
    if (newTitle === null || newTitle.trim() === "") return;
    
    try {
        await updateDoc(doc(db, "gallery", id), {
            title: newTitle.trim()
        });
    } catch (e) {
        console.error("Error updating title: ", e);
        alert("Gagal memperbarui judul gambar.");
    }
};

// E. Fungsi Toggle Suspend / Publish
window.toggleGalleryStatus = async (id, currentStatus) => {
    try {
        await updateDoc(doc(db, "gallery", id), {
            isActive: !currentStatus // Membalikkan status (true jadi false, false jadi true)
        });
    } catch (e) {
        console.error("Error updating status: ", e);
        alert("Gagal mengubah status gambar.");
    }
};

// ==========================================
// 9. CRUD: GLOBAL FOOTER & LEGAL SECTION
// ==========================================

// Fungsi untuk memuat data footer dari Firestore
async function loadFooterData() {
    const docRef = doc(db, "website_content", "footer_section");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Info Dasar
        document.getElementById('footer-desc').value = data.desc || "";
        document.getElementById('footer-email').value = data.email || "";
        document.getElementById('footer-phone').value = data.phone || "";
        document.getElementById('footer-address').value = data.address || "";
        
        // Sosial Media
        document.getElementById('footer-whatsapp').value = data.whatsapp || "";
        document.getElementById('footer-facebook').value = data.facebook || "";
        document.getElementById('footer-instagram').value = data.instagram || "";
        document.getElementById('footer-youtube').value = data.youtube || "";
        
        // Copyright & Developer
        document.getElementById('footer-copyright').value = data.copyright || "";
        document.getElementById('footer-dev-name').value = data.devName || "";
        document.getElementById('footer-dev-web').value = data.devWeb || "";
        document.getElementById('footer-dev-sosmed-name').value = data.devSosmedName || "";
        document.getElementById('footer-dev-sosmed-url').value = data.devSosmedUrl || "";

        // Legal Documents
        document.getElementById('footer-terms').value = data.terms || "";
        document.getElementById('footer-privacy').value = data.privacy || "";
        document.getElementById('footer-cookie').value = data.cookie || "";
    }
}

// Fungsi untuk menyimpan seluruh data perubahan footer
window.saveFooterData = async () => {
    const footerData = {
        desc: document.getElementById('footer-desc').value.trim(),
        email: document.getElementById('footer-email').value.trim(),
        phone: document.getElementById('footer-phone').value.trim(),
        address: document.getElementById('footer-address').value.trim(),
        
        whatsapp: document.getElementById('footer-whatsapp').value.trim(),
        facebook: document.getElementById('footer-facebook').value.trim(),
        instagram: document.getElementById('footer-instagram').value.trim(),
        youtube: document.getElementById('footer-youtube').value.trim(),
        
        copyright: document.getElementById('footer-copyright').value.trim(),
        devName: document.getElementById('footer-dev-name').value.trim(),
        devWeb: document.getElementById('footer-dev-web').value.trim(),
        devSosmedName: document.getElementById('footer-dev-sosmed-name').value.trim(),
        devSosmedUrl: document.getElementById('footer-dev-sosmed-url').value.trim(),

        terms: document.getElementById('footer-terms').value.trim(),
        privacy: document.getElementById('footer-privacy').value.trim(),
        cookie: document.getElementById('footer-cookie').value.trim(),
        
        updatedAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "website_content", "footer_section"), footerData);
        alert("Data Footer & Legal berhasil diperbarui!");
    } catch (e) {
        console.error("Error saving footer data: ", e);
        alert("Gagal menyimpan perubahan data footer.");
    }
};