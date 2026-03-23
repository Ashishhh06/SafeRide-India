/**
 * SafeRide India v3.0 — Main App Script
 * ALL pages read from getCityData() — no hardcoded city logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    applyCityTheme(appState.selectedCity);
    setupCityBadgeInNav();
    routePage();
});

function routePage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('journey')) initJourneyPage();
    else if (path.includes('livecrowd-1')) initLiveCrowdPage();
    else if (path.includes('live-status')) initLiveStatusPage();
    else if (path.includes('hyderabad-metro') || path.includes('metro')) initMetroPage();
    else if (path.includes('mmts-live') || path.includes('suburban')) initMMTSPage();
    else if (path.includes('booking')) initBookingPage();
    else if (path.includes('mytrips')) initMyTripsPage();
    else if (path.includes('smart-alternatives')) initSmartAlternativesPage();
    else if (path.includes('login')) initLoginPage();
    else if (path.includes('report')) initReportPage();
    else if (path.includes('city-selection')) initCitySelection();
}

/* ──────────────────────────────────────────────────────────
   NAVIGATION HELPERS
────────────────────────────────────────────────────────── */
function navigateTo(page) {
    showLoadingOverlay();
    setTimeout(() => { window.location.href = page; }, 150);
}

function safeNavigate(page) {
    saveAppState();
    navigateTo(page);
}

function showLoadingOverlay() {
    if (document.getElementById('srLoadingOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'srLoadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div><span>Loading…</span>';
    document.body.appendChild(overlay);
}

/* ──────────────────────────────────────────────────────────
   GLOBAL HELPERS
────────────────────────────────────────────────────────── */
function setTransport(type) { updateAppState({ transportType: type }); }
function getTransport() { return appState.transportType || 'bus'; }

function saveJourney(data) {
    updateAppState({
        origin: data.origin,
        destination: data.destination,
        isScheduled: data.isScheduled || false,
        scheduledTime: data.scheduledTime || "",
        scheduledRaw: data.scheduledRaw || ""
    });
    localStorage.setItem('currentJourney', JSON.stringify(data));
}

function getJourney() {
    try { return JSON.parse(localStorage.getItem('currentJourney')); } catch { return null; }
}

function setupCityBadgeInNav() {
    const badge = document.getElementById('navCityBadge');
    if (badge) badge.textContent = appState.selectedCity || "Select City";
}

/* ──────────────────────────────────────────────────────────
   SHARED — CROWD BAR HTML
────────────────────────────────────────────────────────── */
function makeCrowdBar(crowd) {
    const col = crowd.color === 'success' ? 'var(--success)' :
        crowd.color === 'warning' ? 'var(--warning)' : 'var(--danger)';
    return `
        <div style="margin-top:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:13px;font-weight:600;">Occupancy — ${crowd.pct}%</span>
                <span class="badge badge-${crowd.color}">${crowd.icon} ${crowd.label}</span>
            </div>
            <div class="crowd-bar-bg">
                <div class="crowd-bar-fill" style="width:${crowd.pct}%;background:${col};"></div>
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-top:6px;">${crowd.message}</p>
        </div>
        ${!crowd.canBoard
            ? '<p style="color:var(--danger);font-weight:700;font-size:13px;margin-top:10px;">🚫 Not Recommended — <a href=\'smart-alternatives.html\' style=\'color:var(--danger);text-decoration:underline;\'>Switch to alternative →</a></p>'
            : '<p style="color:var(--success);font-weight:600;font-size:13px;margin-top:10px;">✅ You can board comfortably</p>'}`;
}

function makeSeatChip(seats) {
    if (seats.isFull) return `<span class="seat-chip seat-full">🚫 Bus Full</span>`;
    if (seats.available <= 5) return `<span class="seat-chip seat-low">⚠️ ${seats.available} seats left</span>`;
    return `<span class="seat-chip seat-ok">💺 ${seats.available} seats available</span>`;
}

/* ──────────────────────────────────────────────────────────
   CITY SELECTION PAGE
────────────────────────────────────────────────────────── */
function initCitySelection() {
    // City card clicks handled via inline onclick in city-selection.html
}

function selectCity(city) {
    updateAppState({ selectedCity: city });
    const step1 = document.getElementById('cityStep');
    const step2 = document.getElementById('transportStep');
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    const label = document.getElementById('selectedCityLabel');
    if (label) label.textContent = city;
    setupCityBadgeInNav();
}

function goToTransport(type) {
    setTransport(type);
    const dest = {
        bus: 'journey.html',
        metro: 'metro.html',
        mmts: 'mmts-live.html',
        suburban: 'mmts-live.html'
    };
    clearJourneyState();
    navigateTo(dest[type] || 'journey.html');
}

/* ──────────────────────────────────────────────────────────
   LOGIN
────────────────────────────────────────────────────────── */
function initLoginPage() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passInput = document.getElementById('passInput');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const email = emailInput?.value?.trim();
        const pass = passInput?.value?.trim();

        // Show inline error if fields are empty
        if (!email || !pass) {
            if (loginError) {
                loginError.textContent = '⚠️ Please enter your email/phone and password.';
                loginError.style.display = 'block';
            }
            return;
        }

        if (loginError) loginError.style.display = 'none';
        if (loginBtn) { loginBtn.textContent = 'Signing in…'; loginBtn.disabled = true; }

        // Demo mode — accept any credentials
        setTimeout(() => {
            localStorage.setItem('isLoggedIn', 'true');
            navigateTo('city-selection.html');
        }, 400);
    });
}


/* ──────────────────────────────────────────────────────────
   SERVICE HOURS CHECK
────────────────────────────────────────────────────────── */
function checkServiceHours(transport, timeStr) {
    if (!timeStr) return true;
    const hour = parseInt(timeStr.split(':')[0]);
    if (transport === 'metro') return hour >= 6 && hour < 23;
    if (transport === 'bus') return hour >= 5 && hour < 23;
    if (transport === 'mmts' || transport === 'suburban') return hour >= 4 && hour < 23;
    return true;
}

