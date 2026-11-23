/**
 * OmniCalc - Comprehensive Calculator Engine & UI Controller
 */

class Calculator {
  constructor(displayElement, expressionElement, memoryBadgeElement) {
    this.displayElement = displayElement;
    this.expressionElement = expressionElement;
    this.memoryBadgeElement = memoryBadgeElement;
    
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.justCalculated = false;
    this.memoryValue = 0;
    
    this.history = this.loadHistory();
    this.soundEnabled = localStorage.getItem('omniCalc_sound') !== 'false';
    this.audioCtx = null;
    
    this.updateDisplay();
    this.updateMemoryIndicator();
  }

  // --- Audio Feedback (Web Audio API Synthesizer) ---
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playClickSound(freq = 600, duration = 0.03, type = 'sine') {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked until user interaction
    }
  }

  // --- Display & Formatting ---
  formatNumber(numberString) {
    if (numberString === '' || numberString === null || numberString === undefined) return '';
    if (numberString === 'Error' || numberString.includes('Cannot')) return numberString;
    
    const parts = numberString.toString().split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    const isNegative = integerPart.startsWith('-');
    if (isNegative) {
      integerPart = integerPart.substring(1);
    }

    if (integerPart !== '') {
      integerPart = Number(integerPart).toLocaleString('en-US');
      if (isNegative) {
        integerPart = '-' + integerPart;
      }
    } else if (isNegative) {
      integerPart = '-0';
    }

    if (decimalPart !== undefined) {
      return `${integerPart}.${decimalPart}`;
    }
    return integerPart;
  }

  adjustFontSize() {
    const length = this.currentOperand.length;
    if (length > 13) {
      this.displayElement.style.fontSize = '1.45rem';
    } else if (length > 10) {
      this.displayElement.style.fontSize = '1.8rem';
    } else if (length > 7) {
      this.displayElement.style.fontSize = '2.1rem';
    } else {
      this.displayElement.style.fontSize = '2.35rem';
    }
  }

  updateDisplay() {
    this.displayElement.textContent = this.formatNumber(this.currentOperand) || '0';
    this.adjustFontSize();

    if (this.operation != null && this.previousOperand !== '') {
      this.expressionElement.textContent = `${this.formatNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.expressionElement.innerHTML = '&nbsp;';
    }

    // Highlight active operator button
    document.querySelectorAll('.op-key').forEach(button => {
      if (this.operation && button.dataset.op === this.operation && !this.justCalculated) {
        button.classList.add('active-operator');
      } else {
        button.classList.remove('active-operator');
      }
    });
  }

  // --- Calculator Operations ---
  appendDigit(digit) {
    this.playClickSound(700, 0.02);

    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    if (this.justCalculated) {
      this.currentOperand = '';
      this.previousOperand = '';
      this.operation = null;
      this.justCalculated = false;
    }

    if (this.currentOperand === '0' && digit !== '0') {
      this.currentOperand = digit.toString();
    } else if (this.currentOperand === '0' && digit === '0') {
      return;
    } else {
      // Limit operand length to 15 digits
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15) return;
      this.currentOperand += digit.toString();
    }

    this.updateDisplay();
  }

  appendDecimal() {
    this.playClickSound(650, 0.02);

    if (this.shouldResetScreen || this.justCalculated) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      this.justCalculated = false;
    }

    if (!this.currentOperand.includes('.')) {
      this.currentOperand += '.';
    }
    this.updateDisplay();
  }

  negate() {
    this.playClickSound(600, 0.025);
    if (this.currentOperand === '0' || this.currentOperand === '') return;
    
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.substring(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
    this.updateDisplay();
  }

  percent() {
    this.playClickSound(650, 0.025);
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    if (this.previousOperand !== '' && this.operation) {
      // Relative percentage: e.g. 200 + 10% = 200 + 20
      const prev = parseFloat(this.previousOperand);
      if (this.operation === '+' || this.operation === '−') {
        this.currentOperand = (prev * (current / 100)).toString();
      } else {
        this.currentOperand = (current / 100).toString();
      }
    } else {
      this.currentOperand = (current / 100).toString();
    }
    this.updateDisplay();
  }

  deleteDigit() {
    this.playClickSound(500, 0.03);
    if (this.shouldResetScreen || this.justCalculated) return;
    
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  clear() {
    this.playClickSound(450, 0.04);
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.justCalculated = false;
    this.updateDisplay();
  }

  setOperation(op) {
    this.playClickSound(800, 0.03);

    if (this.currentOperand === 'Error' || this.currentOperand.includes('Cannot')) {
      this.clear();
      return;
    }

    if (this.previousOperand !== '' && !this.shouldResetScreen) {
      this.calculate();
    }

    this.operation = op;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.justCalculated = false;
    this.updateDisplay();
  }

  calculate() {
    this.playClickSound(950, 0.04);

    if (this.operation == null || this.previousOperand === '') return;

    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    let computation;
    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '−':
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Cannot divide by zero';
          this.expressionElement.textContent = `${this.formatNumber(this.previousOperand)} ${this.operation} 0`;
          this.operation = null;
          this.previousOperand = '';
          this.shouldResetScreen = true;
          this.justCalculated = true;
          this.updateDisplay();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Resolve floating-point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004)
    const roundedResult = parseFloat(Number(computation).toPrecision(12));
    const resultString = roundedResult.toString();

    // Save to history
    const expressionString = `${this.formatNumber(this.previousOperand)} ${this.operation} ${this.formatNumber(this.currentOperand)}`;
    this.addHistoryEntry(expressionString, resultString);

    this.expressionElement.textContent = `${expressionString} =`;
    this.currentOperand = resultString;
    this.operation = null;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.justCalculated = true;

    this.updateDisplay();
  }

  // --- Memory Functions ---
  updateMemoryIndicator() {
    if (this.memoryValue !== 0) {
      this.memoryBadgeElement.classList.remove('hidden');
    } else {
      this.memoryBadgeElement.classList.add('hidden');
    }
  }

  memoryClear() {
    this.playClickSound(550, 0.02);
    this.memoryValue = 0;
    this.updateMemoryIndicator();
    showToast('Memory Cleared (MC)');
  }

  memoryRecall() {
    this.playClickSound(750, 0.02);
    this.currentOperand = this.memoryValue.toString();
    this.shouldResetScreen = true;
    this.updateDisplay();
    showToast(`Memory Recalled: ${this.memoryValue}`);
  }

  memoryAdd() {
    this.playClickSound(800, 0.02);
    const val = parseFloat(this.currentOperand);
    if (!isNaN(val)) {
      this.memoryValue += val;
      this.updateMemoryIndicator();
      showToast(`Added to Memory: ${val}`);
    }
  }

  memorySubtract() {
    this.playClickSound(800, 0.02);
    const val = parseFloat(this.currentOperand);
    if (!isNaN(val)) {
      this.memoryValue -= val;
      this.updateMemoryIndicator();
      showToast(`Subtracted from Memory: ${val}`);
    }
  }

  // --- History Management ---
  loadHistory() {
    try {
      const saved = localStorage.getItem('omniCalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('omniCalc_history', JSON.stringify(this.history));
    } catch (e) {}
  }

  addHistoryEntry(expression, result) {
    const entry = {
      id: Date.now(),
      expression,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(entry);
    if (this.history.length > 30) this.history.pop();
    this.saveHistory();
    renderHistory(this.history);
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
    renderHistory(this.history);
    showToast('History cleared');
  }

  restoreHistoryItem(item) {
    this.currentOperand = item.result;
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = true;
    this.justCalculated = true;
    this.updateDisplay();
    this.expressionElement.textContent = `Ans: ${item.expression}`;
    showToast(`Restored: ${item.result}`);
  }
}

// ==========================================================================
// UI Elements & State Initializer
// ==========================================================================

const displayElement = document.getElementById('resultDisplay');
const expressionElement = document.getElementById('expressionDisplay');
const memoryBadgeElement = document.getElementById('memoryIndicator');

const calc = new Calculator(displayElement, expressionElement, memoryBadgeElement);

// Keypad Event Delegation
const keypad = document.querySelector('.keypad-grid');
keypad.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  switch (action) {
    case 'digit':
      calc.appendDigit(btn.dataset.val);
      break;
    case 'decimal':
      calc.appendDecimal();
      break;
    case 'operator':
      calc.setOperation(btn.dataset.op);
      break;
    case 'calculate':
      calc.calculate();
      break;
    case 'clear':
      calc.clear();
      break;
    case 'backspace':
      calc.deleteDigit();
      break;
    case 'percent':
      calc.percent();
      break;
    case 'negate':
      calc.negate();
      break;
  }
});

// Memory Row Delegation
document.querySelector('.memory-row').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const action = btn.dataset.action;
  switch (action) {
    case 'mc': calc.memoryClear(); break;
    case 'mr': calc.memoryRecall(); break;
    case 'm-plus': calc.memoryAdd(); break;
    case 'm-minus': calc.memorySubtract(); break;
  }
});

// ==========================================================================
// Keyboard Event Listener
// ==========================================================================

window.addEventListener('keydown', (e) => {
  // Ignore if user is inside an input or modal is open with input
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  const key = e.key;

  // Shortcuts modal toggle
  if (key === '?') {
    e.preventDefault();
    toggleShortcutsModal();
    return;
  }

  // History drawer toggle
  if (key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    toggleHistoryDrawer();
    return;
  }

  // Close modals/drawers on Escape if open
  const modal = document.getElementById('shortcutsModal');
  const drawer = document.getElementById('historyDrawer');
  if (key === 'Escape') {
    if (!modal.classList.contains('hidden')) {
      toggleShortcutsModal(false);
      return;
    }
    if (drawer.classList.contains('open')) {
      toggleHistoryDrawer(false);
      return;
    }
  }

  // Number Keys
  if (key >= '0' && key <= '9') {
    calc.appendDigit(key);
    triggerButtonFeedback(`[data-val="${key}"]`);
    return;
  }

  // Decimal Point
  if (key === '.' || key === ',') {
    calc.appendDecimal();
    triggerButtonFeedback('[data-action="decimal"]');
    return;
  }

  // Operations
  if (key === '+') {
    calc.setOperation('+');
    triggerButtonFeedback('[data-op="+"]');
    return;
  }
  if (key === '-') {
    calc.setOperation('−');
    triggerButtonFeedback('[data-op="−"]');
    return;
  }
  if (key === '*' || key === 'x' || key === 'X') {
    calc.setOperation('×');
    triggerButtonFeedback('[data-op="×"]');
    return;
  }
  if (key === '/') {
    e.preventDefault();
    calc.setOperation('÷');
    triggerButtonFeedback('[data-op="÷"]');
    return;
  }

  // Calculate
  if (key === 'Enter' || key === '=') {
    e.preventDefault();
    calc.calculate();
    triggerButtonFeedback('[data-action="calculate"]');
    return;
  }

  // Clear
  if (key === 'Escape' || key.toLowerCase() === 'c') {
    calc.clear();
    triggerButtonFeedback('[data-action="clear"]');
    return;
  }

  // Backspace
  if (key === 'Backspace') {
    calc.deleteDigit();
    triggerButtonFeedback('[data-action="backspace"]');
    return;
  }

  // Percent
  if (key === '%') {
    calc.percent();
    triggerButtonFeedback('[data-action="percent"]');
    return;
  }
});

function triggerButtonFeedback(selector) {
  const btn = document.querySelector(selector);
  if (btn) {
    btn.classList.add('is-pressed');
    setTimeout(() => btn.classList.remove('is-pressed'), 120);
  }
}

// ==========================================================================
// History Drawer Logic
// ==========================================================================

const historyDrawer = document.getElementById('historyDrawer');
const historyToggle = document.getElementById('historyToggle');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const historyList = document.getElementById('historyList');
const historyBadge = document.getElementById('historyBadge');
const appContainer = document.querySelector('.app-container');

function toggleHistoryDrawer(forceState) {
  const isOpen = forceState !== undefined ? forceState : !historyDrawer.classList.contains('open');
  if (isOpen) {
    historyDrawer.classList.add('open');
    historyDrawer.setAttribute('aria-hidden', 'false');
    appContainer.classList.add('has-history-open');
  } else {
    historyDrawer.classList.remove('open');
    historyDrawer.setAttribute('aria-hidden', 'true');
    appContainer.classList.remove('has-history-open');
  }
}

historyToggle.addEventListener('click', () => toggleHistoryDrawer());
closeHistoryBtn.addEventListener('click', () => toggleHistoryDrawer(false));
clearHistoryBtn.addEventListener('click', () => calc.clearHistory());

function renderHistory(items) {
  if (items.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>No calculations yet</p>
        <span class="subtext">Your calculation results will appear here</span>
      </div>
    `;
    historyBadge.classList.add('hidden');
    return;
  }

  historyBadge.textContent = items.length;
  historyBadge.classList.remove('hidden');

  historyList.innerHTML = items.map(item => `
    <div class="history-item" data-id="${item.id}" role="button" tabindex="0" title="Click to recall result">
      <div class="history-expression">${item.expression} =</div>
      <div class="history-result">${calc.formatNumber(item.result)}</div>
    </div>
  `).join('');
}

