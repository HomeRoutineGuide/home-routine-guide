(() => {
  'use strict';

  const form = document.querySelector('#inspection-plan-form');
  const rows = document.querySelector('#inspection-plan-rows');
  if (!form || !rows) return;

  const storageKey = 'homeRoutineGuide.inspectionPlan.v1';
  const emptyState = document.querySelector('#inspection-empty');
  const itemCount = document.querySelector('#inspection-item-count');
  const openCount = document.querySelector('#inspection-open-count');
  const estimateTotal = document.querySelector('#inspection-estimate-total');
  const printButton = document.querySelector('#inspection-print');
  const exportButton = document.querySelector('#inspection-export');
  const clearButton = document.querySelector('#inspection-clear-all');

  const safeItems = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
  const readItems = () => {
    try { return safeItems(JSON.parse(localStorage.getItem(storageKey) || '[]')); }
    catch { return []; }
  };
  let items = readItems();

  const saveItems = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(items)); }
    catch { /* The plan still works for the current page session. */ }
  };

  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const dateLabel = value => {
    if (!value) return '—';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };
  const valueFor = (data, name) => String(data.get(name) || '').trim();

  const cell = value => {
    const td = document.createElement('td');
    td.textContent = value || '—';
    return td;
  };

  const render = () => {
    rows.replaceChildren();
    items.forEach(item => {
      const tr = document.createElement('tr');
      const finding = document.createElement('td');
      const strong = document.createElement('strong');
      strong.textContent = item.finding;
      finding.appendChild(strong);
      if (item.reference) {
        const small = document.createElement('small');
        small.textContent = item.reference;
        finding.appendChild(small);
      }
      tr.appendChild(finding);
      tr.appendChild(cell(item.system));
      tr.appendChild(cell(item.category));
      tr.appendChild(cell(item.nextStep));
      tr.appendChild(cell(dateLabel(item.targetDate)));
      tr.appendChild(cell(item.estimate ? money(item.estimate) : '—'));

      const status = document.createElement('td');
      const statusBadge = document.createElement('span');
      statusBadge.className = `inspection-status inspection-status-${String(item.status || 'not-started').toLowerCase().replace(/[^a-z]+/g, '-')}`;
      statusBadge.textContent = item.status || 'Not started';
      status.appendChild(statusBadge);
      tr.appendChild(status);

      const removeCell = document.createElement('td');
      removeCell.className = 'inspection-screen-only';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'inspection-remove';
      remove.dataset.removeId = item.id;
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${item.finding}`);
      removeCell.appendChild(remove);
      tr.appendChild(removeCell);
      rows.appendChild(tr);
    });

    const total = items.reduce((sum, item) => sum + (Number(item.estimate) || 0), 0);
    if (itemCount) itemCount.textContent = String(items.length);
    if (openCount) openCount.textContent = String(items.filter(item => item.status !== 'Completed').length);
    if (estimateTotal) estimateTotal.textContent = money(total);
    if (emptyState) emptyState.hidden = items.length > 0;
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const estimate = Number(valueFor(data, 'estimate'));
    items.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      finding: valueFor(data, 'finding'),
      reference: valueFor(data, 'reference'),
      system: valueFor(data, 'system'),
      category: valueFor(data, 'category'),
      status: valueFor(data, 'status') || 'Not started',
      nextStep: valueFor(data, 'nextStep'),
      targetDate: valueFor(data, 'targetDate'),
      estimate: Number.isFinite(estimate) && estimate >= 0 ? estimate : 0
    });
    saveItems();
    render();
    form.reset();
    document.querySelector('#inspection-finding')?.focus();
  });

  rows.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-id]');
    if (!button) return;
    items = items.filter(item => item.id !== button.dataset.removeId);
    saveItems();
    render();
  });

  printButton?.addEventListener('click', () => window.print());

  exportButton?.addEventListener('click', () => {
    if (!items.length) return;
    const headings = ['Finding', 'Report reference', 'System', 'Follow-up category', 'Next step', 'Target date', 'Estimate', 'Status'];
    const csvRows = [headings, ...items.map(item => [item.finding, item.reference, item.system, item.category, item.nextStep, item.targetDate, item.estimate || '', item.status])];
    const csv = csvRows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'home-inspection-action-plan.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  clearButton?.addEventListener('click', () => {
    if (!items.length || !window.confirm('Clear every saved finding from this browser?')) return;
    items = [];
    try { localStorage.removeItem(storageKey); } catch { /* Nothing else to clear. */ }
    render();
  });

  render();
})();
