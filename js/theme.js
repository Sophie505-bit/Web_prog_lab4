/**
 * класс управления темой
 */

import { Storage } from './storage.js';

export class Theme {
    constructor(state, dom) {
        this.state = state;
        this.dom = dom;
    }

    init() {
        this.state.theme = Storage.loadTheme();
        this.apply();
    }

    toggle() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        Storage.saveTheme(this.state.theme);
        this.apply();
        this.updateIcon();
    }

    apply() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
    }

    updateIcon() {
        const icon = this.dom.themeToggle?.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = this.state.theme === 'light' ? '🌙' : '☀️';
        }
    }
}
