/**
 * класс для работы с localStorage
 */

import { CONFIG } from './config.js';

export class Storage {
    static save(state) {
        try {
            const data = {
                currentLocation: state.currentLocation,
                additionalCities: state.additionalCities
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('ошибка сохранения:', e);
        }
    }

    static load() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('ошибка загрузки:', e);
        }
        return { currentLocation: null, additionalCities: [] };
    }

    static clear() {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
    }

    static saveTheme(theme) {
        localStorage.setItem(CONFIG.THEME_KEY, theme);
    }

    static loadTheme() {
        return localStorage.getItem(CONFIG.THEME_KEY) || 'light';
    }
}