function getServiceHoursText(transport) {
    if (transport === 'metro') return '6:00 AM – 11:00 PM';
    if (transport === 'bus') return '5:00 AM – 11:00 PM';
    if (transport === 'mmts' || transport === 'suburban') return '4:00 AM – 11:00 PM';
    return '5:00 AM – 11:00 PM';
}

/* ──────────────────────────────────────────────────────────
   JOURNEY PAGE
────────────────────────────────────────────────────────── */
function initJourneyPage() {
    const city = getSelectedCity();

    // Guard: if no city, send back to selection
    if (!city) {
        alert('Please select a city first.');
        navigateTo('city-selection.html');
        return;
    }

    const transport = getTransport();
    const cityData = getCityData(city);

    const title = document.getElementById('pageTitle');
    if (title) {
        const labels = { bus: '🚌 Plan Bus Journey', metro: '🚇 Plan Metro Journey', mmts: '🚆 Plan MMTS Journey', suburban: '🚆 Plan Suburban Journey' };
        title.textContent = labels[transport] || 'Plan Journey';
    }
    const subtitle = document.getElementById('pageSubtitle');
    if (subtitle) subtitle.textContent = `${city} Transit Network`;

    const originSel = document.getElementById('origin');
    const destSel = document.getElementById('destination');
    if (!originSel || !destSel) return;

    let stops = [];
    if (transport === 'bus') {
        const s = new Set(); (cityData.bus || []).forEach(b => b.stops.forEach(x => s.add(x))); stops = [...s].sort();
    } else if (transport === 'metro') {
        const s = new Set(); (cityData.metro || []).forEach(l => l.stations.forEach(x => s.add(x))); stops = [...s].sort();
    } else {
        const pool = cityData.mmts || cityData.suburban || [];
        const s = new Set(); pool.forEach(r => r.stations.forEach(x => s.add(x))); stops = [...s].sort();
    }

    const opts = stops.map(s => `<option value="${s}">${s}</option>`).join('');
    originSel.innerHTML = `<option value="">— Select Origin —</option>${opts}`;
    destSel.innerHTML = `<option value="">— Select Destination —</option>${opts}`;

    // Departure buttons
    const leaveNowBtn = document.getElementById('leaveNowBtn');
    const scheduleLaterBtn = document.getElementById('scheduleLaterBtn');
    const scheduleUI = document.getElementById('scheduleUI');
    const scheduleDate = document.getElementById('scheduleDate');
    const scheduleTime = document.getElementById('scheduleTime');
    const confirmScheduleBtn = document.getElementById('confirmScheduleBtn');
    const scheduleError = document.getElementById('scheduleError');
    const scheduleConfirmed = document.getElementById('scheduleConfirmed');
    const scheduleConfirmedText = document.getElementById('scheduleConfirmedText');
    const journeyError = document.getElementById('journeyError');

    // Set min date to today
    const todayStr = new Date().toISOString().split('T')[0];
    if (scheduleDate) scheduleDate.min = todayStr;

    function setNowMode() {
        updateAppState({ isScheduled: false, scheduledTime: "", scheduledRaw: "" });
        leaveNowBtn.className = 'btn primary-btn';
        scheduleLaterBtn.className = 'btn secondary-btn';
        scheduleUI.style.display = 'none';
        if (scheduleConfirmed) scheduleConfirmed.style.display = 'none';
        if (scheduleError) { scheduleError.style.display = 'none'; scheduleError.textContent = ''; }
        leaveNowBtn.style.flex = '1';
        scheduleLaterBtn.style.flex = '1';
    }

    function setScheduleMode() {
        updateAppState({ isScheduled: true });
        scheduleLaterBtn.className = 'btn primary-btn';
        leaveNowBtn.className = 'btn secondary-btn';
        scheduleUI.style.display = 'block';
        if (!scheduleDate.value) scheduleDate.value = todayStr;
    }

    leaveNowBtn?.addEventListener('click', setNowMode);
    scheduleLaterBtn?.addEventListener('click', setScheduleMode);

    // Confirm Schedule button
    confirmScheduleBtn?.addEventListener('click', () => {
        const dateVal = scheduleDate?.value;
        const timeVal = scheduleTime?.value;

        function showScheduleError(msg) {
            scheduleError.textContent = msg;
            scheduleError.style.display = 'block';
            if (scheduleConfirmed) scheduleConfirmed.style.display = 'none';
        }

        if (!dateVal || !timeVal) {
            showScheduleError('⚠️ Please select both date and time.');
            return;
        }

        // Check not in the past
        const selectedDT = new Date(`${dateVal}T${timeVal}`);
        if (selectedDT < new Date()) {
            showScheduleError('⚠️ Cannot schedule a trip in the past. Please choose a future date/time.');
            return;
        }

        // Check service hours
        if (!checkServiceHours(transport, timeVal)) {
            showScheduleError(`⚠️ ${transport.toUpperCase()} service is not available at that time. Operating hours: ${getServiceHoursText(transport)}`);
            return;
        }

        const rawStr = `${dateVal} ${timeVal}`;
        const humanStr = typeof formatScheduledTime === 'function'
            ? formatScheduledTime(dateVal, timeVal)
            : rawStr;

        updateAppState({
            isScheduled: true,
            scheduledTime: humanStr,
            scheduledRaw: rawStr
        });

        scheduleError.style.display = 'none';
        scheduleError.textContent = '';
        if (scheduleConfirmed && scheduleConfirmedText) {
            scheduleConfirmedText.textContent = `Scheduled for: ${humanStr}`;
            scheduleConfirmed.style.display = 'flex';
        }
    });

    // Main "Find Transport" button
    document.getElementById('checkCrowdBtn')?.addEventListener('click', () => {
        const origin = originSel.value;
        const dest = destSel.value;

        function showJourneyError(msg) {
            if (journeyError) { journeyError.textContent = msg; journeyError.style.display = 'block'; }
            else alert(msg);
        }

        if (!origin || !dest) { showJourneyError('⚠️ Please select both Origin and Destination stops.'); return; }
        if (origin === dest) { showJourneyError('⚠️ Origin and Destination cannot be the same stop.'); return; }

        if (appState.isScheduled) {
            // Must have a confirmed schedule
            if (!appState.scheduledTime || !appState.scheduledRaw) {
                showJourneyError('⚠️ Please confirm your schedule first by clicking "Confirm Schedule".');
                return;
            }
        }

        if (journeyError) journeyError.style.display = 'none';

        const journeyData = {
            origin,
            destination: dest,
            transport,
            city,
            time: appState.isScheduled ? appState.scheduledTime : new Date().toLocaleTimeString('en-IN'),
            isScheduled: appState.isScheduled,
            scheduledTime: appState.isScheduled ? appState.scheduledTime : "",
            scheduledRaw: appState.isScheduled ? appState.scheduledRaw : ""
        };

        saveJourney(journeyData);

        const redirect = { bus: 'livecrowd-1.html', metro: 'metro.html', mmts: 'mmts-live.html', suburban: 'mmts-live.html' };
        navigateTo(redirect[transport] || 'livecrowd-1.html');
    });
}

