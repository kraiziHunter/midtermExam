/**
 * Engineering College - Programs Catalog Interactivity
 * Interactive Features:
 * - Dynamic Department Filtering (Tabs)
 * - Live Keyword & Full-Text Search
 * - Result Counter
 * - Detailed Curriculum Modal Popups
 */

document.addEventListener('DOMContentLoaded', () => {
  initProgramsFilterAndSearch();
  initProgramDetailsModal();
});

function initProgramsFilterAndSearch() {
  const filterButtons = document.querySelectorAll('[data-program-filter]');
  const searchInput = document.getElementById('programSearchInput');
  const programCards = document.querySelectorAll('.program-card-col');
  const countDisplay = document.getElementById('programResultCount');
  const noResultsBox = document.getElementById('noProgramsFound');
  const clearSearchBtn = document.getElementById('clearProgramSearchBtn');

  if (!programCards.length) return;

  let activeFilter = 'all';
  let searchTerm = '';

  const updateDisplay = () => {
    let visibleCount = 0;

    programCards.forEach((card) => {
      const category = card.getAttribute('data-category') || '';
      const title = card.querySelector('.program-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.program-desc')?.textContent.toLowerCase() || '';
      const tags = card.getAttribute('data-tags')?.toLowerCase() || '';

      const matchesFilter = (activeFilter === 'all') || (category === activeFilter);
      const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm) || tags.includes(searchTerm);

      if (matchesFilter && matchesSearch) {
        card.style.display = 'block';
        card.classList.add('animate__animated', 'animate__fadeIn');
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update count display
    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} of ${programCards.length} programs`;
    }

    // Toggle No Results View
    if (noResultsBox) {
      if (visibleCount === 0) {
        noResultsBox.style.display = 'block';
      } else {
        noResultsBox.style.display = 'none';
      }
    }
  };

  // Filter Buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-program-filter');
      updateDisplay();
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      updateDisplay();
    });
  }

  // Clear Search Button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      activeFilter = 'all';
      filterButtons.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-program-filter') === 'all');
      });
      updateDisplay();
      if (searchInput) searchInput.focus();
    });
  }

  // Initial count
  updateDisplay();
}

/**
 * Handles program syllabus modal population
 */
function initProgramDetailsModal() {
  const modalEl = document.getElementById('programDetailsModal');
  if (!modalEl) return;

  const detailButtons = document.querySelectorAll('[data-bs-target="#programDetailsModal"]');
  const modalTitle = document.getElementById('modalProgramTitle');
  const modalDepartment = document.getElementById('modalProgramDepartment');
  const modalOverview = document.getElementById('modalProgramOverview');
  const modalCredits = document.getElementById('modalProgramCredits');
  const modalDuration = document.getElementById('modalProgramDuration');
  const modalCareers = document.getElementById('modalProgramCareers');
  const modalCurriculum = document.getElementById('modalProgramCurriculum');
  const modalApplyBtn = document.getElementById('modalApplyLink');

  detailButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.ec-card');
      if (!card) return;

      const title = card.getAttribute('data-modal-title') || card.querySelector('.program-title')?.textContent;
      const dept = card.getAttribute('data-modal-dept') || 'Department of Engineering';
      const overview = card.getAttribute('data-modal-overview') || 'A rigorous 4-year curriculum designed to prepare innovators.';
      const credits = card.getAttribute('data-modal-credits') || '128 Credit Hours';
      const duration = card.getAttribute('data-modal-duration') || '4 Years (8 Semesters)';
      const careers = card.getAttribute('data-modal-careers') || 'Lead Engineer, Systems Architect, Research Scientist';
      const modules = card.getAttribute('data-modal-modules') || 'Algorithms, Embedded Systems, Circuit Design, Capstone Project';
      const programSlug = card.getAttribute('data-program-slug') || '';

      if (modalTitle) modalTitle.textContent = title;
      if (modalDepartment) modalDepartment.textContent = dept;
      if (modalOverview) modalOverview.textContent = overview;
      if (modalCredits) modalCredits.textContent = credits;
      if (modalDuration) modalDuration.textContent = duration;

      // Populate careers
      if (modalCareers) {
        modalCareers.innerHTML = careers.split(',')
          .map(c => `<span class="badge bg-secondary-subtle text-secondary me-1 mb-1 p-2">${c.trim()}</span>`)
          .join('');
      }

      // Populate modules
      if (modalCurriculum) {
        modalCurriculum.innerHTML = modules.split(',')
          .map(m => `<li class="list-group-item d-flex align-items-center gap-2"><i class="bi bi-check2 text-success"></i> ${m.trim()}</li>`)
          .join('');
      }

      if (modalApplyBtn && programSlug) {
        modalApplyBtn.href = `register.html?program=${encodeURIComponent(programSlug)}`;
      }
    });
  });
}
