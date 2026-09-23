// ============================================================
// EXPENSE TRACKER — fill in the 5 TODOs below.
// Everything else (DOM refs, event listeners) is wired up for you.
// Open index.html in a browser and open the console to catch errors.
// ============================================================

(function () {
  'use strict';

  // ---- State ----
  let expenses = [
    { id: 1, description: 'Coffee', amount: 4.5, category: 'Food' },
    { id: 2, description: 'Bus pass', amount: 45, category: 'Transport' },
    { id: 3, description: 'Netflix', amount: 15.99, category: 'Entertainment' },
  ];
  let nextId = 4;
  let activeCategory = 'All';

  // ---- DOM refs ----
  const form = document.getElementById('expense-form');
  const descInput = document.getElementById('description');
  const amountInput = document.getElementById('amount');
  const categorySelect = document.getElementById('category');
  const listEl = document.getElementById('expense-list');
  const totalEl = document.getElementById('total');
  const filterBar = document.getElementById('filter-bar');
  const emptyState = document.getElementById('empty-state');

  /**
   * TODO 1 — Return a new array containing only the expenses whose
   * `category` matches `activeCategory`. If activeCategory is 'All',
   * return every expense.
   *
   * Practice: Array.prototype.filter
   */
  function getFilteredExpenses() {
   if (activeCategory === 'All') {
    return expenses;
  }
  return expenses.filter(expense => expense.category === activeCategory);
  }
  /**
   * TODO 2 — Given an array of expenses, return the sum of their
   * `amount` values as a single number.
   *
   * Practice: Array.prototype.reduce
   */
  function calculateTotal(expenseList) {
    return expenseList.reduce((total, expense) => total + expense.amount, 0);
  }

  /**
   * TODO 3 — Given an array of expenses, return one HTML string built
   * from a template literal per item, joined together. Destructure each
   * expense's fields (id, description, amount, category) rather than
   * writing expense.id / expense.description everywhere.
   *
   * Practice: Array.prototype.map, destructuring, template literals
   *
   * Match this shape so the CSS and delete button work:
   *
   *   <li class="row cat-${category}" data-id="${id}">
   *     <span class="dot"></span>
   *     <span class="desc">${description}</span>
   *     <span class="leader"></span>
   *     <span class="amount">$${amount.toFixed(2)}</span>
   *     <button class="delete-btn" data-id="${id}" aria-label="Delete">×</button>
   *   </li>
   */
  function buildExpenseListHTML(expenseList) {
    return expenseList.map(({ id, description, amount, category }) => `
      <li class="row cat-${category}" data-id="${id}">
        <span class="dot"></span>
        <span class="desc">${description}</span>
        <span class="leader"></span>
        <span class="amount">$${amount.toFixed(2)}</span>
        <button class="delete-btn" data-id="${id}" aria-label="Delete">×</button>
      </li>
    `).join('');
  }

  // Re-renders the list + total from current state.
  // You don't need to touch this — it just calls the functions above.
  function render() {
    const expensesJSON = JSON.stringify(expenses);
    localStorage.setItem('expenses', expensesJSON);
    const filtered = getFilteredExpenses();
    listEl.innerHTML = buildExpenseListHTML(filtered);
    totalEl.textContent = '$' + calculateTotal(filtered).toFixed(2);
    emptyState.hidden = filtered.length !== 0;
  }

  /**
   * TODO 4 — Add a new expense object to the `expenses` array, then
   * call render(). Give it a unique id using `nextId`, then increment
   * `nextId` so the next one doesn't collide.
   */
  function addExpense(description, amount, category) {
    if (!description || Number.isNaN(amount) || amount <= 0) return;
    const newExpense = {
      id: nextId++,
      description,
      amount,
      category
    };
    expenses.push(newExpense);
    render();
  }

  /**
   * TODO 5 — Remove the expense whose id matches the given id from
   * `expenses`, then call render().
   *
   * Practice: Array.prototype.filter
   */
  function deleteExpense(id) {
    expenses = expenses.filter((expense) => expense.id !== id);
    render();
  }

  // ---- Event wiring (done for you) ----

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = descInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    if (!description || Number.isNaN(amount) || amount <= 0) return;
    addExpense(description, amount, category);
    form.reset();
    descInput.focus();
  });

  // Event delegation: one listener on the list handles every delete
  // button, including ones added after the page loaded.
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;
    deleteExpense(Number(btn.dataset.id));
  });

  filterBar.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    activeCategory = chip.dataset.category;
    [...filterBar.children].forEach((c) => c.classList.toggle('active', c === chip));
    render();
  });

  render();
})();
