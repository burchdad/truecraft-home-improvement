export function initializeComparisons(root = document) {
  root.querySelectorAll('[data-comparison]').forEach(frame => {
    const control = frame.nextElementSibling;
    const range = control.querySelector('input');
    const update = () => {
      frame.style.setProperty('--reveal', `${range.value}%`);
      range.setAttribute('aria-valuetext', `${range.value} percent after photograph`);
    };
    frame.classList.add('comparison-ready');
    control.hidden = false;
    range.addEventListener('input', update);
    update();
  });
}
