// vine.js
// Simple sequential SVG path "draw" animation for the vine.
// Put this file in the repo root and ensure index.html loads it as <script src="vine.js" defer></script>

// IIFE to avoid globals
(function () {
  // Respect users who prefer reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    // Remove dashoffset so paths are visible immediately
    document.querySelectorAll('.vine-path').forEach(p => {
      p.style.strokeDasharray = 'none';
      p.style.strokeDashoffset = '0';
    });
    return;
  }

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('vineSvg');
    if (!svg) return;

    // Collect paths in the order we want to draw them
    const drawOrder = [
      'vine1', 'tendril1', 'vine2', 'leaf1',
      'tendril2', 'vine3', 'leaf2'
    ].map(id => document.getElementById(id)).filter(Boolean);

    // Setup each path for stroke-dash animation
    drawOrder.forEach(path => {
      try {
        const len = path.getTotalLength();
        // Set dasharray and dashoffset to path length (hidden initially)
        path.style.strokeDasharray = len + ' ' + len;
        path.style.strokeDashoffset = len;
        // Optional: slightly reduce stroke opacity for leaves vs main vine
        // path.style.opacity = 0.95;
      } catch (e) {
        // if getTotalLength fails, just skip
      }
    });

    // Function to animate a single path to strokeDashoffset=0
    function animatePath(path, duration = 800) {
      return new Promise(resolve => {
        if (!path) { resolve(); return; }
        // Use transition on stroke-dashoffset to animate the drawing
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.9,.3,1), opacity ${Math.round(duration/2)}ms ease`;
        // small delay before starting to ensure the style applied
        requestAnimationFrame(() => {
          // set to 0 to start animation
          path.style.strokeDashoffset = '0';
          path.style.opacity = '1';
        });

        // resolve after duration
        setTimeout(() => resolve(), duration + 40);
      });
    }

    // Sequentially animate each path with small overlap
    (async function runSequence() {
      for (let i = 0; i < drawOrder.length; i++) {
        const path = drawOrder[i];
        // choose duration based on path length (fallback)
        let dur = 700 + (i * 80); // slightly increasing
        await animatePath(path, dur);
        // small pause between some groups for natural feel
        await new Promise(r => setTimeout(r, 80));
      }

      // After drawing, optionally do a tiny leaf fill fade-in
      drawOrder.forEach(p => {
        if (p.classList.contains('vine-leaf')) {
          // give leaves a slight fill in after draw
          p.style.transition += ', fill 420ms ease';
          p.style.fillOpacity = 0.9;
        }
      });
    })();

    // Re-run on resize if necessary (recalculate lengths)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // reset dash lengths so the animation would still fit if re-run (optional)
        drawOrder.forEach(path => {
          try {
            const len = path.getTotalLength();
            path.style.strokeDasharray = len + ' ' + len;
            // keep strokeDashoffset at 0 so it remains visible
            path.style.strokeDashoffset = 0;
          } catch (_) {}
        });
      }, 250);
    });
  });
})();
