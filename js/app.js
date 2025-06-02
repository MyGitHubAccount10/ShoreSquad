// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling for navigation links
    setupSmoothScrolling();
    // Add intersection observer for fade-in animations
    setupScrollAnimations();
    // Initialize the map
    initializeMap();
    // Fetch and display weather data
    updateWeatherDisplay();
    // Update weather every 30 minutes
    setInterval(updateWeatherDisplay, 30 * 60 * 1000);
    // Load community data
    loadCommunityContent();
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all section elements for fade-in effect
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

function initializeMap() {
    // Create the map centered on Pasir Ris
    const map = L.map('cleanup-map').setView([1.381497, 103.955574], 15);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add a marker for the cleanup location
    const marker = L.marker([1.381497, 103.955574]).addTo(map);
    marker.bindPopup("<b>Next Cleanup Location</b><br>Pasir Ris Beach").openPopup();
}

// This function was orphaned and not effectively used. 
// The loading/error states are handled directly in updateWeatherDisplay.
// function initializeWeather() { ... } // Removed

function loadCommunityContent() {
    // Placeholder for community content
    // To be implemented with backend integration
    const communityGrid = document.querySelector('.community-grid');
    if (communityGrid) {
        communityGrid.innerHTML = '<div class="placeholder">Community content loading...</div>';
    }
}

// Weather Forecast Functions
async function fetchWeatherForecast() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
        // Using NEA's 4-day weather forecast API.
        // The 'date' parameter specifies the start date for the forecast.
        // If not specified, it defaults to the current date.
        const response = await fetch(`https://api.data.gov.sg/v1/environment/4-day-weather-forecast?date=${formattedDate}`);
        if (!response.ok) {
            // Try fetching without the date parameter if the specific date fails,
            // as the API might be more resilient with the default (current date).
            const fallbackResponse = await fetch(`https://api.data.gov.sg/v1/environment/4-day-weather-forecast`);
            if (!fallbackResponse.ok) throw new Error(`Weather data not available. Status: ${fallbackResponse.status}`);
            const fallbackData = await fallbackResponse.json();
            if (!fallbackData.items || fallbackData.items.length === 0) throw new Error('No forecast items found in fallback response.');
            return fallbackData.items[0].forecasts;
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) throw new Error('No forecast items found.');
        return data.items[0].forecasts; // `items[0]` contains the latest forecast set
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error; // Re-throw to be caught by updateWeatherDisplay
    }
}

function getWeatherIcon(forecast) {
    // Map forecast descriptions to emoji icons
    const weatherIcons = {
        'Thundery Showers': '⛈️',
        'Light Showers': '🌦️',
        'Showers': '🌧️',
        'Heavy Showers': '🌧️☔', // Slightly different for emphasis
        'Passing Showers': '🌦️',
        'Partly Cloudy': '⛅',
        'Partly Cloudy (Day)': '⛅',
        'Partly Cloudy (Night)': '☁️🌙', // Specific icon for night if applicable
        'Cloudy': '☁️',
        'Light Rain': '🌦️',
        'Moderate Rain': '🌧️',
        'Heavy Rain': '🌧️☔',
        'Fair': '☀️',
        'Fair (Day)': '☀️',
        'Fair (Night)': '🌙', // Clear night
        'Fair & Warm': '🌤️',
        'Windy': '💨',
        'Hazy': '🌫️',
        'Slightly Hazy': '😶‍🌫️', // Different icon for slightly hazy
        // Default for unknown forecasts
    };
    
    // Normalize forecast string by checking for common variations
    for (const key in weatherIcons) {
        if (forecast.toLowerCase().includes(key.toLowerCase())) {
            return weatherIcons[key];
        }
    }
    // More generic check for keywords
    if (forecast.toLowerCase().includes('thundery') || forecast.toLowerCase().includes('thunder')) return '⛈️';
    if (forecast.toLowerCase().includes('showers') || forecast.toLowerCase().includes('rain')) return '🌧️';
    if (forecast.toLowerCase().includes('cloudy')) return '☁️';
    if (forecast.toLowerCase().includes('fair') || forecast.toLowerCase().includes('sunny')) return '☀️';
    if (forecast.toLowerCase().includes('windy')) return '💨';
    
    return '🌈'; // Default icon if no specific match
}

function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    // Ensure the date is interpreted correctly, assuming it's YYYY-MM-DD from API
    const date = new Date(dateString + 'T00:00:00'); // Specify time to avoid timezone issues if any
    return date.toLocaleDateString('en-SG', options);
}

async function updateWeatherDisplay() {
    const forecastGrid = document.querySelector('.forecast-grid');
    const loadingElement = document.querySelector('.weather-loading');
    const errorElement = document.querySelector('.weather-error');

    if (!forecastGrid || !loadingElement || !errorElement) {
        console.error('Weather display elements not found.');
        return;
    }

    // Show loading message
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    forecastGrid.innerHTML = ''; // Clear previous forecasts

    try {
        const forecasts = await fetchWeatherForecast();
        
        if (!forecasts || forecasts.length === 0) {
            throw new Error('No forecast data returned.');
        }

        loadingElement.style.display = 'none'; // Hide loading
        
        forecasts.forEach(forecast => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            // Ensure all data points are accessed safely
            const tempLow = forecast.temperature && forecast.temperature.low !== undefined ? forecast.temperature.low : 'N/A';
            const tempHigh = forecast.temperature && forecast.temperature.high !== undefined ? forecast.temperature.high : 'N/A';
            const humidityLow = forecast.relative_humidity && forecast.relative_humidity.low !== undefined ? forecast.relative_humidity.low : 'N/A';
            const humidityHigh = forecast.relative_humidity && forecast.relative_humidity.high !== undefined ? forecast.relative_humidity.high : 'N/A';
            const desc = forecast.forecast || 'Not available';

            card.innerHTML = `
                <div class="forecast-date">${formatDate(forecast.date)}</div>
                <div class="forecast-icon">${getWeatherIcon(desc)}</div>
                <div class="forecast-temp">${tempLow}°C - ${tempHigh}°C</div>
                <div class="forecast-desc">${desc}</div>
                <div class="forecast-humidity">RH: ${humidityLow}% - ${humidityHigh}%</div>
            `;
            forecastGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to update weather display:', error);
        loadingElement.style.display = 'none';
        errorElement.textContent = `Unable to load weather data: ${error.message}`;
        errorElement.style.display = 'block';
    }
}

// Performance optimizations: Header shadow on scroll
document.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        }
    });
}, { passive: true });

// Utility functions (debounce is defined but not currently used, can be kept for future use)
function debounce(func, wait) {
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

// The following duplicate DOMContentLoaded listener has been removed
// as initializeApp already handles these calls.
/*
document.addEventListener('DOMContentLoaded', function() {
    // Initialize weather forecast
    updateWeatherDisplay();
    
    // Update weather every 30 minutes
    setInterval(updateWeatherDisplay, 30 * 60 * 1000);
});
*/
