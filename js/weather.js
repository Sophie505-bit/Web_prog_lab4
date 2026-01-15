/**
 * класс управления погодой
 */

import { Api } from './api.js';
import { Utils } from './utils.js';

export class Weather {
    constructor(state, storage, ui, dom) {
        this.state = state;
        this.storage = storage;
        this.ui = ui;
        this.dom = dom;
    }

    async loadCurrentLocation() {
        if (!this.state.currentLocation) return;

        const { latitude, longitude, name, isGeolocation } = this.state.currentLocation;
        
        this.dom.currentLocationTitle.textContent = isGeolocation 
            ? '📍 Текущее местоположение' 
            : `📍 ${name}`;
        
        this.ui.showLoading(this.dom.currentLocationWeather);
        
        try {
            const data = await Api.fetchWeather(latitude, longitude);
            this.ui.renderWeather(data, this.dom.currentLocationWeather);
        } catch (e) {
            this.ui.showError(this.dom.currentLocationWeather, 'Не удалось загрузить погоду');
        }
    }

    async loadAdditionalCities() {
        this.ui.renderCitiesContainer();
        
        const promises = this.state.additionalCities.map(city => this.loadCity(city));
        await Promise.all(promises);
    }

    async loadCity(city) {
        const container = document.getElementById(`city-weather-${city.id}`);
        if (!container) return;
        
        this.ui.showLoading(container);
        
        try {
            const data = await Api.fetchWeather(city.latitude, city.longitude);
            this.ui.renderWeather(data, container);
        } catch (e) {
            this.ui.showError(container, 'Не удалось загрузить погоду');
        }
    }

    async refreshAll() {
        this.dom.refreshBtn.classList.add('loading');
        this.dom.refreshBtn.disabled = true;
        
        try {
            await this.loadCurrentLocation();
            await this.loadAdditionalCities();
        } finally {
            this.dom.refreshBtn.classList.remove('loading');
            this.dom.refreshBtn.disabled = false;
        }
    }

    async addCity(cityData) {
        const isDuplicate = this.state.additionalCities.some(
            c => Math.abs(c.latitude - cityData.latitude) < 0.01 &&
                 Math.abs(c.longitude - cityData.longitude) < 0.01
        );
        
        if (isDuplicate) {
            return { success: false, error: 'Этот город уже добавлен' };
        }

        const newCity = {
            id: Utils.generateId(),
            name: cityData.name,
            country: cityData.country,
            latitude: cityData.latitude,
            longitude: cityData.longitude
        };
        
        this.state.additionalCities.unshift(newCity);
        this.storage.save(this.state);
        
        this.ui.prependCityBlock(newCity);
        await this.loadCity(newCity);
        
        return { success: true };
    }

    removeCity(cityId) {
        this.state.additionalCities = this.state.additionalCities.filter(c => c.id !== cityId);
        this.storage.save(this.state);
        
        const block = document.querySelector(`[data-city-id="${cityId}"]`);
        if (block) {
            block.remove();
        }
        
        if (this.state.additionalCities.length === 0) {
            this.ui.renderEmptyState();
        }
    }
}
