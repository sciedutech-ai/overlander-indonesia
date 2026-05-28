document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. ACCORDION LOGIC (Dibuat sebagai fungsi Global)
    // ==========================================
    window.initAccordion = function() {
        const accordionItems = document.querySelectorAll('.accordion-item');

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const body = item.querySelector('.accordion-body');

            // Hapus event listener lama agar tidak dobel jika dipanggil 2 kali
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);

            newHeader.addEventListener('click', () => {
                accordionItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.accordion-body').style.maxHeight = null;
                    }
                });

                item.classList.toggle('active');
                if (item.classList.contains('active')) {
                    body.style.maxHeight = body.scrollHeight + "px";
                } else {
                    body.style.maxHeight = null;
                }
            });
        });
    };


    // ==========================================
    // 2. BESPOKE BOOKING FORM (WHATSAPP LOGIC)
    // ==========================================
    const bookingForm = document.getElementById('bespoke-booking-form');
    const countrySelect = document.getElementById('book-country-code');
    const phoneInput = document.getElementById('book-phone');

    if (bookingForm) {
        
        // A. Memuat Daftar Kode Negara (Sama seperti index.js)
        const countryCodes = [
            { code: "+62", name: "ID (+62)" },
            { code: "+1", name: "US/CA (+1)" },
            { code: "+44", name: "UK (+44)" },
            { code: "+61", name: "AU (+61)" },
            { code: "+65", name: "SG (+65)" },
            { code: "+49", name: "DE (+49)" }
            // Tambahkan yang lain sesuai kebutuhan
        ];

        if (countrySelect) {
            countryCodes.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
            countrySelect.value = "+62";
        }

        // B. Mencegah input selain angka & menghapus angka 0 di awal
        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                let cleanedValue = this.value.replace(/[^0-9]/g, '');
                cleanedValue = cleanedValue.replace(/^0+/, '');
                this.value = cleanedValue;
            });
        }

        // C. Eksekusi Pengiriman ke WA
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // Ambil Nilai Form
            const tourName = document.getElementById('book-tour').value;
            const date = document.getElementById('book-date').value;
            const guests = document.getElementById('book-guests').value;
            const name = document.getElementById('book-name').value;
            const email = document.getElementById('book-email').value;
            const cCode = countrySelect.value;
            const phone = phoneInput.value;
            const message = document.getElementById('book-message').value;
            
            const fullWhatsAppNumber = `${cCode}${phone}`;
            const adminWaNumber = "6285748175548"; 
            
            // Format Pesan Khusus Reservasi Detail
            const waText = `*NEW RESERVATION REQUEST*%0A%0AHello Overlander Indonesia, I would like to reserve the following journey:%0A%0A🗺️ *Journey:* ${tourName}%0A📅 *Date:* ${date}%0A👥 *Guests:* ${guests}%0A%0A*--- Guest Details ---*%0A👤 *Lead Name:* ${name}%0A✉️ *Email:* ${email}%0A📞 *WhatsApp:* ${fullWhatsAppNumber}%0A%0A💬 *Special Requests:*%0A${message ? message : "-"}`;
            
            // Buka WhatsApp
            const waURL = `https://wa.me/${adminWaNumber}?text=${waText}`;
            window.open(waURL, '_blank');
        });
    }
});