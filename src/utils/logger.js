export const Logger = {
  log(...args) {
    console.log('[OJP]', ...args);
  },
  error(...args) {
    console.error('[OJP]', ...args);
  },
  warn(...args) {
    console.warn('[OJP]', ...args);
  }
};
