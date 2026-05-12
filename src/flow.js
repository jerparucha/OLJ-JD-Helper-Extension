import { Logger } from './utils/logger.js';
import { Storage } from './utils/storage.js';
import { Detector } from './detector.js';
import { UI } from './ui.js';

export const Flow = {
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
    Logger.log('On application form page - checking for saved description');
    this._attachApplyListeners();

    try {
      const data = await Storage.get();
      const stored = data[Storage.getKey()];
      Logger.log('Retrieved storage:', stored);
      if (stored && stored.description) {
        Logger.log('Found saved description - creating toggle button');
        const toggleBtn = UI.createToggleButton(stored.description);
        toggleBtn.classList.add('ojp-button--visible');
      } else {
        Logger.log('No saved description found');
      }
    } catch (e) {
      Logger.error('Failed to retrieve saved description:', e);
    }
  },

  _attachApplyListeners() {
    const buttons = Array.from(document.querySelectorAll('a, button, input[type="button"], input[type="submit"]'));
    buttons.forEach((element) => {
      const text = (element.innerText || element.value || element.getAttribute('aria-label') || '').trim();
      if (!/apply|send application|apply now/i.test(text)) return;
      if (!element.dataset.ojpListenerAttached) {
        element.addEventListener('click', () => this._onApplyClick(), { capture: true });
        element.dataset.ojpListenerAttached = 'true';
      }
    });
  },

  async _onApplyClick() {
    Logger.log('Apply button clicked - saving description');
    const description = Detector.readDescription();
    if (description) {
      try {
        await Storage.set({ description, url: location.href, savedAt: Date.now() });
        Logger.log('✓ Saved description before navigation');
      } catch (e) {
        Logger.error('Failed to save description before navigation:', e);
      }
    }
  }
};
