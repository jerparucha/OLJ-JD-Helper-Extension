import { Logger } from './utils/logger.js';

const state = {
  sidebarOpen: false,
  description: null,
};

export const UI = {
  createSidebar(description) {
    if (!description) return;

    let sidebar = document.getElementById('ojp-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = 'ojp-sidebar';
      sidebar.appendChild(this._createSidebarHeader());
      sidebar.appendChild(this._createSidebarContent(description));
      document.body.appendChild(sidebar);
      this._attachEscapeListener();
      Logger.log('Sidebar created and added to page');
      requestAnimationFrame(() => sidebar.classList.add('ojp-sidebar--open'));
    } else {
      sidebar.classList.add('ojp-sidebar--open');
    }
    state.sidebarOpen = true;
  },

  _createSidebarHeader() {
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

  _createSidebarContent(description) {
    const content = document.createElement('div');
    content.className = 'ojp-sidebar-content';
    content.innerText = description;
    return content;
  },

  _attachEscapeListener() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.sidebarOpen) this._closeSidebar();
    });
  },

  _closeSidebar() {
    document.getElementById('ojp-sidebar')?.classList.remove('ojp-sidebar--open');
    state.sidebarOpen = false;
    document.getElementById('ojp-toggle-button')?.classList.add('ojp-button--visible');
  },

  createToggleButton(description) {
    if (document.getElementById('ojp-toggle-button')) {
      return document.getElementById('ojp-toggle-button');
    }

    state.description = description;

    const button = document.createElement('button');
    button.id = 'ojp-toggle-button';
    button.type = 'button';
    button.innerHTML = '📋';
    button.title = 'Show/Hide job description';

    button.addEventListener('click', () => {
      if (state.sidebarOpen) {
        this._closeSidebar();
      } else {
        this.createSidebar(state.description);
        button.classList.remove('ojp-button--visible');
      }
    });

    document.body.appendChild(button);
    return button;
  },
};
