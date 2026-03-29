
// Browser compatibility shim — normalizes Firefox (browser.*) and Chrome/Edge (chrome.*)
if (typeof browser === 'undefined') var browser = chrome;

setInterval(mainOperation, 3000);

var savedData;
var promise_pms = browser.storage.sync.get('configuration');
promise_pms.then((res) => { savedData = res; });

// ─── Styles ───────────────────────────────────────────────────────────────────

function injectStyles() {
    if (document.getElementById('upwork-customizer-styles')) return;
    var style = document.createElement('style');
    style.id = 'upwork-customizer-styles';
    style.textContent = `
        /* Score strip injected as first child of each tile */
        .upwk-score-strip {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 12px;
            margin: -4px -4px 6px -4px;
            border-radius: 4px 4px 0 0;
            background: rgba(0,0,0,0.06);
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .upwk-score-pct {
            font-size: 15px;
            font-weight: 700;
            min-width: 40px;
        }
        .upwk-score-track {
            flex: 1;
            height: 7px;
            background: rgba(0,0,0,0.12);
            border-radius: 4px;
            overflow: hidden;
        }
        .upwk-score-fill {
            height: 100%;
            border-radius: 4px;
        }
        .upwk-score-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.3px;
            opacity: 0.85;
        }
        .upwk-score-signals {
            font-size: 11px;
            opacity: 0.7;
            margin-left: auto;
        }

        /* Country badges — inline next to country text */
        .upwk-badge-wrap {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-left: 6px;
            vertical-align: middle;
            pointer-events: none;
        }
        .upwk-badge {
            font-size: 16px;
            line-height: 1;
            display: inline-block;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
        }
        .upwk-badge-blocked    { animation: upwk-shake  0.7s infinite; }
        .upwk-badge-highlighted { animation: upwk-bounce 1.4s ease-in-out infinite; }

        @keyframes upwk-shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            20%       { transform: translateX(-3px) rotate(-8deg); }
            40%       { transform: translateX( 3px) rotate( 8deg); }
            60%       { transform: translateX(-2px) rotate(-4deg); }
            80%       { transform: translateX( 2px) rotate( 4deg); }
        }
        @keyframes upwk-bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
}

// ─── Score helpers ─────────────────────────────────────────────────────────────

function scoreColor(pct) {
    if (pct >= 80) return '#14a800'; // Upwork green
    if (pct >= 60) return '#5cb85c';
    if (pct >= 40) return '#f0a500';
    if (pct >= 20) return '#e8561e';
    return '#c0392b';
}

function scoreLabel(pct) {
    if (pct >= 80) return '🔥 Must bid';
    if (pct >= 60) return '👍 Good odds';
    if (pct >= 40) return '🤔 Consider';
    if (pct >= 20) return '⚠️ Risky';
    return '🏃 Run away';
}

function parseSpent(text) {
    // "$1.2K spent" → 1200 | "$10K+ spent" → 10000 | "$500 spent" → 500
    var m = text.match(/\$([\d,.]+)([KkMm]?)\+?/);
    if (!m) return -1; // not found
    var n = parseFloat(m[1].replace(/,/g, ''));
    var u = m[2].toLowerCase();
    if (u === 'k') n *= 1000;
    if (u === 'm') n *= 1000000;
    return n;
}

/**
 * Returns { score, max, signals[] }
 * max is dynamic — only counts categories where data was actually found.
 */
function calculateBidScore(tile, countryText, proposalText, config) {
    var score = 0, max = 0;
    var signals = [];

    // ── Proposals (25 pts) ──────────────────────────────────────────────────
    max += 25;
    if      (proposalText === 'Less than 5') { score += 25; signals.push('bids✅'); }
    else if (proposalText === '5 to 10')     { score += 20; signals.push('bids🟡'); }
    else if (proposalText === '10 to 15')    { score += 13; signals.push('bids🟠'); }
    else if (proposalText === '15 to 20')    { score +=  7; signals.push('bids🔴'); }
    else if (proposalText === '20 to 50')    { score +=  3; signals.push('bids💀'); }
    else                                     {              signals.push('bids❓'); }

    // ── Country (15 pts) ────────────────────────────────────────────────────
    max += 15;
    var blocked    = config.countries.blocked.list.some(c => c.trim() === countryText);
    var highlighted = config.countries.highlighted.list.some(c => c.trim() === countryText);
    if (highlighted)    { score += 15; signals.push('loc⭐'); }
    else if (!blocked)  { score +=  8; signals.push('loc🌍'); }
    else                {              signals.push('loc🚫'); }

    // ── Payment verification (25 pts) ────────────────────────────────────────
    var payEl = tile.querySelector('[data-test="payment-verification-status"]')
             || tile.querySelector('[data-test="payment-verified"]')
             || tile.querySelector('[data-test="client-payment-verification-status"]');
    if (payEl) {
        max += 25;
        var pt = payEl.innerText.toLowerCase();
        if (pt.includes('verified') && !pt.includes('unverified')) {
            score += 25; signals.push('pay✅');
        } else {
            signals.push('pay🚫');
        }
    }

    // ── Total spent (20 pts) ─────────────────────────────────────────────────
    var spentEl = tile.querySelector('[data-test="total-spent"]')
               || tile.querySelector('[data-test="client-total-spent"]');
    if (spentEl) {
        max += 20;
        var amount = parseSpent(spentEl.innerText.trim());
        if      (amount >= 10000)  { score += 20; signals.push('$$✅'); }
        else if (amount >= 1000)   { score += 15; signals.push('$$🟡'); }
        else if (amount > 0)       { score += 10; signals.push('$$🟠'); }
        else                       { score +=  3; signals.push('$$🔴'); } // $0 spent
    }

    // ── Client rating (15 pts) ───────────────────────────────────────────────
    var ratingEl = tile.querySelector('[data-test="client-rating"]')
                || tile.querySelector('[data-test="feedback-score"]')
                || tile.querySelector('[data-test="client-feedback-score"]');
    if (ratingEl) {
        max += 15;
        var rating = parseFloat(ratingEl.innerText.trim());
        if (!isNaN(rating)) {
            var rPts = Math.round((rating / 5) * 15);
            score += rPts;
            signals.push('⭐' + rating.toFixed(1));
        }
    }

    var pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;
    return { pct: pct, signals: signals };
}

// ─── Main loop ────────────────────────────────────────────────────────────────

function mainOperation() {
    injectStyles();

    var config = savedData.configuration;
    var blockedLen = config.countries.blocked.list.length;
    var highlightedLen = config.countries.highlighted.list.length;

    var jobPosts = document.querySelectorAll('[data-ev-sublocation="job_feed_tile"]');
    if (jobPosts.length === 0) jobPosts = document.querySelectorAll('.job-tile');

    for (var i = 0; i < jobPosts.length; i++) {
        var tile = jobPosts[i];

        var proposals = tile.querySelector('[data-test="proposals"]')
                     || tile.querySelector('[data-test="proposals-tier"]');
        var countries = tile.querySelector('[data-test="client-country"]')
                     || tile.querySelector('[data-test="location"]');

        // Clean previous injections
        var oldStrip = tile.querySelector('.upwk-score-strip');
        if (oldStrip) oldStrip.remove();
        var oldBadge = tile.querySelector('.upwk-badge-wrap');
        if (oldBadge) oldBadge.remove();

        // Reset customizer styles
        tile.style.backgroundColor = '';
        tile.style.boxShadow = '';
        tile.style.border = '';
        tile.style.opacity = '';

        var countryText  = countries  ? countries.innerText.trim()  : '';
        var proposalText = proposals  ? proposals.innerText.trim()  : '';

        // ── Proposal background ──────────────────────────────────────────────
        if      (proposalText === 'Less than 5') tile.style.backgroundColor = config.proposal.color.lt5;
        else if (proposalText === '5 to 10')     tile.style.backgroundColor = config.proposal.color.f5to10;
        else if (proposalText === '10 to 15')    tile.style.backgroundColor = config.proposal.color.f10to15;
        else if (proposalText === '15 to 20')    tile.style.backgroundColor = config.proposal.color.f15to20;
        else if (proposalText === '20 to 50')    tile.style.backgroundColor = config.proposal.color.f20to50;
        else                                      tile.style.backgroundColor = config.proposal.color.proother;

        // ── Country border / glow ────────────────────────────────────────────
        var isBlocked = false, isHighlighted = false;
        for (var j = 0; j < blockedLen; j++) {
            if (countryText === config.countries.blocked.list[j].trim()) { isBlocked = true; break; }
        }
        for (var j = 0; j < highlightedLen; j++) {
            if (countryText === config.countries.highlighted.list[j].trim()) { isHighlighted = true; break; }
        }
        if (isBlocked) {
            tile.style.border   = '3px solid ' + config.countries.blocked.color;
            tile.style.opacity  = '0.6';
        }
        if (isHighlighted) {
            var hlColor = config.countries.highlighted.color;
            tile.style.boxShadow = '0 0 14px 5px ' + hlColor + ', inset 0 0 0 2px ' + hlColor;
        }

        // ── Country animated badges ──────────────────────────────────────────
        if ((isBlocked || isHighlighted) && countries) {
            var wrap = document.createElement('span');
            wrap.className = 'upwk-badge-wrap';
            if (isHighlighted) {
                var b = document.createElement('span');
                b.className = 'upwk-badge upwk-badge-highlighted';
                b.textContent = '⭐';
                wrap.appendChild(b);
            }
            if (isBlocked) {
                var b = document.createElement('span');
                b.className = 'upwk-badge upwk-badge-blocked';
                b.textContent = '🚫';
                wrap.appendChild(b);
            }
            countries.appendChild(wrap);
        }

        // ── Bid score strip ──────────────────────────────────────────────────
        var result = calculateBidScore(tile, countryText, proposalText, config);
        var pct    = result.pct;
        var color  = scoreColor(pct);
        var label  = scoreLabel(pct);

        var strip = document.createElement('div');
        strip.className = 'upwk-score-strip';
        strip.innerHTML =
            '<span class="upwk-score-pct" style="color:' + color + '">' + pct + '%</span>' +
            '<div class="upwk-score-track">' +
                '<div class="upwk-score-fill" style="width:' + pct + '%;background:' + color + '"></div>' +
            '</div>' +
            '<span class="upwk-score-label" style="color:' + color + '">' + label + '</span>' +
            '<span class="upwk-score-signals">' + result.signals.join(' · ') + '</span>';

        tile.insertBefore(strip, tile.firstChild);
    }
}