/* ──────────────────────────────────────────────────────────
   LIVE CROWD PAGE (BUS)
────────────────────────────────────────────────────────── */
function initLiveCrowdPage() {
    const city = getSelectedCity();

    if (!city) { navigateTo('city-selection.html'); return; }

    const journey = getJourney();
    const cityData = getCityData(city);

    // Show route title
    const routeTitle = document.getElementById('routeTitle');
    if (routeTitle && journey) {
        routeTitle.textContent = `${journey.origin} → ${journey.destination}`;
    }
    const cityLabel = document.getElementById('cityLabel');
    if (cityLabel) cityLabel.textContent = city;

    // Schedule banner
    const scheduleBanner = document.getElementById('scheduleBanner');
    if (scheduleBanner) {
        if (appState.isScheduled && appState.scheduledTime) {
            scheduleBanner.textContent = `Scheduled for: ${appState.scheduledTime}`;
            scheduleBanner.style.display = 'flex';
        } else {
            scheduleBanner.style.display = 'none';
        }
    }

    const list = document.getElementById('busList');
    if (!list) return;
    list.innerHTML = '';

    const scheduledHour = typeof getScheduledHour === 'function' ? getScheduledHour() : null;

    (cityData.bus || []).forEach((bus, i) => {
        const occ = getOccupancyPercent(i * 7 - 15, scheduledHour);
        const crowd = getCrowdDetails(occ);
        const seats = getSeatsInfo(bus.totalSeats, occ);
        const arr = getNextArrivals(bus.timings.frequency, 1)[0];

        const card = document.createElement('div');
        card.className = 'bus-select-card';
        card.innerHTML = `
            <div class="bus-select-header">
                <div>
                    <h3 class="bus-route-label">Route <span class="route-num">${bus.route}</span> — ${bus.type}</h3>
                    <p style="color:var(--text-muted);font-size:13px;">${bus.origin} → ${bus.destination}</p>
                    <p style="font-size:12px;color:var(--text-muted);">Vehicle: ${bus.vehicleId}</p>
                    <div style="margin-top:8px;">${makeSeatChip(seats)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:28px;font-weight:800;color:var(--city-accent,var(--primary));">${arr.minsAway} min</div>
                    <div style="font-size:12px;color:var(--text-muted);">${arr.time}</div>
                    <div style="font-size:20px;font-weight:700;margin-top:4px;">₹${bus.fare}</div>
                </div>
            </div>
            ${makeCrowdBar(crowd)}
            <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
                ${seats.isFull
                    ? `<button class="btn" style="flex:1;background:var(--border);color:var(--text-muted);cursor:not-allowed;" disabled>🚫 Bus Full</button>
                       <button class="btn secondary-btn" style="flex:1;" onclick="safeNavigate('smart-alternatives.html')">🔀 Alternatives</button>`
                    : `<button class="btn primary-btn" style="flex:1;" onclick="selectBus(${i})">Board This Bus →</button>
                       <button class="btn secondary-btn" style="flex:1;" onclick="trackBus(${i})">📍 Track Live</button>`
                }
                ${!crowd.canBoard && !seats.isFull ? `<button class="btn" style="flex:1;background:var(--warning);color:white;" onclick="safeNavigate('smart-alternatives.html')">🔀 Better Options</button>` : ''}
            </div>`;
        list.appendChild(card);
    });
}

function selectBus(idx) {
    const city = getSelectedCity();
    const bus = getCityData(city).bus[idx];
    if (!bus) { alert('Bus data not found.'); return; }
    updateAppState({ selectedVehicle: bus });
    safeNavigate('booking.html');
}

function trackBus(idx) {
    const city = getSelectedCity();
    const bus = getCityData(city).bus[idx];
    if (!bus) { alert('Bus data not found.'); return; }
    updateAppState({ selectedVehicle: bus, transportType: 'bus' });
    safeNavigate('live-status.html');
}

