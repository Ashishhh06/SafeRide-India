/**
 * SafeRide India v2.0 — Live Bus Tracking Simulator
 * Animates a bus's position through its stop list and shows ETA.
 */

let _trackingInterval = null;

/**
 * startTracking(bus, currentStopIndex)
 * Renders and animates a bus tracker in #trackingPanel.
 * bus: object from busData
 * currentStopIndex: which stop the bus is currently at
 */
function startTracking(bus, currentStopIndex = 0) {
    if (_trackingInterval) clearInterval(_trackingInterval);

    let idx = currentStopIndex;
    renderTracker(bus, idx);

    // Simulate bus moving every 8 seconds
    _trackingInterval = setInterval(() => {
        idx++;
        if (idx >= bus.stops.length) {
            clearInterval(_trackingInterval);
            const panel = document.getElementById('trackingPanel');
            if (panel) panel.innerHTML = `<div class="card text-center" style="background:#f0fdf4;"><h3 style="color:var(--success)">✅ Bus has reached final destination</h3></div>`;
            return;
        }
        renderTracker(bus, idx);
    }, 8000);
}

function renderTracker(bus, currentIdx) {
    const panel = document.getElementById('trackingPanel');
    if (!panel) return;

    const stops = bus.stops;
    const currentStop = stops[currentIdx];
    const nextStop = stops[currentIdx + 1] || null;
    const stopsRemaining = stops.length - 1 - currentIdx;
    const progressPct = Math.round((currentIdx / (stops.length - 1)) * 100);

    let stopsHtml = stops.map((stop, i) => {
        let cls = 'tracker-stop';
        let dot = 'tracker-dot-future';
        if (i < currentIdx) { cls += ' stop-passed'; dot = 'tracker-dot-past'; }
        if (i === currentIdx) { cls += ' stop-current'; dot = 'tracker-dot-current'; }
        return `
            <div class="tracker-stop ${i < currentIdx ? 'stop-passed' : i === currentIdx ? 'stop-current' : ''}">
                <div class="${dot}"></div>
                <div class="tracker-stop-info">
                    <span class="stop-name">${stop}</span>
                    ${i === currentIdx ? '<span class="stop-badge">🚌 Bus is here</span>' : ''}
                    ${i === currentIdx + 1 ? '<span class="stop-badge-next">Next Stop</span>' : ''}
                </div>
            </div>
        `;
    }).join('');

    panel.innerHTML = `
        <div class="card" style="margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <div>
                    <h2 style="font-size:22px; font-weight:800;">Bus ${bus.route} — Live Tracker</h2>
                    <p style="color:var(--text-muted); font-size:13px;">Vehicle: ${bus.vehicleId}</p>
                </div>
                <span class="badge badge-live">🔴 LIVE</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                <div class="stat-mini">
                    <p class="stat-label">Current Stop</p>
                    <p class="stat-value">${currentStop}</p>
                </div>
                <div class="stat-mini">
                    <p class="stat-label">Next Stop</p>
                    <p class="stat-value">${nextStop || 'Terminal'}</p>
                </div>
                <div class="stat-mini">
                    <p class="stat-label">Stops Remaining</p>
                    <p class="stat-value">${stopsRemaining}</p>
                </div>
            </div>
            <div style="margin-bottom:8px; font-size:13px; font-weight:600; color:var(--text-muted);">Route Progress</div>
            <div class="crowd-bar-bg">
                <div class="crowd-bar-fill" style="width:${progressPct}%; background:var(--primary);"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-top:6px;">
                <span>${stops[0]}</span>
                <span>${progressPct}% Complete</span>
                <span>${stops[stops.length - 1]}</span>
            </div>
        </div>
        <div class="card">
            <h3 style="margin-bottom:16px;">Stop Timeline</h3>
            <div class="tracker-timeline">
                ${stopsHtml}
            </div>
        </div>
    `;
}

function stopTracking() {
    if (_trackingInterval) clearInterval(_trackingInterval);
}

if (typeof window !== 'undefined') {
    window.startTracking = startTracking;
    window.stopTracking = stopTracking;
}