historyList.addEventListener('click', (e) => {
  const itemEl = e.target.closest('.history-item');
  if (!itemEl) return;
  const id = Number(itemEl.dataset.id);
  const item = calc.history.find(h => h.id === id);
  if (item) {
    calc.restoreHistoryItem(item);
  }
});

// Initial render of history
renderHistory(calc.history);

// ==========================================================================
// Theme Management
// ==========================================================================

const themeToggle = document.getElementById('themeToggle');
const sunIcon = themeToggle.querySelector('.sun-icon');
const moonIcon = themeToggle.querySelector('.moon-icon');

function getPreferredTheme() {
  const saved = localStorage.getItem('omniCalc_theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('omniCalc_theme', theme);

  if (theme === 'light') {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`Switched to ${next} theme`);
});

applyTheme(getPreferredTheme());

// ==========================================================================
// Sound Effects Toggle
// ==========================================================================

const soundToggle = document.getElementById('soundToggle');
const soundOnIcon = soundToggle.querySelector('.sound-on-icon');
const soundOffIcon = soundToggle.querySelector('.sound-off-icon');

function updateSoundIcon() {
  if (calc.soundEnabled) {
    soundOnIcon.classList.remove('hidden');
    soundOffIcon.classList.add('hidden');
  } else {
    soundOnIcon.classList.add('hidden');
    soundOffIcon.classList.remove('hidden');
  }
}

