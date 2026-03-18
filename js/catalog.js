/* ============================================
   CATALOG — Product filters & interactions
   ============================================ */

const Catalog = (() => {
  function init() {
    initFilters();
  }

  function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        cards.forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hidden');
            gsap.fromTo(card,
              { opacity: 0, y: 30, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out',
                delay: Math.random() * 0.2 }
            );
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  return { init };
})();
