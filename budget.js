(() => {
  'use strict';

  const form = document.querySelector('#budget-form');
  if (!form) return;

  const routineInput = document.querySelector('#routine-annual');
  const projectInput = document.querySelector('#project-cost');
  const monthsInput = document.querySelector('#project-months');
  const reserveInput = document.querySelector('#reserve-annual');
  const resetButton = document.querySelector('#budget-reset');

  const totalOutput = document.querySelector('#monthly-total');
  const routineOutput = document.querySelector('#routine-monthly');
  const projectOutput = document.querySelector('#project-monthly');
  const reserveOutput = document.querySelector('#reserve-monthly');

  const defaults = {
    routine: 1200,
    project: 3000,
    months: 24,
    reserve: 1200
  };

  const asNonNegativeNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const asMonthCount = (value) => {
    const parsed = Math.round(Number(value));
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

  const calculate = () => {
    const routineMonthly = asNonNegativeNumber(routineInput?.value) / 12;
    const projectMonthly = asNonNegativeNumber(projectInput?.value) / asMonthCount(monthsInput?.value);
    const reserveMonthly = asNonNegativeNumber(reserveInput?.value) / 12;
    const total = routineMonthly + projectMonthly + reserveMonthly;

    if (routineOutput) routineOutput.textContent = formatCurrency(routineMonthly);
    if (projectOutput) projectOutput.textContent = formatCurrency(projectMonthly);
    if (reserveOutput) reserveOutput.textContent = formatCurrency(reserveMonthly);
    if (totalOutput) totalOutput.textContent = formatCurrency(total);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
  });

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', calculate);
  });

  resetButton?.addEventListener('click', () => {
    if (routineInput) routineInput.value = String(defaults.routine);
    if (projectInput) projectInput.value = String(defaults.project);
    if (monthsInput) monthsInput.value = String(defaults.months);
    if (reserveInput) reserveInput.value = String(defaults.reserve);
    calculate();
  });

  calculate();
})();
