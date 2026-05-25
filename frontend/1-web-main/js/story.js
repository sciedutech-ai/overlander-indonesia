document.addEventListener("DOMContentLoaded", () => {
    
    const readStoryBtns = document.querySelectorAll('.btn-read-story');
    const closeStoryBtns = document.querySelectorAll('.close-story-modal');
    const body = document.body;

    // Fungsi Membuka Story Modal
    readStoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mengambil ID target dari data-story pada tombol (misal: "story-bromo")
            const targetId = btn.getAttribute('data-story');
            const targetModal = document.getElementById(targetId);

            if (targetModal) {
                targetModal.classList.add('open');
                // Mengunci scroll background agar hanya modal yang bisa discroll
                body.style.overflow = 'hidden'; 
            }
        });
    });

    // Fungsi Menutup Story Modal
    closeStoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mencari modal induk dari tombol X yang diklik
            const currentModal = btn.closest('.story-modal-fullscreen');
            
            if (currentModal) {
                currentModal.classList.remove('open');
                // Mengembalikan fungsi scroll pada halaman utama
                body.style.overflow = 'auto'; 
            }
        });
    });

});