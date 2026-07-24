(() => {
  'use strict';

  const form = document.querySelector('#quote-form');
  const results = document.querySelector('#quote-results');
  const resultGrid = document.querySelector('#result-grid');
  const overview = document.querySelector('#quote-overview');
  const resetButton = document.querySelector('#quote-reset');

  if (!form || !results || !resultGrid || !overview) return;

  const labels = {
    license: 'License status checked where required',
    insurance: 'Proof of insurance requested',
    scope: 'Detailed scope and exclusions',
    materials: 'Materials, models, or allowances',
    permits: 'Permit responsibility identified',
    schedule: 'Start and completion expectations',
    payment: 'Payment schedule in writing',
    changes: 'Change-order process in writing',
    cleanup: 'Cleanup and disposal included',
    warranty: 'Labor and material warranty terms'
  };

  const quoteKeys = ['a', 'b', 'c'];
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const value = (name) => {
    const field = form.elements.namedItem(name);
    return field && 'value' in field ? String(field.value).trim() : '';
  };

  const numberValue = (name) => {
    const raw = value(name);
    if (raw === '') return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };

  const readQuote = (key, index) => {
    const checked = [...form.querySelectorAll(`input[name="${key}-check"]:checked`)].map((box) => box.value);
    const missing = Object.keys(labels).filter((item) => !checked.includes(item));
    const fallbackName = `Estimate ${String.fromCharCode(65 + index)}`;

    return {
      key,
      fallbackName,
      name: value(`${key}-name`) || fallbackName,
      price: numberValue(`${key}-price`),
      deposit: numberValue(`${key}-deposit`),
      duration: value(`${key}-duration`) || 'Not entered',
      notes: value(`${key}-notes`),
      checked,
      missing,
      score: checked.length
    };
  };

  const escapeHtml = (text) => String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const renderQuote = (quote) => {
    const priceText = quote.price === null ? 'Not entered' : currency.format(quote.price);
    const depositText = quote.deposit === null ? 'Not entered' : `${quote.deposit}%`;
    const missingMarkup = quote.missing.length
      ? `<ul>${quote.missing.map((item) => `<li>${escapeHtml(labels[item])}</li>`).join('')}</ul>`
      : '<p class="all-documented">All ten comparison fields are marked as documented. Still verify the information independently.</p>';

    return `
      <article class="comparison-card">
        <div class="comparison-head">
          <div><span>${escapeHtml(quote.fallbackName)}</span><h3>${escapeHtml(quote.name)}</h3></div>
          <strong>${quote.score}/10</strong>
        </div>
        <dl class="quote-facts">
          <div><dt>Price</dt><dd>${priceText}</dd></div>
          <div><dt>Deposit</dt><dd>${depositText}</dd></div>
          <div><dt>Duration</dt><dd>${escapeHtml(quote.duration)}</dd></div>
        </dl>
        <div class="missing-list"><strong>Items to confirm</strong>${missingMarkup}</div>
        ${quote.deposit !== null && quote.deposit >= 100 ? '<p class="result-warning">The entered deposit equals the full price. The FTC advises against paying the full project amount upfront.</p>' : ''}
        ${quote.deposit !== null && quote.deposit > 0 ? '<p class="comparison-note">Check state or local deposit limits and make sure the payment schedule is written into the contract.</p>' : ''}
        ${quote.notes ? `<div class="comparison-notes"><strong>Your notes</strong><p>${escapeHtml(quote.notes)}</p></div>` : ''}
      </article>
    `;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const quotes = quoteKeys.map(readQuote);
    const hasAnyEntry = quotes.some((quote) =>
      quote.name !== quote.fallbackName ||
      quote.price !== null ||
      quote.deposit !== null ||
      quote.duration !== 'Not entered' ||
      quote.notes ||
      quote.score > 0
    );

    if (!hasAnyEntry) {
      results.hidden = false;
      overview.textContent = 'Enter at least one estimate or mark documented fields before comparing.';
      resultGrid.innerHTML = '';
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const pricedQuotes = quotes.filter((quote) => quote.price !== null && quote.price > 0);
    const highestScore = Math.max(...quotes.map((quote) => quote.score));
    const mostDocumented = quotes.filter((quote) => quote.score === highestScore).map((quote) => quote.name);

    let summary = `The most documented estimate${mostDocumented.length > 1 ? 's are' : ' is'} ${mostDocumented.join(', ')} with ${highestScore} of 10 comparison fields marked.`;

    if (pricedQuotes.length) {
      const lowestPrice = Math.min(...pricedQuotes.map((quote) => quote.price));
      const lowest = pricedQuotes.filter((quote) => quote.price === lowestPrice).map((quote) => quote.name);
      summary += ` The lowest entered price is ${currency.format(lowestPrice)} from ${lowest.join(', ')}. Lowest price and most complete documentation are different questions.`;
    } else {
      summary += ' Enter prices when you are ready to compare cost alongside scope and safeguards.';
    }

    overview.textContent = summary;
    resultGrid.innerHTML = quotes.map(renderQuote).join('');
    results.hidden = false;
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  resetButton?.addEventListener('click', () => {
    form.reset();
    results.hidden = true;
    resultGrid.innerHTML = '';
    overview.textContent = '';
    window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
  });
})();
