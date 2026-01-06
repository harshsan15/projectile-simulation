import type { GameState } from "./gameTypes";

export function renderScene(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameState
) {
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, width, height);

  // Ground
  ctx.fillStyle = "#374151";
  ctx.fillRect(0, height - 40, width, 40);

  // Cannon base
  ctx.save();
  ctx.translate(state.cannonPos.x, state.cannonPos.y);
  ctx.fillStyle = "#6b7280";
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  // Cannon barrel
  ctx.rotate(state.cannonAngle);
  ctx.fillStyle = "#9ca3af";
  ctx.fillRect(0, -6, 50, 12);
  ctx.restore();

  // Angle text
  ctx.save();
  ctx.translate(state.cannonPos.x, state.cannonPos.y);
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `Angle: ${(-state.cannonAngle * (180 / Math.PI)).toFixed(1)}°`,
    0,
    -30
  );
  ctx.restore();

  // Targets
  for (const t of state.targets) {
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
    ctx.fillStyle = t.hit ? "#22c55e" : "#ef4444";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#111827";
    ctx.stroke();
  }

  // Projectiles
  ctx.fillStyle = "#facc15";
  for (const p of state.projectiles) {
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Status text
  const allHit = state.targets.every((t) => t.hit);
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Move mouse to aim, click to fire (speed fixed)", 16, 24);

  // Theoretical physics text
  if (state.theoreticalTimeOfFlight !== null) {
    ctx.fillText(
      `Time of Flight: ${state.theoreticalTimeOfFlight.toFixed(2)}s`,
      16,
      50
    );
  }
  if (state.theoreticalRange !== null) {
    ctx.fillText(`Range: ${state.theoreticalRange.toFixed(0)}px`, 16, 76);
  }

  if (allHit) {
    ctx.fillStyle = "#22c55e";
    ctx.font = "20px sans-serif";
    ctx.fillText("Simulation successful. No targets remaining!", 16, 102);
  }
}
