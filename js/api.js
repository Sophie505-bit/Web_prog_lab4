/**
 * класс для работы с api
 */

import { CONFIG, POPULAR_CITIES } from './config.js';
import { Utils } from './utils.js';

export class Api {
    static async fetchWeather(latitude, longitude) {
        const params = new URLSearchParams({
            latitude,
            longitude,
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
            current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
            timezone: 'auto',
            forecast_days: CONFIG.FORECAST_DAYS
        });

        const response = await fetch(`${CONFIG.WEATHER_API}?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return response.json();
    }

    static async searchCities(query) {
        if (!query || query.length < CONFIG.MIN_SEARCH_LENGTH) return [];

        const queryLower = query.toLowerCase();

        let results = POPULAR_CITIES.filter(city =>
            city.name.toLowerCase().startsWith(queryLower) ||
            city.name.toLowerCase().includes(queryLower)
        );

        if (query.length >= 2) {
            try {
                const response = await fetch(
                    `${CONFIG.GEOCODING_API}?name=${encodeURIComponent(query)}&count=10&language=ru`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.results) {
                        const apiResults = data.results.map(r => ({
                            name: r.name,
                            country: r.country || '',
                            latitude: r.latitude,
                            longitude: r.longitude
                        }));
                        
                        apiResults.forEach(apiCity => {
                            const exists = results.some(
                                c => Math.abs(c.latitude - apiCity.latitude) < 0.01 &&
                                     Math.abs(c.longitude - apiCity.longitude) < 0.01
                            );
                            if (!exists) results.push(apiCity);
                        });
                    }
                }
            } catch (e) {
                console.error('ошибка поиска городов:', e);
            }
        }

        results = Utils.sortAlphabetically(results, query);

        return results.slice(0, 15);
    }
}
