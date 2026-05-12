const Logger = {
  log(...args) { console.log('[OJP]', ...args); },
  error(...args) { console.error('[OJP]', ...args); },
  warn(...args) { console.warn('[OJP]', ...args); },
};

const STORAGE_KEY = 'ojpSavedJobDescription';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const Storage = {
  get() {
    return new Promise((resolve, reject) => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { resolve(null); return; }
        const data = JSON.parse(raw);
        if (data.savedAt && Date.now() - data.savedAt > MAX_AGE_MS) {
          Logger.log('Saved description expired — clearing');
          localStorage.removeItem(STORAGE_KEY);
          resolve(null);
          return;
        }
        resolve(data);
      } catch (e) {
        Logger.error('localStorage read error:', e);
        reject(e);
      }
    });
  },

  set(value) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        Logger.log('✓ Saved to localStorage');
        resolve();
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          Logger.error('localStorage quota exceeded');
        } else {
          Logger.error('localStorage write error:', e);
        }
        reject(e);
      }
    });
  },
};

const Detector = {
  readDescription() {
    const selectors = [
      '.job_description', '.description', '.job-description',
      '#description', '#job-description', '.jobtext', '.jobText',
      '[class*="job-description"]', '[class*="description"]',
    ];
    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el && el.innerText && el.innerText.trim().length > 50) {
          Logger.log('Found description with selector:', selector);
          return el.innerText.trim();
        }
      } catch (e) { /* skip bad selectors */ }
    }
    Logger.warn('No description found with any selector — site HTML may have changed');
    return null;
  },

  onApplicationFormPage() {
    const path = location.pathname.toLowerCase();
    if (path.includes('/apply') || path.includes('/application')) return true;
    const hasForm = document.querySelector('form, textarea, [class*="application"]');
    return hasForm && this.readDescription() === null;
  },

  onJobListingPage() {
    return this.readDescription() !== null;
  },
};

const uiState = { sidebarOpen: false, description: null };

const UI = {
  createSidebar(description) {
    if (!description) return;
    let sidebar = document.getElementById('ojp-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = 'ojp-sidebar';
      sidebar.appendChild(this._createHeader());
      sidebar.appendChild(this._createContent(description));
      document.body.appendChild(sidebar);
      this._attachEscapeListener();
      Logger.log('Sidebar created');
      requestAnimationFrame(() => sidebar.classList.add('ojp-sidebar--open'));
    } else {
      sidebar.classList.add('ojp-sidebar--open');
    }
    uiState.sidebarOpen = true;
  },

  _createHeader() {
    const header = document.createElement('div');
    header.className = 'ojp-sidebar-header';
    const title = document.createElement('h3');
    title.className = 'ojp-sidebar-title';
    title.innerText = '📋 Job Description';
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ojp-sidebar-close';
    closeBtn.innerText = '×';
    closeBtn.title = 'Close sidebar';
    closeBtn.addEventListener('click', () => this._closeSidebar());
    header.appendChild(title);
    header.appendChild(closeBtn);
    return header;
  },

  _createContent(description) {
    const content = document.createElement('div');
    content.className = 'ojp-sidebar-content';
    content.innerText = description;
    return content;
  },

  _attachEscapeListener() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && uiState.sidebarOpen) this._closeSidebar();
    });
  },

  _closeSidebar() {
    document.getElementById('ojp-sidebar')?.classList.remove('ojp-sidebar--open');
    uiState.sidebarOpen = false;
    document.getElementById('ojp-toggle-button')?.classList.add('ojp-button--visible');
  },

  createToggleButton(description) {
    const existing = document.getElementById('ojp-toggle-button');
    if (existing) return existing;
    uiState.description = description;
    const button = document.createElement('button');
    button.id = 'ojp-toggle-button';
    button.type = 'button';
    button.innerHTML = '📋';
    button.title = 'Show/Hide job description';
    button.addEventListener('click', () => {
      if (uiState.sidebarOpen) {
        this._closeSidebar();
      } else {
        this.createSidebar(uiState.description);
        button.classList.remove('ojp-button--visible');
      }
    });
    document.body.appendChild(button);
    return button;
  },
};

const Flow = {
  async init() {
    Logger.log('Initializing on URL:', location.href);
    if (Detector.onApplicationFormPage()) {
      await this._handleApplicationFormPage();
    } else if (Detector.onJobListingPage()) {
      await this._handleJobListingPage();
    } else {
      Logger.log('Page type not recognized');
    }
  },

  async _handleJobListingPage() {
    Logger.log('On job listing page - saving description');
    const description = Detector.readDescription();
    if (description) {
      try {
        await Storage.set({ description, url: location.href, savedAt: Date.now() });
        Logger.log('✓ Saved job description');
      } catch (e) {
        Logger.error('Failed to save job description:', e);
      }
    }
    this._attachApplyListeners();
  },

  async _handleApplicationFormPage() {
    Logger.log('On application form page');
    this._attachApplyListeners();
    try {
      const stored = await Storage.get();
      Logger.log('Retrieved storage:', stored);
      if (stored && stored.description) {
        Logger.log('Found saved description - creating toggle button');
        const btn = UI.createToggleButton(stored.description);
        btn.classList.add('ojp-button--visible');
      } else {
        Logger.log('No saved description found');
      }
    } catch (e) {
      Logger.error('Failed to retrieve saved description:', e);
    }
  },

  _attachApplyListeners() {
    document.querySelectorAll('a, button, input[type="button"], input[type="submit"]').forEach((el) => {
      const text = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim();
      if (!/apply|send application|apply now/i.test(text)) return;
      if (!el.dataset.ojpListenerAttached) {
        el.addEventListener('click', () => this._onApplyClick(), { capture: true });
        el.dataset.ojpListenerAttached = 'true';
      }
    });
  },

  async _onApplyClick() {
    Logger.log('Apply clicked - saving description');
    const description = Detector.readDescription();
    if (description) {
      try {
        await Storage.set({ description, url: location.href, savedAt: Date.now() });
        Logger.log('✓ Saved description before navigation');
      } catch (e) {
        Logger.error('Failed to save description before navigation:', e);
      }
    }
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Flow.init());
} else {
  Flow.init();
}