/* ──────────────────────────────────────────────────────────
   LIVE STATUS (TRACKING)
────────────────────────────────────────────────────────── */
function initLiveStatusPage() {
    const bus = appState.selectedVehicle;
    const transport = appState.transportType || 'bus';
    const panel = document.getElementById('trackingPanel');
    const actionsDiv = document.getElementById('liveStatusActions');

    // Build transport-aware back button
    const backPages = { bus: 'livecrowd-1.html', metro: 'metro.html', mmts: 'mmts-live.html', suburban: 'mmts-live.html' };
    const backPage = backPages[transport] || 'livecrowd-1.html';

    if (actionsDiv) {
        actionsDiv.innerHTML = `
            <button class="btn secondary-btn" style="font-size:14px;padding:10px 16px;" onclick="safeNavigate('${backPage}')">← Back to ${transport === 'metro' ? 'Metro' : transport === 'mmts' || transport === 'suburban' ? 'Trains' : 'Buses'}</button>
            <button class="btn primary-btn" style="font-size:14px;padding:10px 16px;" onclick="safeNavigate('booking.html')">Book Ticket →</button>
            <button class="btn secondary-btn" style="font-size:14px;padding:10px 16px;" onclick="safeNavigate('smart-alternatives.html')">🔀 Alternatives</button>
            <a href="report.html" class="btn secondary-btn" style="font-size:14px;padding:10px 16px;">📢 Report</a>`;
    }

    if (!panel) return;

    if (appState.isScheduled && appState.scheduledTime) {
        panel.innerHTML = `
            <div class="card text-center" style="padding:40px;">
                <div style="font-size:48px; margin-bottom:20px;">📅</div>
                <h3 style="margin-bottom:10px;">Trip Scheduled</h3>
                <p style="color:var(--text-muted); margin-bottom:20px;">You have scheduled this trip for:<br><strong style="font-size:17px;">${appState.scheduledTime}</strong></p>
                <div class="stat-mini" style="display:inline-block; padding:10px 20px; margin-bottom:16px;">
                    <p class="stat-label">Route</p>
                    <p class="stat-value">${bus ? bus.route : '—'}</p>
                </div>
                <p style="margin-top:4px; font-size:14px; color:var(--city-accent);">Live tracking will be available closer to departure.</p>
                <div style="margin-top:24px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
                    <button class="btn primary-btn" onclick="safeNavigate('booking.html')">Go to Booking →</button>
                    <button class="btn secondary-btn" onclick="safeNavigate('journey.html')">← Back to Journey</button>
                </div>
            </div>`;
        return;
    }

    if (!bus) {
        panel.innerHTML = `<div class="card text-center" style="padding:40px;">
            <div style="font-size:48px;margin-bottom:16px;">🚌</div>
            <h3 style="margin-bottom:10px;">No Bus Selected</h3>
            <p style="color:var(--text-muted);margin-bottom:20px;">Please go back and select a bus to track.</p>
            <button class="btn primary-btn" onclick="safeNavigate('${backPage}')">← Pick a Bus</button>
        </div>`;
        return;
    }

    if (typeof startTracking === 'function') startTracking(bus, Math.floor(bus.stops.length / 2));
}

/* ──────────────────────────────────────────────────────────
   METRO PAGE
────────────────────────────────────────────────────────── */
function initMetroPage() {
    const city = getSelectedCity();
    if (!city) { navigateTo('city-selection.html'); return; }

    const cityData = getCityData(city);
    const metroLines = cityData.metro || [];

    const legend = document.getElementById('metroLineLegend');
    if (legend) {
        legend.innerHTML = metroLines.map(l => `
            <div class="metro-line-pill" style="border-left:5px solid ${l.color};">
                <div style="font-weight:700;font-size:13px;">${l.line}</div>
                <div style="font-size:11px;color:var(--text-muted);">${l.stations[0]} ↔ ${l.stations[l.stations.length - 1]}</div>
            </div>`).join('');
    }

    const allStations = new Set();
    metroLines.forEach(l => l.stations.forEach(s => allStations.add(s)));
    const opts = [...allStations].sort().map(s => `<option value="${s}">${s}</option>`).join('');
    const fromSel = document.getElementById('metroFrom');
    const toSel = document.getElementById('metroTo');
    if (fromSel) fromSel.innerHTML = `<option value="">— Select Station —</option>${opts}`;
    if (toSel) toSel.innerHTML = `<option value="">— Select Station —</option>${opts}`;

    // Schedule Later UI in metro sidebar
    setupMetroScheduleUI();

    document.getElementById('metroSearchBtn')?.addEventListener('click', () => {
        const from = fromSel?.value, to = toSel?.value;
        if (!from || !to) { alert('Please select both stations.'); return; }
        if (from === to) { alert('Stations cannot be the same.'); return; }
        renderMetroResult(from, to, metroLines, city);
    });
}

function setupMetroScheduleUI() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Check if schedule UI already injected
    if (document.getElementById('metroScheduleBlock')) return;

    const scheduleBlock = document.createElement('div');
    scheduleBlock.id = 'metroScheduleBlock';
    scheduleBlock.style.cssText = 'margin-top:20px;padding-top:20px;border-top:1px solid var(--border);';
    scheduleBlock.innerHTML = `
        <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);margin-bottom:10px;">Departure Time</p>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
            <button id="metroNowBtn" class="btn primary-btn" style="flex:1;font-size:13px;padding:8px;">Now</button>
            <button id="metroScheduleBtn" class="btn secondary-btn" style="flex:1;font-size:13px;padding:8px;">Schedule</button>
        </div>
        <div id="metroScheduleFields" style="display:none;">
            <div class="form-group">
                <label style="font-size:13px;">Date</label>
                <input type="date" id="metroDate" style="font-size:13px;padding:8px;">
            </div>
            <div class="form-group">
                <label style="font-size:13px;">Time</label>
                <input type="time" id="metroTime" style="font-size:13px;padding:8px;">
            </div>
            <div id="metroScheduleError" class="error-msg" style="display:none;margin-bottom:8px;"></div>
            <button id="metroConfirmSchedule" class="btn primary-btn" style="width:100%;font-size:13px;padding:10px;">✅ Confirm</button>
            <div id="metroScheduleConfirmed" class="schedule-banner" style="display:none;margin-top:10px;font-size:13px;"></div>
        </div>`;

    // Insert before the report link at bottom
    const reportLink = sidebar.querySelector('a[href="report.html"]');
    if (reportLink && reportLink.parentElement) {
        sidebar.insertBefore(scheduleBlock, reportLink.parentElement);
    } else {
        sidebar.appendChild(scheduleBlock);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const metroDateEl = document.getElementById('metroDate');
    if (metroDateEl) { metroDateEl.min = todayStr; metroDateEl.value = todayStr; }

    document.getElementById('metroNowBtn')?.addEventListener('click', () => {
        updateAppState({ isScheduled: false, scheduledTime: "", scheduledRaw: "" });
        document.getElementById('metroNowBtn').className = 'btn primary-btn';
        document.getElementById('metroScheduleBtn').className = 'btn secondary-btn';
        document.getElementById('metroScheduleFields').style.display = 'none';
    });

    document.getElementById('metroScheduleBtn')?.addEventListener('click', () => {
        updateAppState({ isScheduled: true });
        document.getElementById('metroScheduleBtn').className = 'btn primary-btn';
        document.getElementById('metroNowBtn').className = 'btn secondary-btn';
        document.getElementById('metroScheduleFields').style.display = 'block';
    });

    document.getElementById('metroConfirmSchedule')?.addEventListener('click', () => {
        const dateVal = document.getElementById('metroDate')?.value;
        const timeVal = document.getElementById('metroTime')?.value;
        const errDiv = document.getElementById('metroScheduleError');
        const confirmedDiv = document.getElementById('metroScheduleConfirmed');

        function showErr(msg) { errDiv.textContent = msg; errDiv.style.display = 'block'; confirmedDiv.style.display = 'none'; }

        if (!dateVal || !timeVal) { showErr('Select both date and time.'); return; }
        if (new Date(`${dateVal}T${timeVal}`) < new Date()) { showErr('Cannot schedule in the past.'); return; }
        if (!checkServiceHours('metro', timeVal)) { showErr(`Metro hours: ${getServiceHoursText('metro')}`); return; }

        const humanStr = typeof formatScheduledTime === 'function' ? formatScheduledTime(dateVal, timeVal) : `${dateVal} ${timeVal}`;
        updateAppState({ isScheduled: true, scheduledTime: humanStr, scheduledRaw: `${dateVal} ${timeVal}` });

        errDiv.style.display = 'none';
        confirmedDiv.textContent = `Scheduled: ${humanStr}`;
        confirmedDiv.style.display = 'flex';
    });
}

