/**
 * Engineering College - Campus Life & Gallery Interactivity
 * Features:
 * - Category filter for gallery photos and events
 * - Lightbox modal preview for campus life snapshots
 */

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilter();
  initGalleryLightbox();
});

function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('[data-gallery-filter]');
  const galleryItems = document.querySelectorAll('.gallery-col');

  if (!galleryItems.length || !filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-gallery-filter');

      galleryItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.style.display = 'block';
          item.classList.add('animate__animated', 'animate__fadeIn');
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function initGalleryLightbox() {
  const lightboxModalEl = document.getElementById('galleryLightboxModal');
  if (!lightboxModalEl) return;

  const modalImg = document.getElementById('lightboxModalImg');
  const modalCaption = document.getElementById('lightboxModalCaption');
  const modalCategory = document.getElementById('lightboxModalCategory');

  const galleryTriggers = document.querySelectorAll('[data-lightbox-src]');

  galleryTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const src = trigger.getAttribute('data-lightbox-src');
      const title = trigger.getAttribute('data-lightbox-title') || 'Campus Life Snapshot';
      const desc = trigger.getAttribute('data-lightbox-desc') || '';
      const category = trigger.getAttribute('data-lightbox-category') || 'Campus Life';

      if (modalImg) {
        modalImg.src = src;
        modalImg.alt = title;
      }
      if (modalCaption) {
        modalCaption.innerHTML = `<h5 class="fw-bold mb-1">${title}</h5><p class="text-white-50 mb-0 small">${desc}</p>`;
      }
      if (modalCategory) {
        modalCategory.textContent = category;
      }
    });
  });
}
