// --- js/easter_eggs.js ---

export function startBoatRace() {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const raceHtml = `
        <div id="raceModal" class="modal-overlay" style="display:flex;">
            <div class="modal-box" style="width:90%; max-width:500px; text-align:center; background:#fff; color:#000;">
                <div class="modal-close" onclick="this.parentElement.parentElement.remove()">×</div>
                <h2 style="margin-top:0;">THE GREAT STEAMBOAT RACE</h2>
                <p style="font-size:0.8rem; font-weight:bold;">${isMobile ? 'TAP THE BUTTON BELOW TO ROW!' : 'MASH THE \'SPACE\' KEY TO BEAT CINCINNATI!'}</p>
                <div id="raceTrack" style="border:4px solid #000; height:120px; position:relative; overflow:hidden; background:cyan; margin:20px 0; border-radius:10px; user-select:none; -webkit-user-select:none;">
                    <div id="playerBoat" style="position:absolute; left:0; top:20px; font-size:40px; transition: left 0.1s linear; z-index:2; transform: scaleX(-1);">🚢</div>
                    <div id="rivalBoat" style="position:absolute; left:0; top:65px; font-size:40px; transition: left 0.1s linear; opacity:0.7; z-index:1; transform: scaleX(-1);">🚤</div>
                    <div style="position:absolute; right:0; top:0; bottom:0; width:15px; background:red; border-left:2px dashed white; z-index:3;"></div>
                </div>
                <div id="raceStatus" style="font-weight:900; font-size:1.2rem; min-height:1.5em;">READY... SET...</div>
                ${isMobile ? '<button id="rowButton" style="width:100%; padding:18px; font-size:1.3rem; font-weight:900; background:#F5C518; border:3px solid #000; border-radius:10px; cursor:pointer; margin-top:10px; user-select:none; -webkit-user-select:none;">🚢 ROW! ROW! ROW! 🚢</button>' : ''}
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', raceHtml);

    let playerPos = 0; let rivalPos = 0; let racing = false;
    const finishLine = 380;

    setTimeout(() => { document.getElementById('raceStatus').innerText = "GO GO GO!"; racing = true; }, 1500);

    const rivalDrive = setInterval(() => {
        if (!racing) return;
        rivalPos += Math.random() * 8;
        const rBoat = document.getElementById('rivalBoat');
        if (rBoat) rBoat.style.left = rivalPos + 'px';

        if (rivalPos > finishLine) {
            racing = false;
            document.getElementById('raceStatus').innerText = "CINCINNATI WON. DISGRACEFUL.";
            clearInterval(rivalDrive);
        }
    }, 100);

    function movePlayer() {
        if (!racing) return;
        playerPos += 12;
        const pBoat = document.getElementById('playerBoat');
        if (pBoat) pBoat.style.left = playerPos + 'px';

        if (playerPos > finishLine) {
            racing = false;
            document.getElementById('raceStatus').innerText = "THE BELLE WINS! CHAMPION OF THE OHIO!";
            document.getElementById('raceStatus').style.color = "green";
            clearInterval(rivalDrive);
            window.removeEventListener('keydown', raceHandler);
        }
    }

    // Keyboard handler (desktop)
    const raceHandler = function (e) {
        if (e.code === "Space" && racing) {
            e.preventDefault();
            movePlayer();
        }
    };
    window.addEventListener('keydown', raceHandler);

    // Touch/tap handler (mobile) — on the row button
    const rowBtn = document.getElementById('rowButton');
    if (rowBtn) {
        rowBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            movePlayer();
        });
        rowBtn.addEventListener('mousedown', function (e) {
            e.preventDefault();
            movePlayer();
        });
    }

    // Also allow tapping the race track itself on mobile
    const raceTrack = document.getElementById('raceTrack');
    if (raceTrack && isMobile) {
        raceTrack.addEventListener('touchstart', function (e) {
            e.preventDefault();
            movePlayer();
        });
    }

    const checkClosed = setInterval(() => {
        if (!document.getElementById('raceModal')) {
            window.removeEventListener('keydown', raceHandler);
            clearInterval(rivalDrive);
            clearInterval(checkClosed);
        }
    }, 500);
}

window.startBoatRace = startBoatRace;