function renderMetroResult(from, to, metroLines, city) {
    const result = calculateMetroJourney(from, to, metroLines);
    const panel = document.getElementById('metroResult');
    if (!panel) return;

    if (!result) { panel.innerHTML = `<div class="card"><p>No route found between those stations.</p></div>`; return; }

    const scheduledHour = typeof getScheduledHour === 'function' ? getScheduledHour() : null;
    const occ = getOccupancyPercent(0, scheduledHour);
    const crowd = getCrowdDetails(occ);
    const arrivals = getNextArrivals(result.line1.timings.frequency);

    const drawTimeline = (stops, lineColor, interchangeSt) => stops.map((s, i) => `
        <div class="metro-stop-row ${i === 0 ? 'metro-start' : ''} ${i === stops.length - 1 && !interchangeSt ? 'metro-end' : ''} ${s === interchangeSt ? 'metro-interchange' : ''}">
            <div class="metro-line-cell">
                ${i < stops.length - 1 ? `<div class="metro-line-seg" style="background:${lineColor};"></div>` : ''}
                <div class="metro-station-dot" style="border-color:${lineColor};"></div>
            </div>
            <div class="metro-stop-name">
                ${s}
                ${s === interchangeSt ? '<span class="interchange-badge">🔄 Change Here</span>' : ''}
                ${i === 0 ? '<span class="origin-badge">Board</span>' : ''}
                ${i === stops.length - 1 && result.type === 'direct' ? '<span class="dest-badge">Alight</span>' : ''}
            </div>
        </div>`).join('');

    let timeline = drawTimeline(result.stopsLine1, result.line1.color, result.interchange);
    if (result.type === 'interchange') timeline += drawTimeline(result.stopsLine2, result.line2.color, null);

    const scheduleBannerHtml = appState.isScheduled && appState.scheduledTime
        ? `<div class="schedule-banner" style="margin-bottom:16px;">Scheduled for: ${appState.scheduledTime}</div>` : '';

    panel.innerHTML = `
        ${scheduleBannerHtml}
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <h2 style="font-size:22px;font-weight:800;">${from} → ${to}</h2>
                    <p style="color:var(--text-muted);">${result.type === 'interchange' ? `${result.line1.line} → Change at <strong>${result.interchange}</strong> → ${result.line2.line}` : result.line1.line}</p>
                </div>
                <span class="badge" style="background:${result.line1.color};color:white;">${result.line1.line}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
                <div class="stat-mini"><p class="stat-label">Stations</p><p class="stat-value">${result.stationCount}</p></div>
                <div class="stat-mini"><p class="stat-label">Travel Time</p><p class="stat-value">~${result.travelTime} min</p></div>
                <div class="stat-mini"><p class="stat-label">Fare</p><p class="stat-value">₹${result.fare}</p></div>
                <div class="stat-mini"><p class="stat-label">Type</p><p class="stat-value">${result.type === 'interchange' ? '🔄 Change' : '✅ Direct'}</p></div>
            </div>
            ${makeCrowdBar(crowd)}
        </div>
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px;">Next 3 Trains</h3>
            ${arrivals.map((a, i) => `
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">
                    <span style="color:var(--text-muted);">${i === 0 ? 'Next train' : 'Upcoming'}</span>
                    <span style="font-weight:700;color:var(--city-accent,var(--primary));">${a.minsAway} min — ${a.time}</span>
                </div>`).join('')}
        </div>
        <div class="card" style="margin-bottom:20px;">
            <h3 style="margin-bottom:16px;">Station Timeline</h3>
            <div class="metro-timeline">${timeline}</div>
        </div>
        <button class="btn primary-btn" style="width:100%;padding:18px;font-size:17px;" onclick="bookMetro('${from}','${to}',${result.fare})">
            Book Metro Ticket — ₹${result.fare} →
        </button>`;
}

function bookMetro(from, to, fare) {
    const journey = getJourney() || {};
    saveJourney({ ...journey, origin: from, destination: to, transport: 'metro', fare, city: getSelectedCity() });
    safeNavigate('booking.html');
}

