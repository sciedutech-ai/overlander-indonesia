document.addEventListener("DOMContentLoaded", () => {
    
    window.initStoryModals = function() {
        const readStoryBtns = document.querySelectorAll('.btn-read-story');
        const closeStoryBtns = document.querySelectorAll('.close-story-modal');
        const body = document.body;

        // Fungsi Membuka Story Modal
        readStoryBtns.forEach(btn => {
            // Hapus listener lama untuk mencegah klik ganda
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const targetId = newBtn.getAttribute('data-story');
                const targetModal = document.getElementById(targetId);

                if (targetModal) {
                    targetModal.classList.add('open');
                    body.style.overflow = 'hidden'; 
                }
            });
        });

        // Fungsi Menutup Story Modal
        closeStoryBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const currentModal = newBtn.closest('.story-modal-fullscreen');
                
                if (currentModal) {
                    currentModal.classList.remove('open');
                    body.style.overflow = 'auto'; 
                }
            });
        });
    };

    // Jalankan fungsi ini saat file pertama kali diload 
    // (berguna jika Firebase belum punya data & HTML masih statis)
    initStoryModals();
});