document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // GALLERY MASONRY FILTER LOGIC
    // ==========================================
    const filterItems = document.querySelectorAll('.filter-item');
    const masonryItems = document.querySelectorAll('.masonry-item');

    if (filterItems.length > 0 && masonryItems.length > 0) {
        
        filterItems.forEach(filter => {
            filter.addEventListener('click', function() {
                
                // 1. Hapus class 'active' dari semua tombol, lalu tambahkan ke tombol yang diklik
                filterItems.forEach(item => item.classList.remove('active'));
                this.classList.add('active');

                // 2. Ambil nilai kategori dari tombol
                const selectedCategory = this.getAttribute('data-filter');

                // 3. Saring gambar
                masonryItems.forEach(item => {
                    // Animasi memudar
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';

                    setTimeout(() => {
                        if (selectedCategory === 'all' || item.getAttribute('data-category') === selectedCategory) {
                            item.classList.remove('hidden');
                            // Beri jeda sangat kecil agar display:block terender sebelum opacity kembali 1
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            }, 50);
                        } else {
                            item.classList.add('hidden');
                        }
                    }, 400); // Waktu yang sama dengan durasi transisi CSS
                });
            });
        });
    }
});