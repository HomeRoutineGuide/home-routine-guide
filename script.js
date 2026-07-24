(() => {
  'use strict';

  if (document.querySelector('.article-hero') && !document.querySelector('link[href="article.css"]')) {
    const articleStyles = document.createElement('link');
    articleStyles.rel = 'stylesheet';
    articleStyles.href = 'article.css';
    document.head.appendChild(articleStyles);
  }

  const storageKey = 'homeRoutineGuide.first30Days.v1';

  const seasons = {
    spring: {
      kicker: 'Spring routine',
      title: 'Inspect, refresh, and catch winter damage.',
      tasks: [
        'Walk the exterior and note visible changes',
        'Check gutters and make sure water can drain away',
        'Prepare cooling equipment before hot weather',
        'Review outdoor faucets, screens, seals, and weatherstripping'
      ]
    },
    summer: {
      kicker: 'Summer routine',
      title: 'Keep cooling, water, and outdoor areas in view.',
      tasks: [
        'Check the HVAC filter and follow the equipment instructions',
        'Look for signs of moisture around plumbing and appliances',
        'Inspect decks, railings, steps, and exterior walking surfaces',
        'Keep vegetation and debris away from exterior equipment'
      ]
    },
    fall: {
      kicker: 'Fall routine',
      title: 'Prepare the home before cold weather arrives.',
      tasks: [
        'Schedule heating-system service when appropriate',
        'Check doors, windows, and visible exterior gaps',
        'Review gutters and drainage after leaves fall',
        'Confirm winter tools and emergency supplies are accessible'
      ]
    },
    winter: {
      kicker: 'Winter routine',
      title: 'Monitor safety, moisture, and cold-weather stress.',
      tasks: [
        'Test smoke and carbon-monoxide alarms',
        'Keep exterior appliance vents clear and visible',
        'Watch for leaks, condensation, and unusual indoor moisture',
        'Review the home after storms and document new damage'
      ]
    }
  };

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const seasonContent = document.querySelector('#season-content');
  const seasonTabs = document.querySelectorAll('.season-tab');

  seasonTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const seasonName = tab.dataset.season;
      const season = seasons[seasonName];
      if (!season || !seasonContent) return;

      seasonTabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });

      seasonContent.innerHTML = `
        <p class="season-kicker">${season.kicker}</p>
        <h3>${season.title}</h3>
        <ul>${season.tasks.map((task) => `<li>${task}</li>`).join('')}</ul>
      `;
    });
  });

  const toolCards = document.querySelectorAll('.tool-grid .tool-card');
  const budgetCard = toolCards[1];
  if (budgetCard) {
    const badge = budgetCard.querySelector('.coming');
    const title = budgetCard.querySelector('h3');
    const description = budgetCard.querySelector('p');

    if (badge) badge.textContent = 'Free';
    if (title) title.textContent = 'Maintenance Budget Planner';
    if (description) description.textContent = 'Turn your own routine, project, and emergency-reserve assumptions into a clear monthly contribution.';

    if (!budgetCard.querySelector('a')) {
      const link = document.createElement('a');
      link.className = 'text-link';
      link.href = 'maintenance-budget.html';
      link.textContent = 'Open the free planner →';
      budgetCard.appendChild(link);
    }
  }

  const checklist = document.querySelector('#interactive-list');
  const progressText = document.querySelector('#checklist-progress-text');
  const progressBar = document.querySelector('#checklist-progress-bar');
  const resetButton = document.querySelector('#reset-checklist');

  if (checklist) {
    const checkboxes = [...checklist.querySelectorAll('input[type="checkbox"][data-task]')];

    const readSavedTasks = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return Array.isArray(saved) ? saved : [];
      } catch {
        return [];
      }
    };

    const saveTasks = () => {
      const completed = checkboxes.filter((box) => box.checked).map((box) => box.dataset.task);
      try {
        localStorage.setItem(storageKey, JSON.stringify(completed));
      } catch {
        // The checklist remains usable when browser storage is unavailable.
      }
    };

    const updateProgress = () => {
      const completed = checkboxes.filter((box) => box.checked).length;
      const total = checkboxes.length;
      const percent = total ? Math.round((completed / total) * 100) : 0;

      if (progressText) progressText.textContent = `${completed} of ${total} complete`;
      if (progressBar) progressBar.style.width = `${percent}%`;
    };

    const savedTasks = new Set(readSavedTasks());
    checkboxes.forEach((box) => {
      box.checked = savedTasks.has(box.dataset.task);
      box.addEventListener('change', () => {
        saveTasks();
        updateProgress();
      });
    });

    resetButton?.addEventListener('click', () => {
      checkboxes.forEach((box) => { box.checked = false; });
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // No action needed when browser storage is unavailable.
      }
      updateProgress();
    });

    updateProgress();
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
