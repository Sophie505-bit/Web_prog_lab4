/**
 * класс ui компонентов
 */

import { Utils } from './utils.js';
import { CONFIG, WEATHER_DATA } from './config.js';

export class UI {
    constructor(state, dom) {
        this.state = state;
        this.dom = dom;
        this.weather = null;
    }

    showLoading(container) {
        Utils.clearChildren(container);
        
        const loadingState = Utils.createElement('div', { className: 'loading-state' });
        const spinner = Utils.createElement('div', { className: 'spinner' });
        const text = Utils.createElement('p', { textContent: 'Загрузка данных о погоде...' });
        
        loadingState.appendChild(spinner);
        loadingState.appendChild(text);
        container.appendChild(loadingState);
    }

    showError(container, message) {
        Utils.clearChildren(container);
        
        const errorState = Utils.createElement('div', { className: 'error-state' });
        const icon = Utils.createElement('div', { className: 'error-icon', textContent: '⚠️' });
        const text = Utils.createElement('p', { textContent: message });
        
        errorState.appendChild(icon);
        errorState.appendChild(text);
        container.appendChild(errorState);
    }

    showModal() {
        this.dom.modal.classList.add('active');
        this.dom.currentLocationSection.style.display = 'none';
        setTimeout(() => this.dom.modalCityInput.focus(), 100);
    }

    hideModal() {
        this.dom.modal.classList.remove('active');
        this.dom.currentLocationSection.style.display = 'block';
    }

    createWeatherCard(dateStr, index, daily) {
        const date = new Date(dateStr);
        const dayName = index === 0 ? 'Сегодня' : WEATHER_DATA.daysShort[date.getDay()];
        const weatherCode = daily.weather_code[index];
        const icon = WEATHER_DATA.icons[weatherCode] || '🌡️';
        const description = WEATHER_DATA.descriptions[weatherCode] || 'Н/Д';
        const maxTemp = Math.round(daily.temperature_2m_max[index]);
        const minTemp = Math.round(daily.temperature_2m_min[index]);
        const precipitation = daily.precipitation_probability_max[index];
        const windSpeed = Math.round(daily.wind_speed_10m_max[index]);
        
        const card = Utils.createElement('article', {
            className: `weather-card ${index === 0 ? 'today' : ''}`
        });
        
        card.appendChild(Utils.createElement('div', { className: 'day-name', textContent: dayName }));
        card.appendChild(Utils.createElement('div', { className: 'date', textContent: Utils.formatDate(dateStr, WEATHER_DATA.months) }));
        card.appendChild(Utils.createElement('div', { className: 'weather-icon', textContent: icon }));
        card.appendChild(Utils.createElement('div', { className: 'temperature', textContent: `${maxTemp}°C` }));
        card.appendChild(Utils.createElement('div', { className: 'temp-range', textContent: `↓${minTemp}° / ↑${maxTemp}°` }));
        card.appendChild(Utils.createElement('div', { className: 'weather-desc', textContent: description }));
        
        const detailsEl = Utils.createElement('div', { className: 'weather-details' });
        
        const precipItem = Utils.createElement('div', { className: 'weather-detail-item' });
        precipItem.appendChild(Utils.createElement('span', { textContent: '💧 Осадки:' }));
        precipItem.appendChild(Utils.createElement('span', { textContent: `${precipitation}%` }));
        
        const windItem = Utils.createElement('div', { className: 'weather-detail-item' });
        windItem.appendChild(Utils.createElement('span', { textContent: '💨 Ветер:' }));
        windItem.appendChild(Utils.createElement('span', { textContent: `${windSpeed} км/ч` }));
        
        detailsEl.appendChild(precipItem);
        detailsEl.appendChild(windItem);
        card.appendChild(detailsEl);
        
        return card;
    }