/* ──────────────────────────────────────────────────────────
   MMTS / SUBURBAN PAGE
────────────────────────────────────────────────────────── */
function initMMTSPage() {
    const city = getSelectedCity();
    if (!city) { navigateTo('city-selection.html'); return; }

    const cityData = getCityData(city);
    const pool = cityData.mmts || cityData.suburban || [];
    const modeName = cityData.mmts ? 'MMTS' : 'Suburban Rail';

    const pageTitle = document.getElementById('mmtsPageTitle');
    if (pageTitle) pageTitle.textContent = `🚆 ${city} ${modeName}`;

    // Schedule banner in MMTS header
    const mainContent = document.querySelector('.main-content');
    if (mainContent && appState.isScheduled && appState.scheduledTime) {
        const banner = document.createElement('div');
        banner.className = 'schedule-banner';
        banner.style.cssText = 'margin-bottom:20px;';
        banner.textContent = `Scheduled for: ${appState.scheduledTime}`;
        mainContent.insertBefore(banner, mainContent.firstChild);
    }

    const routeSel = document.getElementById('mmtsRoute');
    if (!routeSel) return;
    routeSel.innerHTML = pool.map((r, i) => `<option value="${i}">${r.route}</option>`).join('');
    routeSel.addEventListener('change', () => renderMMTSList(parseInt(routeSel.value), pool));
    renderMMTSList(0, pool);
}

