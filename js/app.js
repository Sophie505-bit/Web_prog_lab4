/**
 * главный файл приложения - точка входа
 */

import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { Storage } from './storage.js';
import { Theme } from './theme.js';
import { Api } from './api.js';
import { Geolocation } from './geolocation.js';
import { Weather } from './weather.js';
import { UI } from './ui.js';
import { DOMBuilder } from './dom-builder.js';

class App {
    constructor() {
        this.state = {
            currentLocation: null,
            additionalCities: [],
            theme: 'light'
        };
        
        this.dom = {};
    }

    async init() {
        const savedData = Storage.load();
        this.state.currentLocation = savedData.currentLocation;
        this.state.additionalCities = savedData.additionalCities;
        
        this.theme = new Theme(this.state, this.dom);
        this.theme.init();
        
        this.ui = new UI(this.state, this.dom);
        this.weather = new Weather(this.state, Storage, this.ui, this.dom);
        this.ui.setWeather(this.weather);
        
        this.geolocation = new Geolocation(this.state, Storage, this.weather, this.ui);
        
        const handlers = {
            handleModalSubmit: () => this.handleModalSubmit(),
            handleAddCity: () => this.handleAddCity()
        };
        
        const builder = new DOMBuilder(this.state, this.theme, this.weather, Storage, handlers);
        this.dom = builder.build();
        
        this.ui.dom = this.dom;
        this.weather.dom = this.dom;
        this.theme.dom = this.dom;
        
        this.setupEventListeners();
        
        if (this.state.currentLocation) {
            await this.weather.loadCurrentLocation();
            await this.weather.loadAdditionalCities();
        } else {
            this.geolocation.request();
        }
    }

    setupEventListeners() {
        const debouncedModalSearch = Utils.debounce(() => this.handleModalCityInput(), CONFIG.DEBOUNCE_DELAY);
        this.dom.modalCityInput.addEventListener('input', debouncedModalSearch);
        this.dom.modalCityInput.addEventListener('focus', () => this.ui.showSuggestions('modal'));
        this.dom.modalCityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleModalSubmit();
        });
        
        const debouncedAddSearch = Utils.debounce(() => this.handleAddCityInput(), CONFIG.DEBOUNCE_DELAY);
        this.dom.addCityInput.addEventListener('input', debouncedAddSearch);
        this.dom.addCityInput.addEventListener('focus', () => this.ui.showSuggestions('add'));
        this.dom.addCityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddCity();
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-wrapper')) {
                this.ui.hideSuggestions('modal');
                this.ui.hideSuggestions('add');
            }
        });
    }

    async handleModalCityInput() {
        const query = this.dom.modalCityInput.value.trim();
        this.dom.modalCityError.textContent = '';
        
        if (query.length < CONFIG.MIN_SEARCH_LENGTH) {
            this.ui.hideSuggestions('modal');
            return;
        }
        
        const cities = await Api.searchCities(query);
        this.ui.renderSuggestions(cities, this.dom.modalCityInput, this.dom.modalCitySuggestions);
    }

    async handleModalSubmit() {
        const selectedCity = this.dom.modalCityInput.dataset.selectedCity;
        
        if (!selectedCity) {
            this.dom.modalCityError.textContent = 'Пожалуйста, выберите город из списка';
            return;
        }

        try {
            const city = JSON.parse(selectedCity);
            
            this.state.currentLocation = {
                name: city.name,
                country: city.country,
                latitude: city.latitude,
                longitude: city.longitude,
                isGeolocation: false
            };
            
            Storage.save(this.state);
            this.ui.hideModal();
            
            await this.weather.loadCurrentLocation();
            await this.weather.loadAdditionalCities();
        } catch (e) {
            this.dom.modalCityError.textContent = 'Ошибка при выборе города';
        }
    }

    async handleAddCityInput() {
        const query = this.dom.addCityInput.value.trim();
        this.dom.addCityError.textContent = '';
        
        if (query.length < CONFIG.MIN_SEARCH_LENGTH) {
            this.ui.hideSuggestions('add');
            return;
        }
        
        const cities = await Api.searchCities(query);
        this.ui.renderSuggestions(cities, this.dom.addCityInput, this.dom.addCitySuggestions);
    }

    async handleAddCity() {
        const selectedCity = this.dom.addCityInput.dataset.selectedCity;
        
        if (!selectedCity) {
            this.dom.addCityError.textContent = 'Пожалуйста, выберите город из списка';
            return;
        }

        try {
            const city = JSON.parse(selectedCity);
            
            const result = await this.weather.addCity(city);
            
            if (!result.success) {
                this.dom.addCityError.textContent = result.error;
                return;
            }

            this.ui.clearInput(this.dom.addCityInput, this.dom.addCityError, this.dom.addCitySuggestions);
        } catch (e) {
            this.dom.addCityError.textContent = 'Ошибка при добавлении города';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