soundToggle.addEventListener('click', () => {
  calc.soundEnabled = !calc.soundEnabled;
  localStorage.setItem('omniCalc_sound', calc.soundEnabled);
  updateSoundIcon();
  showToast(calc.soundEnabled ? 'Sound enabled' : 'Sound muted');
  if (calc.soundEnabled) calc.playClickSound(800, 0.05);
});

updateSoundIcon();

// ==========================================================================
// Copy to Clipboard & Toast System
// ==========================================================================

const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');
let toastTimeout;

copyBtn.addEventListener('click', async () => {
  const text = calc.currentOperand;
  if (!text || text === 'Error' || text.includes('Cannot')) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast('Result copied to clipboard!');
  } catch (err) {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Result copied to clipboard!');
  }
});

function showToast(message, duration = 2200) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.remove('hidden');

  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

// ==========================================================================
// Keyboard Shortcuts Modal
// ==========================================================================

const shortcutsModal = document.getElementById('shortcutsModal');
const closeModalBtn = document.getElementById('closeModalBtn');

function toggleShortcutsModal(forceState) {
  const shouldOpen = forceState !== undefined ? forceState : shortcutsModal.classList.contains('hidden');
  if (shouldOpen) {
    shortcutsModal.classList.remove('hidden');
  } else {
    shortcutsModal.classList.add('hidden');
  }
}

closeModalBtn.addEventListener('click', () => toggleShortcutsModal(false));
shortcutsModal.addEventListener('click', (e) => {
  if (e.target === shortcutsModal) toggleShortcutsModal(false);
});
