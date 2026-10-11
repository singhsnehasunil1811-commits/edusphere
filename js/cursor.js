/**
 * Circular Cursor Tracker - Coding Nexus Style
 */
(function() {
  function initCursor() {
    let cursor = document.getElementById('custom-cursor');
    let dot = document.getElementById('custom-cursor-dot');

    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'custom-cursor';
      document.body.appendChild(cursor);
    }

    if (!dot) {
      dot = document.createElement('div');
      dot.id = 'custom-cursor-dot';
      document.body.appendChild(dot);
    }

    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animate() {
      // Smooth interpolation for the outer circle
      cursorX += (mouseX - cursorX) * 0.22;
      cursorY += (mouseY - cursorY) * 0.22;
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      requestAnimationFrame(animate);
    }
    animate();

    function addHoverListeners() {
      const interactives = document.querySelectorAll('a, button, [onclick], input, select, textarea, .nav-link, .btn, .card, tr, .badge');
      interactives.forEach(el => {
        if (!el.dataset.cursorBound) {
          el.dataset.cursorBound = "true";
          el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        }
      });
    }

    addHoverListeners();
    // Re-check periodically or on mutations for dynamically rendered tables and rows
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
  } else {
    initCursor();
  }
})();
