export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const touching = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r;

export function step(x, y, dx, dy, speed, dt) {
  const n = Math.hypot(dx, dy) || 1;
  return { x: x + dx / n * speed * dt, y: y + dy / n * speed * dt };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const button = document.getElementById("start");
  const keys = new Set();
  const W = canvas.width, H = canvas.height;
  const PLAYER_SPEED = 230;
  const ZOMBIE_SPEED = 65;
  let player, zombies, elapsed, spawnTimer, hurtTimer;
  let running = false, started = false, last = 0;

  function reset() {
    player = { x: W / 2, y: H / 2, r: 14, hp: 100 };
    zombies = [];
    elapsed = 0;
    spawnTimer = 0.8;
    hurtTimer = 0;
    keys.clear();
  }

  function spawn() {
    if (zombies.length >= 80) return;
    const edge = Math.floor(Math.random() * 4);
    const z = { x: Math.random() * W, y: Math.random() * H, r: 13 };
    if (edge === 0) z.x = -20;
    if (edge === 1) z.x = W + 20;
    if (edge === 2) z.y = -20;
    if (edge === 3) z.y = H + 20;
    zombies.push(z);
  }

  const movementKeys = [
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
    "KeyW", "KeyA", "KeyS", "KeyD"
  ];

  addEventListener("keydown", e => {
    if (movementKeys.includes(e.code)) {
      e.preventDefault();
      keys.add(e.code);
    }
  });
  addEventListener("keyup", e => keys.delete(e.code));
  addEventListener("blur", () => keys.clear());
  document.addEventListener("visibilitychange", () => {
    keys.clear();
    last = performance.now();
  });

  button.onclick = () => {
    reset();
    running = true;
    started = true;
    last = performance.now();
    button.textContent = "다시 시작";
    button.blur();
  };

  function drawCharacter(o, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#10202a";
    ctx.fillRect(o.x - 6, o.y - 4, 4, 4);
    ctx.fillRect(o.x + 3, o.y - 4, 4, 4);
  }

  function frame(now) {
    const dt = document.hidden ? 0 : Math.min((now - last) / 1000, 0.05);
    last = now;

    if (running && dt > 0) {
      elapsed += dt;
      hurtTimer = Math.max(0, hurtTimer - dt);
      const dx = Number(keys.has("ArrowRight") || keys.has("KeyD"))
               - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
      const dy = Number(keys.has("ArrowDown") || keys.has("KeyS"))
               - Number(keys.has("ArrowUp") || keys.has("KeyW"));

      const next = step(player.x, player.y, dx, dy, PLAYER_SPEED, dt);
      player.x = clamp(next.x, player.r, W - player.r);
      player.y = clamp(next.y, player.r, H - player.r);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawn();
        spawnTimer = Math.max(0.3, 1.1 - elapsed / 100);
      }

      for (const z of zombies) {
        const nextZ = step(z.x, z.y, player.x - z.x, player.y - z.y,
                          ZOMBIE_SPEED + Math.min(elapsed, 90), dt);
        z.x = nextZ.x;
        z.y = nextZ.y;
        if (touching(player, z) && hurtTimer <= 0) {
          player.hp = clamp(player.hp - 20, 0, 100);
          hurtTimer = 1;
          if (player.hp === 0) {
            running = false;
            break;
          }
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#233340";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    zombies.forEach(z => drawCharacter(z, "#78d984"));
    drawCharacter(player, hurtTimer > 0 ? "#ff7b7b" : "#68b6ff");

    document.getElementById("health").textContent = `체력: ${player.hp}`;
    document.getElementById("time").textContent = `생존: ${elapsed.toFixed(1)}초`;
    document.getElementById("count").textContent = `좀비: ${zombies.length}`;

    if (!running) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText(started ? "GAME OVER" : "ZOMBIE SURVIVAL", W / 2, H / 2 - 15);
      ctx.font = "22px sans-serif";
      ctx.fillText(started ? `생존 기록: ${elapsed.toFixed(1)}초`
                           : "아래 게임 시작 버튼을 눌러주세요", W / 2, H / 2 + 30);
    }
    requestAnimationFrame(frame);
  }

  reset();
  requestAnimationFrame(frame);
}
