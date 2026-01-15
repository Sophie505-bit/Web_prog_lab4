/**
 * класс построения dom
 */

import { Utils } from './utils.js';

export class DOMBuilder {
    constructor(state, theme, weather, storage, handlers) {
        this.state = state;
        this.theme = theme;
        this.weather = weather;
        this.storage = storage;
        this.handlers = handlers;
        this.dom = {};
    }

    build() {
        const app = document.getElementById('app');
        Utils.clearChildren(app);
        
        const appContainer = Utils.createElement('div', { className: 'app-container' });
        
        appContainer.appendChild(this.buildHeader());
        appContainer.appendChild(this.buildModal());
        appContainer.appendChild(this.buildMain());
        appContainer.appendChild(this.buildFooter());
        
        app.appendChild(appContainer);
        
        return this.dom;
    }

    buildHeader() {
        const header = Utils.createElement('header', { className: 'header' });
        
        header.appendChild(Utils.createElement('h1', { textContent: '🌤️ Прогноз погоды' }));
        
        const controls = Utils.createElement('div', { className: 'header-controls' });
        
        this.dom.themeToggle = Utils.createElement('button', {
            className: 'btn btn-icon',
            attributes: { title: 'Сменить тему' },
            events: { click: () => this.theme.toggle() }
        });
        this.dom.themeToggle.appendChild(Utils.createElement('span', {
            className: 'theme-icon',
            textContent: this.state.theme === 'light' ? '🌙' : '☀️'
        }));
        
        this.dom.refreshBtn = Utils.createElement('button', {
            className: 'btn btn-refresh',
            attributes: { title: 'Обновить' },
            events: { click: () => this.weather.refreshAll() }
        });
        this.dom.refreshBtn.appendChild(Utils.createElement('span', { className: 'refresh-icon', textContent: '↻' }));
        this.dom.refreshBtn.appendChild(document.createTextNode(' Обновить'));
        
        const resetBtn = Utils.createElement('button', {
            className: 'btn btn-reset',
            attributes: { title: 'Сбросить данные' },
            textContent: '🗑️',
            events: {
                click: () => {
                    if (confirm('Вы уверены? Все сохранённые города будут удалены.')) {
                        this.storage.clear();
                        location.reload();
                    }
                }
            }
        });
        
        controls.appendChild(this.dom.themeToggle);
        controls.appendChild(this.dom.refreshBtn);
        controls.appendChild(resetBtn);
        
        header.appendChild(controls);
        
        return header;
    }

    buildModal() {
        this.dom.modal = Utils.createElement('div', { className: 'modal', id: 'cityModal' });
        
        const content = Utils.createElement('div', { className: 'modal-content' });
        
        content.appendChild(Utils.createElement('h2', { textContent: 'Введите город' }));
        content.appendChild(Utils.createElement('p', {
            textContent: 'Геолокация недоступна. Введите название вашего города для получения прогноза погоды.'
        }));
        
        const inputWrapper = Utils.createElement('div', { className: 'input-wrapper' });
        
        this.dom.modalCityInput = Utils.createElement('input', {
            attributes: { type: 'text', placeholder: 'Начните вводить название города...', autocomplete: 'off' }
        });
        
        this.dom.modalCitySuggestions = Utils.createElement('div', { className: 'suggestions-list', id: 'modalCitySuggestions' });
        this.dom.modalCityError = Utils.createElement('span', { className: 'error-message', id: 'modalCityError' });
        
        inputWrapper.appendChild(this.dom.modalCityInput);
        inputWrapper.appendChild(this.dom.modalCitySuggestions);
        inputWrapper.appendChild(this.dom.modalCityError);
        
        this.dom.modalSubmitBtn = Utils.createElement('button', {
            className: 'btn btn-primary',
            textContent: 'Получить погоду',
            events: { click: () => this.handlers.handleModalSubmit() }
        });
        
        content.appendChild(inputWrapper);
        content.appendChild(this.dom.modalSubmitBtn);
        
        this.dom.modal.appendChild(content);
        
        return this.dom.modal;
    }

    buildMain() {
        const main = Utils.createElement('main', { className: 'main-content' });
        
        main.appendChild(this.buildCurrentLocationSection());
        main.appendChild(this.buildAddCitySection());
        main.appendChild(this.buildAdditionalCitiesSection());
        
        return main;
    }

    buildCurrentLocationSection() {
        this.dom.currentLocationSection = Utils.createElement('section', {
            className: 'weather-section current-location',
            id: 'currentLocationSection'
        });
        
        const header = Utils.createElement('div', { className: 'section-header' });
        this.dom.currentLocationTitle = Utils.createElement('h2', {
            textContent: '📍 Текущее местоположение',
            id: 'currentLocationTitle'
        });
        header.appendChild(this.dom.currentLocationTitle);
        
        this.dom.currentLocationWeather = Utils.createElement('div', {
            className: 'weather-content',
            id: 'currentLocationWeather'
        });
        
        this.dom.currentLocationSection.appendChild(header);
        this.dom.currentLocationSection.appendChild(this.dom.currentLocationWeather);
        
        return this.dom.currentLocationSection;
    }

    buildAddCitySection() {
        const section = Utils.createElement('section', { className: 'add-city-section' });
        
        section.appendChild(Utils.createElement('h2', { textContent: '➕ Добавить город' }));
        
        const form = Utils.createElement('div', { className: 'add-city-form' });
        const inputWrapper = Utils.createElement('div', { className: 'input-wrapper' });
        
        this.dom.addCityInput = Utils.createElement('input', {
            id: 'addCityInput',
            attributes: { type: 'text', placeholder: 'Введите название города...', autocomplete: 'off' }
        });
        
        this.dom.addCitySuggestions = Utils.createElement('div', { className: 'suggestions-list', id: 'addCitySuggestions' });
        this.dom.addCityError = Utils.createElement('span', { className: 'error-message', id: 'addCityError' });
        
        inputWrapper.appendChild(this.dom.addCityInput);
        inputWrapper.appendChild(this.dom.addCitySuggestions);
        inputWrapper.appendChild(this.dom.addCityError);
        
        this.dom.addCityBtn = Utils.createElement('button', {
            className: 'btn btn-primary',
            textContent: 'Добавить',
            id: 'addCityBtn',
            events: { click: () => this.handlers.handleAddCity() }
        });
        
        form.appendChild(inputWrapper);
        form.appendChild(this.dom.addCityBtn);
        
        section.appendChild(form);
        
        return section;
    }

    buildAdditionalCitiesSection() {
        const section = Utils.createElement('section', { className: 'additional-cities', id: 'additionalCities' });
        
        section.appendChild(Utils.createElement('h2', { textContent: '🏙️ Другие города' }));
        
        this.dom.citiesContainer = Utils.createElement('div', { className: 'cities-container', id: 'citiesContainer' });
        
        section.appendChild(this.dom.citiesContainer);
        
        return section;
    }

    buildFooter() {
        const footer = Utils.createElement('footer', { className: 'footer' });
        const p = Utils.createElement('p');
        
        p.appendChild(document.createTextNode('Данные предоставлены '));
        p.appendChild(Utils.createElement('a', {
            textContent: 'Open-Meteo',
            attributes: { href: 'https://open-meteo.com/', target: '_blank' }
        }));
        
        footer.appendChild(p);
        
        return footer;
    }
}
