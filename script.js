// ============================================================
// EXPENSE LEDGER — Vue 3 (Composition API, loaded from a CDN)
//
// The old version changed the page by hand: build an HTML string,
// set innerHTML, update the totals, call render() after every change.
// With Vue you only change the data. The template in index.html
// describes what the page should look like for that data, and Vue
// updates the page for you whenever the data changes.
// ============================================================

const { createApp, ref, reactive, computed, watch } = Vue;

const STORAGE_KEY = 'expenses';

const CATEGORIES = ['Food', 'Transport', 'Housing', 'Entertainment', 'Utilities', 'Other'];

// How often a payment happens. `name` labels the toggle, `tag` labels the
// row (one-time purchases get none) and `suffix` goes after the amount.
const FREQUENCIES = {
  once: { name: 'One-time', tag: '', suffix: '' },
  monthly: { name: 'Monthly', tag: 'Monthly', suffix: '/mo' },
  yearly: { name: 'Yearly', tag: 'Yearly', suffix: '/yr' },
};

const SAMPLE_EXPENSES = [
  { id: 1, description: 'Coffee', amount: 4.5, category: 'Food', frequency: 'once' },
  { id: 2, description: 'Bus pass', amount: 45, category: 'Transport', frequency: 'monthly' },
  { id: 3, description: 'Netflix', amount: 15.99, category: 'Entertainment', frequency: 'monthly' },
];

function loadExpenses() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return SAMPLE_EXPENSES;
  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return SAMPLE_EXPENSES;
    // Expenses saved before frequencies existed count as one-time.
    return parsed.map((expense) => ({
      ...expense,
      frequency: Object.hasOwn(FREQUENCIES, expense.frequency) ? expense.frequency : 'once',
    }));
  } catch {
    // Saved data is broken — start from the samples instead.
    return SAMPLE_EXPENSES;
  }
}

function emptyDraft() {
  return { description: '', amount: '', category: 'Food', frequency: 'once' };
}

const app =createApp({
  setup() {
    // ---- State ----
    // ref() wraps a value so Vue notices when it changes.
    // In script you read/write it through `.value`; the template unwraps it for you.
    const expenses = ref(loadExpenses());
    const activeCategory = ref('All');

    // reactive() is the same idea for an object — no `.value` needed.
    // v-model in the template keeps these fields in sync with the form inputs.
    const draft = reactive(emptyDraft());

    // Template ref: Vue fills this with the <input ref="descInput"> element.
    const descInput = ref(null);

    // ---- Derived values ----
    // computed() recalculates only when something it reads changes.
    // (These replace getFilteredExpenses() and the math in the old render().)
    const filteredExpenses = computed(() =>
      activeCategory.value === 'All'
        ? expenses.value
        : expenses.value.filter((expense) => expense.category === activeCategory.value)
    );

    const totals = computed(() => {
      const sumFor = (frequency) =>
        filteredExpenses.value
          .filter((expense) => expense.frequency === frequency)
          .reduce((total, expense) => total + expense.amount, 0);

      const once = sumFor('once');
      const monthly = sumFor('monthly');
      const yearly = sumFor('yearly');
      // One-time purchases count once; monthly payments happen 12 times a year.
      return { once, monthly, yearly, perYear: once + monthly * 12 + yearly };
    });

    // ---- Saving ----
    // watch() runs whenever `expenses` changes, including items pushed into it
    // (that's what `deep: true` is for). No more remembering to call save.
    watch(
      expenses,
      (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list)),
      { deep: true, immediate: true }
    );

    // ---- Actions ----
    function addExpense() {
      const description = draft.description.trim();
      const amount = draft.amount;
      if (!description || typeof amount !== 'number' || !(amount > 0)) return;

      const nextId = Math.max(0, ...expenses.value.map((expense) => expense.id)) + 1;
      expenses.value.push({
        id: nextId,
        description,
        amount,
        category: draft.category,
        frequency: draft.frequency,
      });

      Object.assign(draft, emptyDraft());
      descInput.value.focus();
    }

    function deleteExpense(id) {
      expenses.value = expenses.value.filter((expense) => expense.id !== id);
    }

    const money = (amount) => '$' + amount.toFixed(2);

    // Everything returned here can be used in the template.
    return {
      categories: CATEGORIES,
      frequencies: FREQUENCIES,
      activeCategory,
      draft,
      descInput,
      filteredExpenses,
      totals,
      addExpense,
      deleteExpense,
      money,
    };
  },
});

app.component('expense-row', {
  props: ['expense'],
  emits: ['delete'],
  template: `
    <li class="row" :class="'cat-' + expense.category">
      <span class="dot"></span>
      <span class="desc">{{ expense.description }}</span>
      <span v-if="frequencies[expense.frequency].tag" class="freq-tag">
        {{ frequencies[expense.frequency].tag }}
      </span>
      <span class="leader"></span>
      <span class="amount">
        {{ money(expense.amount) }}<span class="per">{{ frequencies[expense.frequency].suffix }}</span>
      </span>
      <button class="delete-btn" aria-label="Delete" @click="$emit('delete', expense.id)">×</button>
    </li>
  `,


  setup() {
    return { frequencies: FREQUENCIES, money: (n) => '$' + n.toFixed(2) };
  },
});
  app.component('category-filter', {
    props: {
      categories: {type: Array, required: true},
      selected: {type: String, required: true},
    },
    emits: ['select'],
    template: `
      <div class="filter-bar">
        <button
          v-for="category in ['All', ...categories]"
          :key="category"
          class="chip"
          :class="{ active: selected === category }"
          @click="$emit('select', category)"
        >
          {{ category }}
        </button>
      </div>
    `,
});

app.mount('#app');
