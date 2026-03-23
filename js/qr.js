/**
 * SafeRide India v3.0 — QR Ticket Generator
 * Uses qrcode.js (CDN) loaded in the page.
 */

/**
 * renderQRCode(ticketData, canvasId)
 * Renders a QR code into the element with the given ID.
 * ticketData: the full ticket object
 */
function renderQRCode(ticketData, containerId = 'qrCanvas') {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';

    if (typeof QRCode === 'undefined') {
        el.innerHTML = `<div style="padding:20px;text-align:center;font-family:monospace;border:2px dashed #ccc;border-radius:8px;">
            <div style="font-size:50px;">▦</div>
            <div style="font-size:12px;color:#666;margin-top:8px;">ID: ${ticketData.id}</div>
        </div>`;
        return;
    }

    const payload = [
        ticketData.id,
        ticketData.city,
        ticketData.route,
        ticketData.from,
        ticketData.to,
        ticketData.seat || 'N/A',
        ticketData.fare,
        ticketData.time
    ].join('|');

    new QRCode(el, {
        text: payload,
        width: 90, height: 90,
        colorDark: '#1e40af',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
    });
}

/**
 * downloadTicketImage(ticketId)
 * Saves the QR canvas as PNG.
 */
function downloadTicketImage(ticketId) {
    const canvas = document.querySelector('#qrCanvas canvas') || document.querySelector('#qrCanvas img');
    if (!canvas) { alert('QR code not generated yet.'); return; }

    const src = canvas.tagName === 'IMG' ? canvas.src : canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `SafeRide-Ticket-${ticketId}.png`;
    a.href = src;
    a.click();
}

/**
 * buildTicketHTML(ticket)
 * Returns the full ticket card HTML string.
 */
function buildTicketHTML(ticket) {
    const modeIcon = ticket.transport === 'bus' ? '🚌' : ticket.transport === 'metro' ? '🚇' : '🚆';
    return `
    <div class="ticket-card">
        <div class="ticket-strip"></div>
        <div class="ticket-body">
            <div class="ticket-header">
                <div>
                    <div class="ticket-logo">🛡️ SafeRide India</div>
                    <div class="ticket-city">${ticket.city}</div>
                </div>
                <div class="ticket-id-block">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-status">✅ Confirmed</span>
                </div>
            </div>

            <div class="ticket-route">
                <div class="route-from">
                    <div class="route-label">FROM</div>
                    <div class="route-stop">${ticket.from}</div>
                </div>
                <div class="route-arrow">— ${modeIcon} —</div>
                <div class="route-to">
                    <div class="route-label">TO</div>
                    <div class="route-stop">${ticket.to}</div>
                </div>
            </div>

            <div class="ticket-meta-grid">
                <div><span class="meta-l">Mode</span><span class="meta-v">${ticket.transport.toUpperCase()} ${ticket.route}</span></div>
                <div><span class="meta-l">Vehicle</span><span class="meta-v">${ticket.vehicleId || '—'}</span></div>
                <div><span class="meta-l">Seat</span><span class="meta-v">${ticket.seat || 'No seat assigned'}</span></div>
                <div><span class="meta-l">Date</span><span class="meta-v">${ticket.date}</span></div>
                <div><span class="meta-l">Time</span><span class="meta-v">${ticket.time}</span></div>
                <div><span class="meta-l">Valid For</span><span class="meta-v">2 Hours</span></div>
            </div>

            <div class="ticket-footer">
                <div>
                    <div class="ticket-fare">${ticket.city === 'Hyderabad' || ticket.city === 'Bengaluru' ? '₹' : '₹'}${ticket.fare}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Total Paid</div>
                </div>
                <div id="qrCanvas" class="qr-box"></div>
            </div>
        </div>
    </div>`;
}

if (typeof window !== 'undefined') {
    window.renderQRCode = renderQRCode;
    window.downloadTicketImage = downloadTicketImage;
    window.buildTicketHTML = buildTicketHTML;
}
