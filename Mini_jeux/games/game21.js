let game19 = {};

export function startGame21(container, onFinish) {
    container.innerHTML = `
        <div style="text-align:center; font-family:'VT323', monospace; color:white; background:#050509; padding:20px; border-radius:15px;">
            <h2 style="margin:0 0 10px;">🐜 Tour des Fourmis — Version inversée</h2>
            <p style="margin:0 0 10px;">Objectif : <br>
            <span style="color:#afff9f;">Empiler les fourmis avec la plus petite en bas → la plus grande en haut</span></p>

            <canvas id="hanoiCanvas19" width="520" height="300"
                style="border:4px solid #ff3860; border-radius:8px; box-shadow:0 0 25px #ff3860aa; cursor:pointer;">
            </canvas>

            <p id="msg19" style="margin-top:10px; min-height:24px; font-size:1.1em;">
                Clique une pile pour prendre une fourmi, puis une autre pour la poser.
            </p>
        </div>
    `;

    const canvas = container.querySelector("#hanoiCanvas19");
    const ctx = canvas.getContext("2d");

    game19 = {
        ctx,
        canvas,
        onFinish,
        selected: null,

        // 1 = petite fourmi, 4 = grosse
        piles: [
            [4, 3, 2, 1], // On commence avec la plus grande en bas
            [],
            []
        ],

        colors: ["#afff9f", "#86eefa", "#f79df8", "#ff3860"]
    };

    canvas.addEventListener("click", clickHanoi19);
    renderHanoi19();
}

/* ------------------ CLICK ------------------ */

function clickHanoi19(e) {
    const rect = game19.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    const pileIndex = Math.floor(mx / (game19.canvas.width / 3));

    if (game19.selected === null) {
        if (game19.piles[pileIndex].length === 0) return;
        game19.selected = pileIndex;
        document.getElementById("msg19").textContent = "Choisis où poser la fourmi…";
    } else {
        moveHanoi19(game19.selected, pileIndex);
        game19.selected = null;
    }

    renderHanoi19();
}

/* ------------------ MOVE ------------------ */

function moveHanoi19(from, to) {
    if (from === to) return;

    const pileFrom = game19.piles[from];
    const pileTo = game19.piles[to];

    if (pileFrom.length === 0) return;

    const ant = pileFrom[pileFrom.length - 1];

    // RÈGLE INVERSÉE :
    // On ne peut poser qu'une fourmi PLUS GRANDE sur une PLUS PETITE
    if (pileTo.length > 0 && pileTo[pileTo.length - 1] < ant) {
        document.getElementById("msg19").textContent =
            "❌ Une petite fourmi ne peut pas porter une grosse !";
        return;
    }

    pileFrom.pop();
    pileTo.push(ant);

    checkWinHanoi19();
}

/* ------------------ WIN ------------------ */

function checkWinHanoi19() {
    const target = [4, 3, 2, 1]; // 1 en bas, 4 en haut

    for (const pile of game19.piles) {
        if (pile.length === 4 && JSON.stringify(pile) === JSON.stringify(target)) {
            document.getElementById("msg19").textContent =
                "🎉 Bravo ! Tu as empilé les fourmis dans le bon ordre inversé !";
            setTimeout(() => game19.onFinish && game19.onFinish(), 1500);
        }
    }
}

/* ------------------ RENDER ------------------ */

function renderHanoi19() {
    const ctx = game19.ctx;
    const { width, height } = game19.canvas;

    ctx.fillStyle = "#050509";
    ctx.fillRect(0, 0, width, height);

    const pileWidth = width / 3;

    for (let p = 0; p < 3; p++) {
        const pile = game19.piles[p];

        // Tige
        ctx.fillStyle = "#ffffff33";
        ctx.fillRect(p * pileWidth + pileWidth / 2 - 3, 40, 6, 220);

        // Fourmis
        for (let i = 0; i < pile.length; i++) {
            const ant = pile[i];
            const y = height - 20 - i * 25;

            const barWidth = 40 + ant * 25;
            const x = p * pileWidth + pileWidth / 2 - barWidth / 2;

            ctx.fillStyle = game19.colors[ant - 1];
            ctx.fillRect(x, y, barWidth, 20);

            // Tête de fourmi
            ctx.fillStyle = "#050509";
            ctx.fillRect(x + barWidth - 12, y + 5, 8, 8);
        }
    }

    // Highlight pile sélectionnée
    if (game19.selected !== null) {
        ctx.strokeStyle = "#afff9f";
        ctx.lineWidth = 4;
        ctx.strokeRect(
            game19.selected * pileWidth + 5,
            5,
            pileWidth - 10,
            height - 10
        );
    }
}
