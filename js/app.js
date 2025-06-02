// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling for navigation links
    setupSmoothScrolling();
    // Add intersection observer for fade-in animations
    setupScrollAnimations();
    // Initialize the map (placeholder for now)
    initializeMap();
    // Set up weather data fetching
    initializeWeather();
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

    // Observe all section headings and content containers
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

function initializeWeather() {
    // Placeholder for weather data
    // To be implemented with a weather API
    const weatherContainer = document.querySelector('.weather-container');
    if (weatherContainer) {
        weatherContainer.innerHTML = '<div class="placeholder">Weather data loading...</div>';
    }
}

function loadCommunityContent() {
    // Placeholder for community content
    // To be implemented with backend integration
    const communityGrid = document.querySelector('.community-grid');
    if (communityGrid) {
        communityGrid.innerHTML = '<div class="placeholder">Community content loading...</div>';
    }
}

// Performance optimizations
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

// Utility functions
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
