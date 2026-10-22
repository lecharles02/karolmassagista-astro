document.querySelectorAll('[data-photo-carousel]').forEach(root => {
  const viewport = root.querySelector('.karol-carousel__viewport');
  const track = root.querySelector('.karol-carousel__track');
  const originals = [...track.children];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = 1, step = 0, offset = 0, pending = 0, lastTime = null;
  let inView = false, focused = false, startX = null;

  function position() {
    const base = visible * step;
    const cycle = originals.length * step;
    if (!cycle) return;
    offset = base + ((offset - base) % cycle + cycle) % cycle;
    track.style.transform = `translate3d(${-offset}px,0,0)`;
  }

  function reset() {
    const progress = step ? (offset - visible * step) / step : 0;
    visible = Math.min(originals.length, innerWidth < 768 ? 1 : innerWidth < 1024 ? 2 : root.closest('#espaco') ? 3 : 4);
    const clone = slide => {
      const copy = slide.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('inert', '');
      copy.querySelector('img').alt = '';
      return copy;
    };
    track.replaceChildren(...originals.slice(-visible).map(clone), ...originals, ...originals.slice(0, visible).map(clone));
    step = originals[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
    offset = (visible + progress) * step;
    pending = 0;
    position();
  }

  function move(direction) {
    if (reducedMotion.matches) {
      offset += direction * step;
      position();
    } else {
      pending += direction * step;
    }
  }

  root.querySelector('[data-carousel-prev]').addEventListener('click', () => move(-1));
  root.querySelector('[data-carousel-next]').addEventListener('click', () => move(1));
  root.addEventListener('focusin', event => focused = event.target.matches(':focus-visible'));
  root.addEventListener('focusout', event => focused = !!event.relatedTarget && root.contains(event.relatedTarget) && event.relatedTarget.matches(':focus-visible'));
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  viewport.addEventListener('pointerdown', event => startX = event.clientX);
  viewport.addEventListener('pointerup', event => {
    if (startX !== null && Math.abs(event.clientX - startX) > 45) move(event.clientX < startX ? 1 : -1);
    startX = null;
  });
  viewport.addEventListener('pointercancel', () => startX = null);
  new IntersectionObserver(entries => inView = entries[0].isIntersecting, { threshold: .1 }).observe(root);
  new ResizeObserver(reset).observe(viewport);
  reset();

  function animate(time) {
    const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 50);
    lastTime = time;
    if (inView && !document.hidden && !reducedMotion.matches) {
      const glide = Math.abs(pending) > .1 ? pending * (1 - Math.exp(-elapsed / 150)) : pending;
      pending -= glide;
      offset += glide + (!focused && startX === null ? 24 * elapsed / 1000 : 0);
      position();
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});
