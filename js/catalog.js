/* ============================================
   CATALOG — Product filters & interactions
   ============================================ */

const Catalog = (() => {
  const sceneColors = {
    all:      { bg1: 'rgba(10,22,40,1)',    bg2: 'rgba(10,22,40,1)',    glow: 'rgba(92,200,200,0.05)' },
    mineral:  { bg1: 'rgba(10,22,50,1)',    bg2: 'rgba(15,40,60,1)',    glow: 'rgba(92,200,200,0.1)' },
    sweet:    { bg1: 'rgba(30,20,10,1)',     bg2: 'rgba(40,25,15,1)',    glow: 'rgba(232,168,56,0.08)' },
    drinking: { bg1: 'rgba(10,25,20,1)',     bg2: 'rgba(15,35,30,1)',    glow: 'rgba(91,181,162,0.08)' },
  };

  function init() {
    const section = document.querySelector('.products');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        const scene = sceneColors[filter] || sceneColors.all;

        // Change section background
        if (section) {
          section.style.transition = 'background 0.8s ease';
          section.style.background = `linear-gradient(180deg, ${scene.bg1} 0%, ${scene.bg2} 100%)`;
        }

        // Filter cards with animation
        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          if (show) {
            card.classList.remove('hidden');
            gsap.fromTo(card,
              { opacity: 0, y: 30, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out',
                delay: Math.random() * 0.15 }
            );
          } else {
            gsap.to(card, {
              opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in',
              onComplete: () => card.classList.add('hidden')
            });
          }
        });
      });
    });
  }

  return { init };
})();