function renderMMTSList(idx, pool) {
    const route = pool[idx];
    const arrivals = getNextArrivals(route.timings.frequency, 3);
    const list = document.getElementById('mmtsList');
    const stations = document.getElementById('mmtsStations');
    const scheduledHour = typeof getScheduledHour === 'function' ? getScheduledHour() : null;

    if (list) {
        list.innerHTML = arrivals.map((a, i) => {
            const occ = getOccupancyPercent(i * 12 - 8, scheduledHour);
            const crowd = getCrowdDetails(occ);
            const seats = getSeatsInfo(route.totalSeats, occ);
            return `
            <div class="card" style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                    <div>
                        <span class="badge badge-low" style="margin-bottom:8px;display:inline-block;">${i === 0 ? '▶ Next' : 'Upcoming'}</span>
                        <h3 style="font-size:17px;">Train ${route.trainId}</h3>
                        <p style="color:var(--text-muted);font-size:13px;">Platform ${(i % 2) + 1} • ${route.stations[0]} → ${route.stations[route.stations.length - 1]}</p>
                        <div style="margin-top:6px;">${makeSeatChip(seats)}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:28px;font-weight:800;color:var(--city-accent,var(--primary));">${a.minsAway} min</div>
                        <div style="font-size:12px;color:var(--text-muted);">${a.time}</div>
                        <div style="font-weight:700;margin-top:4px;">₹${route.fare}</div>
                    </div>
                </div>
                ${makeCrowdBar(crowd)}
                <div style="display:flex;gap:10px;margin-top:14px;">
                    ${seats.isFull
                        ? `<button class="btn" style="flex:1;background:var(--border);color:var(--text-muted);" disabled>🚫 Full</button>
                           <button class="btn secondary-btn" style="flex:1;" onclick="safeNavigate('smart-alternatives.html')">🔀 Alternatives</button>`
                        : `<button class="btn primary-btn" style="flex:1;" onclick="bookMMTS(${idx})">Book Ticket →</button>`}
                </div>
            </div>`;
        }).join('');
    }

    if (stations) {
        stations.innerHTML = `
            <h3 style="margin-bottom:14px;">All Stations</h3>
            <div class="timeline">${route.stations.map((s, i) => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div style="padding-left:12px;">
                        <strong>${s}</strong>
                        ${i === 0 ? '<span class="origin-badge" style="font-size:11px;">Start</span>' : ''}
                        ${i === route.stations.length - 1 ? '<span class="dest-badge" style="font-size:11px;">End</span>' : ''}
                    </div>
                </div>`).join('')}
            </div>`;
    }
}

function bookMMTS(idx) {
    const city = getSelectedCity();
    const pool = getCityData(city).mmts || getCityData(city).suburban || [];
    const route = pool[idx];
    if (!route) { alert('Route data not found.'); return; }
    saveJourney({
        origin: route.stations[0],
        destination: route.stations[route.stations.length - 1],
        transport: 'mmts',
        fare: route.fare,
        city,
        isScheduled: appState.isScheduled,
        scheduledTime: appState.scheduledTime,
        scheduledRaw: appState.scheduledRaw
    });
    safeNavigate('booking.html');
}

/* ──────────────────────────────────────────────────────────
   SMART ALTERNATIVES
────────────────────────────────────────────────────────── */
function initSmartAlternativesPage() {
    const journey = getJourney();
    const city = appState.selectedCity || getSelectedCity();
    const container = document.getElementById('alternativesContainer');
    if (!container) return;

    const scheduledHour = typeof getScheduledHour === 'function' ? getScheduledHour() : null;
    const crowdPct = getOccupancyPercent(0, scheduledHour);
    const alts = getSmartAlternatives({
        origin: journey?.origin || '—',
        destination: journey?.destination || '—',
        transport: journey?.transport || 'bus',
        crowdPct,
        city,
        specificHour: scheduledHour
    });

    if (appState.isScheduled && appState.scheduledTime) {
        const bannerEl = document.createElement('div');
        bannerEl.className = 'schedule-banner';
        bannerEl.style.marginBottom = '20px';
        bannerEl.textContent = `Showing alternatives for scheduled trip: ${appState.scheduledTime}`;
        container.parentElement?.insertBefore(bannerEl, container);
    }

    const altSubtitle = document.getElementById('altSubtitle');
    if (altSubtitle && journey)
        altSubtitle.textContent = `Smarter options for ${journey.origin} → ${journey.destination} in ${city}`;

    container.innerHTML = alts.map((alt) => `
        <div class="alt-card ${alt.isBest ? 'alt-best' : ''}">
            ${alt.isBest ? '<div class="best-badge">⭐ Recommended</div><div style="height:20px;"></div>' : ''}
            ${alt.tag ? `<span class="tag-badge">${alt.tag}</span>` : ''}
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <h3 style="font-size:17px;font-weight:700;margin-bottom:4px;">${alt.label}</h3>
                    <p style="color:var(--text-muted);font-size:13px;">Every ${alt.frequency} min</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:26px;font-weight:800;color:var(--city-accent,var(--primary));">₹${alt.fare}</div>
                    <div style="font-size:12px;color:var(--text-muted);">~${alt.travelTime} mins</div>
                </div>
            </div>
            ${makeCrowdBar(alt.crowd)}
            <div style="display:flex;gap:10px;margin-top:16px;">
                <button class="btn primary-btn" style="flex:1;" onclick="safeNavigate('booking.html')">Book Now →</button>
            </div>
        </div>`).join('');

    const best = alts[0];
    const msg = document.getElementById('smartMessage');
    if (msg && best) msg.textContent = `💡 Switch to ${best.label} — ~${best.travelTime} min travel at ${best.crowd.label} crowd (${best.crowd.pct}% occupancy)`;
}

/* ──────────────────────────────────────────────────────────
   BOOKING PAGE — Full QR Ticket
────────────────────────────────────────────────────────── */
function initBookingPage() {
    const journey = getJourney();
    const vehicle = appState.selectedVehicle;
    const city = appState.selectedCity || getSelectedCity();

    // Guard: need a city
    if (!city) {
        alert('No city selected. Redirecting to city selection…');
        navigateTo('city-selection.html');
        return;
    }

    // Guard: need at least a journey or vehicle
    if (!journey && !vehicle) {
        alert('No active journey found. Please plan your trip first.');
        navigateTo('journey.html');
        return;
    }

    const summary = document.getElementById('bookingSummary');
    if (!summary) return;

    const baseFare = journey?.fare || vehicle?.fare || 25;
    const transport = journey?.transport || appState.transportType || 'bus';
    const origin = journey?.origin || vehicle?.origin || '—';
    const dest = journey?.destination || vehicle?.destination || '—';
    const route = vehicle?.route || journey?.route || (transport === 'metro' ? 'Metro' : transport === 'mmts' ? 'MMTS' : 'Route');
    const vehicleId = vehicle?.vehicleId || (transport === 'metro' ? 'MET-042' : transport === 'mmts' ? 'MMT-001' : 'BUS-001');
    const totalFare = Math.round(baseFare * 1.05);
    const scheduledHour = typeof getScheduledHour === 'function' ? getScheduledHour() : null;
    const occ = getOccupancyPercent(0, scheduledHour);
    const crowd = getCrowdDetails(occ);
    const totalSeats = vehicle?.totalSeats || 55;
    const seat = assignSeatNumber(totalSeats, occ);
    const bookingId = generateTicketId();

    const scheduledBadge = appState.isScheduled && appState.scheduledTime
        ? `<div class="schedule-banner" style="margin-bottom:20px;">Scheduled for: ${appState.scheduledTime}</div>` : '';

    summary.innerHTML = `
        ${scheduledBadge}
        <div class="card" style="margin-bottom:20px;">
            <h2 style="font-size:22px;font-weight:800;margin-bottom:20px;">Review Your Booking</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
                <div class="stat-mini"><p class="stat-label">City</p><p class="stat-value">${city}</p></div>
                <div class="stat-mini"><p class="stat-label">Mode</p><p class="stat-value">${transport.toUpperCase()} ${route}</p></div>
                <div class="stat-mini"><p class="stat-label">From</p><p class="stat-value">${origin}</p></div>
                <div class="stat-mini"><p class="stat-label">To</p><p class="stat-value">${dest}</p></div>
                <div class="stat-mini"><p class="stat-label">Vehicle</p><p class="stat-value">${vehicleId}</p></div>
                <div class="stat-mini"><p class="stat-label">Seat</p><p class="stat-value">${seat || '—'}</p></div>
            </div>
            <div style="border-top:1px solid var(--border);padding-top:16px;">
                <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Base Fare</span><span>₹${baseFare}</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Service Tax (5%)</span><span>₹${Math.round(baseFare * 0.05)}</span></div>
                <div style="display:flex;justify-content:space-between;font-weight:700;font-size:18px;padding-top:10px;border-top:1px solid var(--border);">
                    <span>Total</span><span style="color:var(--city-accent,var(--primary));">₹${totalFare}</span>
                </div>
            </div>
        </div>
        <div class="card" style="margin-bottom:20px;">${makeCrowdBar(crowd)}</div>
        <div style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:var(--radius);padding:14px;margin-bottom:24px;">
            <p style="font-size:13px;color:#9a3412;"><strong>Note:</strong> Non-refundable once booked. Arrive 10 min early.</p>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn primary-btn" style="flex:1;padding:18px;font-size:17px;"
                onclick="processBooking('${bookingId}','${city}','${transport}','${route}','${origin}','${dest}','${vehicleId}',${totalFare},'${seat || 'N/A'}')">
                ✅ Confirm &amp; Pay ₹${totalFare} — Get Ticket →
            </button>
            <button class="btn secondary-btn" style="padding:18px;" onclick="safeNavigate('journey.html')">← Back</button>
        </div>`;
}

function processBooking(id, city, transport, route, from, to, vehicleId, fare, seat) {
    const now = new Date();
    const ticket = {
        id, city, transport, route, from, to, vehicleId, fare,
        seat: seat === 'N/A' ? null : seat,
        date: now.toLocaleDateString('en-IN'),
        time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Confirmed',
        isScheduled: appState.isScheduled || false,
        scheduledTime: appState.scheduledTime || ""
    };
    const trips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    trips.unshift(ticket);
    localStorage.setItem('myTrips', JSON.stringify(trips));
    localStorage.setItem('lastTicket', JSON.stringify(ticket));
    clearJourneyState();
    navigateTo('mytrips.html?booked=1');
}

/* ──────────────────────────────────────────────────────────
   MY TRIPS — Show tickets with QR
────────────────────────────────────────────────────────── */
function initMyTripsPage() {
    const container = document.getElementById('tripsContainer');
    const banner = document.getElementById('successBanner');

    if (banner && window.location.search.includes('booked=1')) banner.style.display = 'block';
    if (!container) return;

    let trips = [];
    try { trips = JSON.parse(localStorage.getItem('myTrips') || '[]'); } catch { trips = []; }

    // Filter out corrupt/undefined entries (old data before v3 upgrade)
    const validTrips = trips.filter(t => t && t.id && t.from && t.to);
    const hadCorrupt = validTrips.length < trips.length;

    if (!validTrips.length) {
        container.innerHTML = `<div class="card text-center" style="padding:60px 20px;">
            <div style="font-size:64px;margin-bottom:16px;">🎫</div>
            <h3 style="margin-bottom:10px;">No Trips Yet</h3>
            <p style="color:var(--text-muted);margin-bottom:24px;">Book your first journey below.</p>
            <a href="city-selection.html" class="btn primary-btn">Plan a Journey</a></div>`;
        return;
    }

    // Show a notice if some old corrupt trips were filtered out
    let corruptNotice = '';
    if (hadCorrupt) {
        corruptNotice = `<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#92400e;">
            ⚠️ Some older trips with incomplete data were hidden.
            <button onclick="localStorage.removeItem('myTrips');location.reload();" style="margin-left:12px;background:none;border:none;color:#92400e;font-weight:700;cursor:pointer;text-decoration:underline;font-size:13px;">Clear all trips</button>
        </div>`;
    }

    container.innerHTML = corruptNotice + validTrips.map((t, tidx) => {
        const modeIcon = t.transport === 'bus' ? '🚌' : t.transport === 'metro' ? '🚇' : '🚆';
        const city = t.city || '—';
        const transport = t.transport || '—';
        const route = t.route || '—';
        const vehicleId = t.vehicleId || '—';
        const seat = t.seat || '—';
        const scheduledLine = t.isScheduled && t.scheduledTime
            ? `<p style="color:var(--primary);font-size:12px;margin-top:4px;">📅 Scheduled: ${t.scheduledTime}</p>` : '';

        return `<div class="card" style="margin-bottom:20px;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
                <div>
                    <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
                        <span class="badge badge-low">${city}</span>
                        <span class="badge badge-success">${transport.toUpperCase()}</span>
                    </div>
                    <h3 style="font-size:18px;font-weight:700;">${modeIcon} ${t.from} → ${t.to}</h3>
                    <p style="color:var(--text-muted);font-size:13px;">Ticket: ${t.id} | ${t.date || '—'} ${t.time || ''}</p>
                    <p style="color:var(--text-muted);font-size:13px;">Vehicle: ${vehicleId} | Route: ${route} | Seat: ${seat}</p>
                    ${scheduledLine}
                </div>
                <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:26px;font-weight:800;color:var(--city-accent,var(--primary));">₹${t.fare || '—'}</div>
                    <span class="badge badge-low" style="margin-top:6px;display:inline-block;">✅ ${t.status || 'Confirmed'}</span>
                </div>
            </div>
            <div style="border-top:1px dashed var(--border);padding-top:16px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
                <div id="qr-${tidx}" class="qr-inline"></div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;">Scan to Board</div>
                    <div style="font-family:monospace;font-size:14px;font-weight:700;word-break:break-all;">${t.id}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Valid for 2 hours from booking</div>
                    <button class="btn secondary-btn" style="margin-top:10px;font-size:12px;padding:7px 14px;" onclick="downloadTripQR(${tidx},'${t.id}')">⬇ Download Ticket</button>
                </div>
            </div>
        </div>`;
    }).join('');

    // Render QR for each valid trip
    validTrips.forEach((t, tidx) => {
        if (typeof renderQRCode === 'function') {
            renderQRCode(t, `qr-${tidx}`);
        } else {
            const el = document.getElementById(`qr-${tidx}`);
            if (el) el.innerHTML = `<div class="qr-fallback">▦<br><span>${t.id}</span></div>`;
        }
    });
}

function downloadTripQR(tidx, ticketId) {
    const el = document.getElementById(`qr-${tidx}`);
    if (!el) return;
    const canvas = el.querySelector('canvas');
    const img = el.querySelector('img');
    const src = canvas ? canvas.toDataURL('image/png') : (img ? img.src : null);
    if (!src) { alert('QR not ready yet.'); return; }
    const a = document.createElement('a');
    a.download = `SafeRide-Ticket-${ticketId}.png`;
    a.href = src;
    a.click();
}


/* ──────────────────────────────────────────────────────────
   REPORT / COMPLAINT SYSTEM
────────────────────────────────────────────────────────── */
function initReportPage() {
    const city = getSelectedCity();
    const cityField = document.getElementById('reportCity');
    if (cityField) cityField.value = city;

    const vehicleSelect = document.getElementById('reportVehicle');
    if (vehicleSelect) {
        const cityData = getCityData(city);
        const vehicles = (cityData.bus || []).map(b => b.vehicleId);
        vehicleSelect.innerHTML = `<option value="">Select Vehicle (optional)</option>` +
            vehicles.map(v => `<option value="${v}">${v}</option>`).join('') +
            `<option value="other">Other / Unknown</option>`;
    }

    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const fd = new FormData(form);
            const complaint = {
                id: generateComplaintId(),
                city: cityField?.value || city,
                transport: fd.get('transport'),
                route: fd.get('route') || '',
                vehicle: fd.get('vehicle') || '',
                location: fd.get('location') || '',
                issueType: fd.get('issueType'),
                description: fd.get('description'),
                contact: fd.get('contact') || '',
                timestamp: new Date().toLocaleString('en-IN')
            };

            const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
            complaints.unshift(complaint);
            localStorage.setItem('complaints', JSON.stringify(complaints));

            form.style.display = 'none';
            const confirm = document.getElementById('complaintConfirm');
            if (confirm) confirm.style.display = 'block';
            const cid = document.getElementById('complaintId');
            if (cid) cid.textContent = complaint.id;
            const ct = document.getElementById('complaintTime');
            if (ct) ct.textContent = complaint.timestamp;
        });
    }
}

// Global Export
window.navigateTo = navigateTo;
window.safeNavigate = safeNavigate;
window.checkServiceHours = checkServiceHours;
window.selectBus = selectBus;
window.trackBus = trackBus;
window.bookMetro = bookMetro;
window.bookMMTS = bookMMTS;
window.processBooking = processBooking;
window.downloadQR = downloadTripQR;
window.downloadTripQR = downloadTripQR;
window.selectCity = selectCity;
window.goToTransport = goToTransport;
