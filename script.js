(() => {
  'use strict';

  if (document.querySelector('.article-hero') && !document.querySelector('link[href="article.css"]')) {
    const articleStyles = document.createElement('link');
    articleStyles.rel = 'stylesheet';
    articleStyles.href = 'article.css';
    document.head.appendChild(articleStyles);
  }

  const pathname = window.location.pathname.split('/').pop() || 'index.html';
  const storageKey = 'homeRoutineGuide.first30Days.v1';
  const starterCheckoutUrl = 'https://home-routine-guide.kit.com/products/19-starter-binder?step=checkout';

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

  const siteMenu = document.querySelector('.site-menu');
  if (siteMenu) {
    siteMenu.id = 'site-menu';
    siteMenu.innerHTML = `
      <a href="index.html#start">Start Here</a>
      <a href="resources.html#checklists">Free Checklists</a>
      <a href="resources.html#guides">Guides</a>
      <a href="resources.html#tools">Free Tools</a>
      <a href="packages.html">Packages</a>
      <a class="nav-cta" href="index.html#launch">Newsletter</a>
    `;
  }

  const footerLinks = document.querySelector('.footer-links');
  if (footerLinks && !footerLinks.querySelector('a[href="digital-product-terms.html"]')) {
    const termsLink = document.createElement('a');
    termsLink.href = 'digital-product-terms.html';
    termsLink.textContent = 'Digital Product Terms';
    footerLinks.appendChild(termsLink);
  }

  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');

  if (menuButton && menu) {
    menuButton.setAttribute('aria-controls', 'site-menu');
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

  const kitForm = {
    hostedUrl: 'https://home-routine-guide.kit.com/4f903c7d6d'
  };

  const addNewsletterStyles = () => {
    if (document.querySelector('link[href="newsletter.css"]')) return;
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = 'newsletter.css';
    document.head.appendChild(styles);
  };

  const addCommerceScript = () => {
    const commerceSrc = 'https://home-routine-guide.kit.com/commerce.js';
    const existing = document.querySelector(`script[src="${commerceSrc}"]`);
    if (existing) return existing;

    const commerce = document.createElement('script');
    commerce.src = commerceSrc;
    commerce.async = true;
    commerce.defer = true;
    commerce.dataset.homeRoutineKitCommerce = 'true';
    commerce.addEventListener('error', () => {
      commerce.remove();
    }, { once: true });
    document.body.appendChild(commerce);
    return commerce;
  };

  const mountKitForm = (container) => {
    if (!container || container.dataset.kitMounted === 'true') return;
    container.dataset.kitMounted = 'true';

    const frame = document.createElement('iframe');
    frame.className = 'kit-form-frame';
    frame.src = 'newsletter-embed.html?v=1';
    frame.title = 'Subscribe to the Home Routine Guide newsletter';
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('loading', 'eager');
    container.replaceChildren(frame);
  };

  const formShellMarkup = `
    <div class="newsletter-form-shell">
      <div class="kit-form-mount" aria-label="Email newsletter signup"></div>
      <p class="newsletter-fallback">Form not appearing? <a href="${kitForm.hostedUrl}" target="_blank" rel="noopener noreferrer">Open the secure Kit signup form</a>.</p>
      <p class="newsletter-privacy">By subscribing, you agree to receive Home Routine Guide emails. Unsubscribe anytime. See our <a href="privacy.html">privacy policy</a>.</p>
    </div>
  `;

  const main = document.querySelector('main');
  const starterPromoPages = new Set([
    'resources.html',
    'first-30-days.html',
    'seasonal-maintenance.html',
    'water-leak-guide.html',
    'smoke-co-alarm-guide.html',
    'where-is-main-water-shutoff.html',
    'how-often-change-hvac-filter.html',
    'monthly-home-maintenance-checklist.html',
    'maintenance-budget.html',
    'contractor-quote-comparison.html'
  ]);

  if (main && starterPromoPages.has(pathname) && !document.querySelector('.starter-product-section')) {
    addNewsletterStyles();
    const productSection = document.createElement('section');
    productSection.className = 'starter-product-section';
    productSection.innerHTML = `
      <div class="container">
        <div class="starter-product-card">
          <div>
            <p class="eyebrow">New Homeowner Starter Binder</p>
            <h2>Keep the essential home details in one printable system.</h2>
            <p>The 27-page Starter Binder combines first-month priorities, emergency information, shutoff and equipment records, warranties, contractors, maintenance notes, and seasonal planning.</p>
            <ul class="starter-product-benefits">
              <li>One-time $19 digital purchase</li>
              <li>Instant file delivery through Kit</li>
              <li>No subscription required</li>
            </ul>
          </div>
          <div class="starter-product-actions">
            <a class="button button-primary convertkit-button" href="${starterCheckoutUrl}" data-commerce>Buy the Starter Binder — $19</a>
            <a class="button button-secondary" href="packages.html">See everything included</a>
          </div>
        </div>
      </div>
    `;
    const launchSection = document.querySelector('#launch');
    if (launchSection) main.insertBefore(productSection, launchSection);
    else main.appendChild(productSection);

    // Load Kit only after the exact data-commerce button exists in the page.
    addCommerceScript();
  }

  // Static checkout buttons on the homepage and Packages page use the same embed.
  if (document.querySelector('a.convertkit-button[data-commerce]')) {
    addCommerceScript();
  }

  const launchCard = document.querySelector('#launch .launch-card');
  if (launchCard) {
    addNewsletterStyles();
    const isPackagePage = pathname === 'packages.html';
    launchCard.classList.add('newsletter-card');
    launchCard.innerHTML = `
      <div class="newsletter-copy">
        <p class="eyebrow">${isPackagePage ? 'Free checklist and future releases' : 'Free homeowner checklist'}</p>
        <h2>${isPackagePage ? 'Get the free checklist and hear about the next binders.' : 'Start your first 30 days with a plan.'}</h2>
        <p>${isPackagePage ? 'Join the newsletter for the printable First 30 Days workbook, practical homeowner guidance, and future product updates.' : 'Join the Home Routine Guide newsletter and get the First 30 Days Homeowner Checklist, plus calm maintenance guidance built for beginners.'}</p>
        <ul class="newsletter-benefits">
          <li>Printable First 30 Days workbook</li>
          <li>Practical seasonal guidance</li>
          <li>${isPackagePage ? 'Future binder release announcements' : 'No scare tactics or daily spam'}</li>
        </ul>
      </div>
      ${formShellMarkup}
    `;
    mountKitForm(launchCard.querySelector('.kit-form-mount'));
  } else {
    const newsletterPages = new Set([
      'first-30-days.html',
      'seasonal-maintenance.html',
      'water-leak-guide.html',
      'smoke-co-alarm-guide.html',
      'where-is-main-water-shutoff.html',
      'how-often-change-hvac-filter.html',
      'monthly-home-maintenance-checklist.html',
      'maintenance-budget.html',
      'contractor-quote-comparison.html'
    ]);

    if (main && newsletterPages.has(pathname)) {
      addNewsletterStyles();
      const section = document.createElement('section');
      section.className = 'newsletter-section';
      section.innerHTML = `
        <div class="container">
          <div class="newsletter-card">
            <div class="newsletter-copy">
              <p class="eyebrow">Free homeowner checklist</p>
              <h2>Build a home routine you can keep.</h2>
              <p>Get the First 30 Days Homeowner Checklist and occasional practical guidance for maintaining, organizing, and protecting your home.</p>
              <ul class="newsletter-benefits">
                <li>Beginner-friendly priorities</li>
                <li>Seasonal maintenance guidance</li>
                <li>One-click unsubscribe</li>
              </ul>
            </div>
            ${formShellMarkup}
          </div>
        </div>
      `;
      main.appendChild(section);
      mountKitForm(section.querySelector('.kit-form-mount'));
    }
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();