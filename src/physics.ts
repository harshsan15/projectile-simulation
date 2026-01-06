import type { GameState, Projectile, TargetState, Vec2 } from "./gameTypes";

export const GRAVITY = 400; // px/s^2 downward (tune by feel) [web:29]

export function stepProjectiles(
  projectiles: Projectile[],
  dt: number,
  bounds: { width: number; height: number }
): Projectile[] {
  return projectiles
    .map((p) => {
      if (!p.alive) return p;

      const newPos: Vec2 = {
        x: p.position.x + p.velocity.x * dt,
        y: p.position.y + p.velocity.y * dt + 0.5 * GRAVITY * dt * dt
      };

      const newVel: Vec2 = {
        x: p.velocity.x,
        y: p.velocity.y + GRAVITY * dt
      };

      const outOfBounds =
        newPos.y > bounds.height || newPos.x > bounds.width || newPos.x < 0;

      return {
        ...p,
        position: newPos,
        velocity: newVel,
        alive: !outOfBounds
      };
    })
    .filter((p) => p.alive);
}

export function checkCollisions(
  projectiles: Projectile[],
  targets: TargetState[]
): { projectiles: Projectile[]; targets: TargetState[] } {
  const updatedTargets = targets.map((t) => ({ ...t }));
  const updatedProjectiles = projectiles.map((p) => ({ ...p }));

  for (const p of updatedProjectiles) {
    if (!p.alive) continue;

    for (const t of updatedTargets) {
      if (t.hit) continue;

      const dx = p.position.x - t.x;
      const dy = p.position.y - t.y;
      const rSum = t.radius + 5; // projectile radius ~ 5px
      if (dx * dx + dy * dy <= rSum * rSum) {
        t.hit = true;
        p.alive = false;
        break;
      }
    }
  }

  return {
    projectiles: updatedProjectiles.filter((p) => p.alive),
    targets: updatedTargets
  };
}

export function createInitialState(targets: TargetState[]): GameState {
  return {
    cannonPos: { x: 80, y: 380 },
    cannonAngle: 0,
    projectiles: [],
    targets,
    theoreticalTimeOfFlight: null,
    theoreticalRange: null,
  };
}
