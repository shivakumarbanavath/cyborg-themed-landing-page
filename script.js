const loader = document.querySelector('.loader');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const cursorGlow = document.querySelector('.cursor-glow');
const canvas = document.querySelector('#particle-canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('is-hidden'), 600);
});

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('pointermove', (event) => {
  cursorGlow.style.setProperty('--x', `${event.clientX}px`);
  cursorGlow.style.setProperty('--y', `${event.clientY}px`);
});

const typeTarget = document.querySelector('.typing');
const text = typeTarget.dataset.text;
let typeIndex = 0;

function typeText() {
  typeTarget.textContent = text.slice(0, typeIndex);
  typeIndex += 1;
  if (typeIndex <= text.length) {
    setTimeout(typeText, 45);
  }
}

setTimeout(typeText, 900);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const counters = document.querySelectorAll('[data-counter]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const element = entry.target;
    const target = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || '';
    const decimals = String(target).includes('.') ? 2 : 0;
    const duration = 1600;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      element.textContent = `${value.toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.7 });

counters.forEach((counter) => counterObserver.observe(counter));

const form = document.querySelector('.contact-form');
const status = document.querySelector('.form-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input, textarea')];
  let valid = true;

  fields.forEach((field) => {
    const fieldValid = field.checkValidity();
    field.classList.toggle('is-invalid', !fieldValid);
    if (!fieldValid) valid = false;
  });

  if (!valid) {
    status.textContent = 'Please complete every field with a valid signal.';
    status.style.color = '#f87171';
    return;
  }

  status.textContent = 'Connection initialized. CYBERNEXUS will respond shortly.';
  status.style.color = '#22D3EE';
  form.reset();
});

const modal = document.querySelector('.demo-modal');
const demoButton = document.querySelector('[data-demo]');
const modalClose = document.querySelector('.demo-modal__close');

function setModal(open) {
  modal.classList.toggle('is-open', open);
  modal.setAttribute('aria-hidden', String(!open));
}

demoButton.addEventListener('click', () => setModal(true));
modalClose.addEventListener('click', () => setModal(false));
modal.addEventListener('click', (event) => {
  if (event.target === modal) setModal(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setModal(false);
});

let width;
let height;
let particles = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth * window.devicePixelRatio;
  height = canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 14)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: (Math.random() * 1.8 + 0.5) * window.devicePixelRatio,
    speed: (Math.random() * 0.28 + 0.12) * window.devicePixelRatio,
    alpha: Math.random() * 0.5 + 0.25
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle, index) => {
    particle.y -= particle.speed;
    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 245, 255, ${particle.alpha})`;
    ctx.shadowColor = '#00F5FF';
    ctx.shadowBlur = 14;
    ctx.fill();

    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 120 * window.devicePixelRatio) {
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.strokeStyle = `rgba(34, 211, 238, ${0.16 - distance / (120 * window.devicePixelRatio) * 0.16})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });

  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);
