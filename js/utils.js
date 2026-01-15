/**
 * утилиты
 */

export class Utils {
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.className) {
            element.className = options.className;
        }
        
        if (options.id) {
            element.id = options.id;
        }
        
        if (options.textContent) {
            element.textContent = options.textContent;
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.children) {
            options.children.forEach(child => {
                if (child) element.appendChild(child);
            });
        }
        
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        
        return element;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static formatDate(dateStr, months) {
        const date = new Date(dateStr);
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    static generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static clearChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    static sortAlphabetically(cities, query) {
        const queryLower = query.toLowerCase();
        const queryLength = query.length;
        
        return cities.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            
            const aStarts = aName.startsWith(queryLower);
            const bStarts = bName.startsWith(queryLower);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            if (aStarts && bStarts) {
                const aRest = aName.substring(queryLength);
                const bRest = bName.substring(queryLength);
                return aRest.localeCompare(bRest, 'ru');
            }
            
            return aName.localeCompare(bName, 'ru');
        });
    }
}
