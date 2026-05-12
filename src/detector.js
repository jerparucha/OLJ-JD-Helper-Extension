import { Logger } from './utils/logger.js';

export const Detector = {
  readDescription() {
    const selectors = [
      '.job_description',
      '.description',
      '.job-description',
      '#description',
      '#job-description',
      '.jobtext',
      '.jobText',
      '[class*="job-description"]',
      '[class*="description"]'
    ];

    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        if (element && element.innerText && element.innerText.trim().length > 50) {
          Logger.log('Found description with selector:', selector);
          return element.innerText.trim();
        }
      } catch (e) {
        // Skip bad selectors
      }
    }

    Logger.warn('No description found with any selector — site HTML may have changed');
    return null;
  },

  isFormPage() {
    return document.querySelector('form') ||
           document.querySelector('textarea') ||
           document.querySelector('[class*="application"]');
  },

  onJobListingPage() {
    return this.readDescription() !== null;
  },

  onApplicationFormPage() {
    const path = location.pathname.toLowerCase();
    if (path.includes('/apply') || path.includes('/application')) return true;
    return this.isFormPage() && !this.onJobListingPage();
  }
};
