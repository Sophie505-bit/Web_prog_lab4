/**
 * класс для работы с геолокацией
 */

export class Geolocation {
    constructor(state, storage, weather, ui) {
        this.state = state;
        this.storage = storage;
        this.weather = weather;
        this.ui = ui;
    }

    request() {
        this.ui.showLoading(this.ui.dom.currentLocationWeather);
        
        if (!('geolocation' in navigator)) {
            this.handleError({ message: 'Геолокация не поддерживается' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => this.handleSuccess(position),
            (error) => this.handleError(error),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }



    async handleSuccess(position) {
        const { latitude, longitude } = position.coords;
        
        this.state.currentLocation = {
            name: 'Текущее местоположение',
            latitude,
            longitude,
            isGeolocation: true
        };
        
        this.storage.save(this.state);
        await this.weather.loadCurrentLocation();
        await this.weather.loadAdditionalCities();
    }

    handleError(error) {
        console.log('геолокация отклонена:', error);
        this.ui.showModal();
    }
}
