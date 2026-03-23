/**
 * SafeRide India v3.0 — Centralized State Management
 * Handles app state persistence and synchronization across pages.
 */

const APP_STATE_KEY = 'safeRideAppState';

const appState = {
    selectedCity: "",
    transportType: "",
    origin: "",
    destination: "",
    routeNumber: "",
    scheduledTime: "",     // human-readable "22 Feb 2026, 6:30 PM"
    scheduledRaw: "",      // raw "YYYY-MM-DD HH:MM" for hour extraction
    isScheduled: false,
    selectedVehicle: null
};

/** Format a raw date+time into a human-readable string */
function formatScheduledTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return "";
    try {
        const dt = new Date(`${dateStr}T${timeStr}`);
        const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        return dt.toLocaleString('en-IN', options);
    } catch (e) {
        return `${dateStr} ${timeStr}`;
    }
}

/** Extract hour (0-23) from stored scheduled time for crowd prediction */
function getScheduledHour() {
    if (!appState.isScheduled || !appState.scheduledRaw) return null;
    try {
        const parts = appState.scheduledRaw.split(' ');
        if (parts.length >= 2) return parseInt(parts[1].split(':')[0]);
    } catch (e) { }
    return null;
}

/**
 * Load state from localStorage on script load
 */
function loadAppState() {
    const saved = localStorage.getItem(APP_STATE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(appState, parsed);
        } catch (e) {
            console.error("Failed to parse app state", e);
        }
    }
    // Sync individual keys into appState for legacy compatibility
    if (!appState.selectedCity) appState.selectedCity = localStorage.getItem('selectedCity') || "";
    if (!appState.transportType) appState.transportType = localStorage.getItem('selectedTransport') || "";
}

/**
 * Save current state to localStorage
 */
function saveAppState() {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(appState));
    // Legacy support: also set individual keys for existing scripts
    if (appState.selectedCity) localStorage.setItem('selectedCity', appState.selectedCity);
    if (appState.transportType) localStorage.setItem('selectedTransport', appState.transportType);
    if (appState.selectedVehicle) localStorage.setItem('selectedVehicle', JSON.stringify(appState.selectedVehicle));
}

/**
 * Update a single property and save
 */
function updateAppState(updates) {
    Object.assign(appState, updates);
    saveAppState();
}

/**
 * Clear journey-specific state (e.g. on new journey)
 */
function clearJourneyState() {
    appState.origin = "";
    appState.destination = "";
    appState.routeNumber = "";
    appState.scheduledTime = "";
    appState.scheduledRaw = "";
    appState.isScheduled = false;
    appState.selectedVehicle = null;
    saveAppState();
    localStorage.removeItem('currentJourney');
}

// Global Export
window.appState = appState;
window.loadAppState = loadAppState;
window.saveAppState = saveAppState;
window.updateAppState = updateAppState;
window.clearJourneyState = clearJourneyState;
window.formatScheduledTime = formatScheduledTime;
window.getScheduledHour = getScheduledHour;

// Auto-load on include
loadAppState();
