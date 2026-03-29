
setInterval(mainOperation, 3000);

var savedData, proposals, countries, jobPosts, blockedCountriesLength, highlightedCountriesLength;
var promise_pms = browser.storage.sync.get('configuration');
promise_pms.then((res) => {
  savedData = res;
});

function injectStyles() {
    if (document.getElementById('upwork-customizer-styles')) return;
    var style = document.createElement('style');
    style.id = 'upwork-customizer-styles';
    style.textContent = `
        .upwk-badge-wrap {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 5px;
            z-index: 100;
            pointer-events: none;
        }
        .upwk-badge {
            font-size: 20px;
            line-height: 1;
            filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45));
        }
        .upwk-badge-blocked {
            animation: upwk-shake 0.7s infinite;
        }
        .upwk-badge-highlighted {
            animation: upwk-bounce 1.4s ease-in-out infinite;
        }
        @keyframes upwk-shake {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            20%       { transform: translateX(-3px) rotate(-8deg); }
            40%       { transform: translateX(3px) rotate(8deg); }
            60%       { transform: translateX(-2px) rotate(-4deg); }
            80%       { transform: translateX(2px) rotate(4deg); }
        }
        @keyframes upwk-bounce {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
}

function mainOperation() {
    injectStyles();

    blockedCountriesLength = savedData.configuration.countries.blocked.list.length;
    highlightedCountriesLength = savedData.configuration.countries.highlighted.list.length;

    jobPosts = document.querySelectorAll('[data-ev-sublocation="job_feed_tile"]');
    if (jobPosts.length == 0) {
        jobPosts = document.querySelectorAll('.job-tile');
    }

    var len = jobPosts.length;
    for (var i = 0; i < len; i++) {
        var tile = jobPosts[i];

        proposals = tile.querySelector('[data-test="proposals"]');
        if (proposals === undefined || proposals === null) {
            proposals = tile.querySelector('[data-test="proposals-tier"]');
        }

        countries = tile.querySelector('[data-test="client-country"]');
        if (countries === undefined || countries === null) {
            countries = tile.querySelector('[data-test="location"]');
        }

        // Ensure tile is positioned so the badge can be placed absolutely
        if (getComputedStyle(tile).position === 'static') {
            tile.style.position = 'relative';
        }

        // Remove previously injected badges to avoid duplicates on re-runs
        var oldBadges = tile.querySelector('.upwk-badge-wrap');
        if (oldBadges) oldBadges.remove();

        // Reset all customizer-applied styles each cycle
        tile.style.backgroundColor = '';
        tile.style.boxShadow = '';
        tile.style.border = '';
        tile.style.opacity = '';

        // --- Proposals: set background color (base layer) ---
        if (proposals.innerText == "Less than 5") {
            tile.style.backgroundColor = savedData.configuration.proposal.color.lt5;
        } else if (proposals.innerText == "5 to 10") {
            tile.style.backgroundColor = savedData.configuration.proposal.color.f5to10;
        } else if (proposals.innerText == "10 to 15") {
            tile.style.backgroundColor = savedData.configuration.proposal.color.f10to15;
        } else if (proposals.innerText == "15 to 20") {
            tile.style.backgroundColor = savedData.configuration.proposal.color.f15to20;
        } else if (proposals.innerText == "20 to 50") {
            tile.style.backgroundColor = savedData.configuration.proposal.color.f20to50;
        } else {
            tile.style.backgroundColor = savedData.configuration.proposal.color.proother;
        }

        // --- Country flags ---
        var isBlocked = false;
        var isHighlighted = false;

        for (var j = 0; j < blockedCountriesLength; j++) {
            if (countries.innerText == savedData.configuration.countries.blocked.list[j]) {
                isBlocked = true;
                break;
            }
        }
        for (var j = 0; j < highlightedCountriesLength; j++) {
            if (countries.innerText == savedData.configuration.countries.highlighted.list[j]) {
                isHighlighted = true;
                break;
            }
        }

        // Blocked: thick border + dim + shake badge (does NOT overwrite bg)
        if (isBlocked) {
            tile.style.border = '3px solid ' + savedData.configuration.countries.blocked.color;
            tile.style.opacity = '0.6';
        }

        // Highlighted: outer glow + bounce badge (does NOT overwrite bg or border)
        if (isHighlighted) {
            var hlColor = savedData.configuration.countries.highlighted.color;
            tile.style.boxShadow = '0 0 14px 5px ' + hlColor + ', inset 0 0 0 2px ' + hlColor;
        }

        // Inject animated badges when needed
        if (isBlocked || isHighlighted) {
            var wrap = document.createElement('div');
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

            tile.appendChild(wrap);
        }
    }
}
