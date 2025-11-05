// vine.js
// Draw vine paths, then pop grapes (circles) into view around the logo.
// Put this file in the repo root and ensure index.html loads it as <script src="vine.js" defer></script>

(function () {
  // Respect reduced motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    // Make everything visible instantly
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.vine-path').forEach(p => {
        p.style.strokeDasharray = 'none';
        p.style.strokeDashoffset = '0';
      });
      document.querySelectorAll('.grape').forEach(g => {
        g.style.opacity = '1';
        g.style.transform = 'scale(1)';
      });
    });
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('vineSvg');
    if (!svg) return;

    // path IDs in the order to draw
    const pathIds = ['vpath1','vpath2','vpath3','t1','t2'];
    const paths = pathIds.map(id => document.getElementById(id)).filter(Boolean);

    // grapes (pop them after the vine draws)
    const grapes = Array.from(svg.querySelectorAll('.grape'));

    // prepare paths for dash animation
    paths.forEach(p => {
      try {
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len} ${len}`;
        p.style.strokeDashoffset = `${len}`;
        p.style.opacity = '1';
      } catch (e) {
        // ignore if can't compute
      }
    });

    // Helper to animate a path to 0 dashoffset (returns Promise)
    function animatePath(path, duration = 700, delay = 0) {
      return new Promise(resolve => {
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.9,.3,1), opacity ${Math.round(duration/2)}ms ease`;
        // small delay before starting
        setTimeout(() => {
          path.style.strokeDashoffset = '0';
          // ensure visible
          path.style.opacity = '1';
          // resolve after duration
          setTimeout(() => resolve(), duration + 30);
        }, delay);
      });
    }

    // Animate paths sequentially with a slight overlap
    (async function run() {
      let baseDur = 700;
      for (let i = 0; i < paths.length; i++) {
        const dur = baseDur + (i * 80);
        await animatePath(paths[i], dur, 60); // slight in-between delay
        // small pause before next
        await new Promise(r => setTimeout(r, 60));
      }

      // After vine drawn, pop grapes sequentially with tiny stagger
      for (let i = 0; i < grapes.length; i++) {
        const g = grapes[i];
        // small delay
        await new Promise(r => setTimeout(r, 90 + Math.random() * 140));
        g.classList.add('pop'); // CSS transition handles scale/opacity
      }

      // optional gentle final stroke / shimmer on vine
      setTimeout(() => {
        paths.forEach(p => {
          p.style.transition = `stroke 800ms ease, opacity 400ms ease`;
          // slightly lighten stroke for a moment
          p.style.stroke = 'rgba(89,44,56,0.92)';
        });
      }, 600);

    })();

    // On resize, recompute lengths so the draw remains accurate if user resizes
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        paths.forEach(p => {
          try {
            const len = p.getTotalLength();
            p.style.strokeDasharray = `${len} ${len}`;
            // keep into visible state
            p.style.strokeDashoffset = 0;
          } catch (e) {}
        });
      }, 220);
    });

  });
})();
