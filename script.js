/**
 * Сольв — основной скрипт сайта.
 * Разделён на независимые модули: анимации появления, шапка,
 * мобильное меню, форма заявки.
 */

/* ==========================================================
   1. Появление секций при скролле (fade-up + stagger)
   ========================================================== */
(function initScrollReveal() {
  const items = document.querySelectorAll('.fade-up');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // Stagger внутри общих родителей (карточки, шаги, сетки)
  const staggerParents = document.querySelectorAll(
    '.achievements__grid, .products__list, .process__list, .clients__grid, .contact-persons__list'
  );

  staggerParents.forEach((parent) => {
    const children = parent.querySelectorAll(':scope > .fade-up, :scope > *.fade-up');
    Array.from(parent.children).forEach((child, index) => {
      if (child.classList.contains('fade-up')) {
        child.style.transitionDelay = `${Math.min(index * 0.12, 0.4)}s`;
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  items.forEach((el) => observer.observe(el));
})();

/* ==========================================================
   2. Шапка: фон + blur при скролле
   ========================================================== */
(function initHeaderScrollState() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const updateState = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateState();
  window.addEventListener('scroll', updateState, { passive: true });
})();

/* ==========================================================
   3. Мобильное меню (доступное: aria, Escape, клик вне меню)
   ========================================================== */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Закрыть меню');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
    document.body.style.overflow = '';
  };

  const isOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => {
    isOpen() ? closeMenu() : openMenu();
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!isOpen()) return;
    const clickedInsideNav = nav.contains(event.target);
    const clickedToggle = toggle.contains(event.target);
    if (!clickedInsideNav && !clickedToggle) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) closeMenu();
  });

  // Закрываем меню при переходе на десктопный брейкпоинт
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
})();

/* ==========================================================
   4. Форма заявки: форматирование телефона + валидация
   ========================================================== */
(function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  const textFields = [
    {
      input: document.getElementById('surname'),
      error: document.getElementById('surnameError'),
      message: 'Введите фамилию (2-30 букв)',
    },
    {
      input: document.getElementById('name'),
      error: document.getElementById('nameError'),
      message: 'Введите имя (2-30 букв)',
    },
    {
      input: document.getElementById('patronymic'),
      error: document.getElementById('patronymicError'),
      message: 'Введите отчество (2-30 букв)',
    },
  ];

  textFields.forEach(({ input, error, message }) => {
    input.addEventListener('input', () => {
      const valid = input.validity.valid;
      error.textContent = valid ? '' : message;
      input.classList.toggle('is-invalid', !valid);
    });
  });

  const phoneInput = document.getElementById('phone');
  const phoneError = document.getElementById('phoneError');
  const phonePattern = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

  const formatPhone = (rawValue) => {
    let digits = rawValue.replace(/\D/g, '');

    if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (!digits.startsWith('7')) digits = `7${digits}`;
    digits = digits.substring(0, 11);

    let formatted = '+7';
    if (digits.length > 1) formatted += ` (${digits.substring(1, 4)}`;
    if (digits.length >= 4) formatted += `) ${digits.substring(4, 7)}`;
    if (digits.length >= 7) formatted += `-${digits.substring(7, 9)}`;
    if (digits.length >= 9) formatted += `-${digits.substring(9, 11)}`;

    return formatted;
  };

  phoneInput.addEventListener('input', (event) => {
    const formatted = formatPhone(event.target.value);
    event.target.value = formatted;

    const valid = phonePattern.test(formatted);
    phoneError.textContent = valid ? '' : 'Введите номер +7 (999) 999-99-99';
    phoneInput.classList.toggle('is-invalid', !valid);
  });

  form.addEventListener('submit', (event) => {
    let isFormValid = true;

    textFields.forEach(({ input, error, message }) => {
      if (!input.validity.valid) {
        error.textContent = message;
        input.classList.add('is-invalid');
        isFormValid = false;
      }
    });

    if (!phonePattern.test(phoneInput.value)) {
      phoneError.textContent = 'Введите номер +7 (999) 999-99-99';
      phoneInput.classList.add('is-invalid');
      isFormValid = false;
    }

    if (!isFormValid) event.preventDefault();
  });
})();