    renderWeather(data, container) {
        Utils.clearChildren(container);
        
        const { daily } = data;
        const days = daily.time.slice(0, CONFIG.FORECAST_DAYS);
        
        const grid = Utils.createElement('div', { className: 'weather-grid fade-in' });
        
        days.forEach((dateStr, index) => {
            const card = this.createWeatherCard(dateStr, index, daily);
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    }

    createSuggestionItem(city, inputEl, suggestionsEl) {
        const item = Utils.createElement('div', { className: 'suggestion-item' });
        
        item.appendChild(Utils.createElement('span', { className: 'city-name', textContent: city.name }));
        item.appendChild(Utils.createElement('span', { className: 'city-country', textContent: city.country || '' }));
        
        item.addEventListener('click', () => {
            inputEl.value = `${city.name}${city.country ? ', ' + city.country : ''}`;
            inputEl.dataset.selectedCity = JSON.stringify(city);
            suggestionsEl.classList.remove('active');
        });
        
        return item;
    }

    renderSuggestions(cities, inputEl, suggestionsEl) {
        Utils.clearChildren(suggestionsEl);
        
        if (cities.length === 0) {
            suggestionsEl.appendChild(Utils.createElement('div', { className: 'no-results', textContent: 'Города не найдены' }));
        } else {
            cities.forEach(city => {
                const item = this.createSuggestionItem(city, inputEl, suggestionsEl);
                suggestionsEl.appendChild(item);
            });
        }
        
        suggestionsEl.classList.add('active');
    }

    hideSuggestions(type) {
        if (type === 'modal' && this.dom.modalCitySuggestions) {
            this.dom.modalCitySuggestions.classList.remove('active');
        } else if (type === 'add' && this.dom.addCitySuggestions) {
            this.dom.addCitySuggestions.classList.remove('active');
        }
    }

    showSuggestions(type) {
        const input = type === 'modal' ? this.dom.modalCityInput : this.dom.addCityInput;
        const suggestions = type === 'modal' ? this.dom.modalCitySuggestions : this.dom.addCitySuggestions;
        
        if (input && input.value.trim().length >= CONFIG.MIN_SEARCH_LENGTH) {
            suggestions.classList.add('active');
        }
    }

    createCityBlock(city, onRemove) {
        const block = Utils.createElement('article', {
            className: 'city-block fade-in',
            attributes: { 'data-city-id': city.id }
        });
        
        const header = Utils.createElement('div', { className: 'city-block-header' });
        
        header.appendChild(Utils.createElement('h3', {
            textContent: `🏙️ ${city.name}${city.country ? ', ' + city.country : ''}`
        }));
        
        header.appendChild(Utils.createElement('button', {
            className: 'btn btn-danger',
            textContent: 'Удалить',
            events: { click: () => onRemove(city.id) }
        }));
        
        block.appendChild(header);
        block.appendChild(Utils.createElement('div', {
            className: 'weather-content',
            id: `city-weather-${city.id}`
        }));
        
        return block;
    }

    prependCityBlock(city) {
        const emptyState = this.dom.citiesContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const block = this.createCityBlock(city, (id) => this.weather.removeCity(id));
        
        if (this.dom.citiesContainer.firstChild) {
            this.dom.citiesContainer.insertBefore(block, this.dom.citiesContainer.firstChild);
        } else {
            this.dom.citiesContainer.appendChild(block);
        }
    }

    renderEmptyState() {
        Utils.clearChildren(this.dom.citiesContainer);
        
        const emptyState = Utils.createElement('div', { className: 'empty-state' });
        emptyState.appendChild(Utils.createElement('p', { textContent: 'Добавьте города для отслеживания погоды' }));
        this.dom.citiesContainer.appendChild(emptyState);
    }

    renderCitiesContainer() {
        Utils.clearChildren(this.dom.citiesContainer);
        
        if (this.state.additionalCities.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        this.state.additionalCities.forEach(city => {
            const block = this.createCityBlock(city, (id) => this.weather.removeCity(id));
            this.dom.citiesContainer.appendChild(block);
        });
    }

    clearInput(inputEl, errorEl, suggestionsEl) {
        inputEl.value = '';
        inputEl.dataset.selectedCity = '';
        errorEl.textContent = '';
        suggestionsEl.classList.remove('active');
    }

    setWeather(weather) {
        this.weather = weather;
    }
}
