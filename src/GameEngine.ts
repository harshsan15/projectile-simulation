import type { GameState, Projectile, TargetConfig, TargetState } from "./gameTypes";
import {
  createInitialState,
  stepProjectiles,
  checkCollisions,
  GRAVITY,
} from "./physics";
import { renderScene } from "./renderer";

const PROJECTILE_SPEED = 550; // px/s [web:29]
const BARREL_LENGTH = 50;

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private state: GameState;
  private lastTimestamp: number | null = null;
  private animationFrameId: number | null = null;
  private projectileIdCounter = 0;

  constructor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    targetConfigs: TargetConfig[]
  ) {
    this.ctx = ctx;
    this.canvas = canvas;

    const targets: TargetState[] = targetConfigs.map((t) => ({
      ...t,
      hit: false,
    }));

    this.state = createInitialState(targets);
    this.calculateTheoreticals();
  }

  start() {
    const loop = (timestamp: number) => {
      if (this.lastTimestamp == null) this.lastTimestamp = timestamp;
      const dt = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  dispose() {
    this.stop();
  }

  private update(dt: number) {
    this.state.projectiles = stepProjectiles(this.state.projectiles, dt, {
      width: this.canvas.width,
      height: this.canvas.height,
    });

    const { projectiles, targets } = checkCollisions(
      this.state.projectiles,
      this.state.targets
    );

    this.state.projectiles = projectiles;
    this.state.targets = targets;
  }

  private render() {
    renderScene(this.ctx, this.canvas, this.state);
  }

  private calculateTheoreticals() {
    const angle = this.state.cannonAngle;
    const muzzleX = this.state.cannonPos.x + Math.cos(angle) * BARREL_LENGTH;
    const muzzleY = this.state.cannonPos.y + Math.sin(angle) * BARREL_LENGTH;
    const vx = PROJECTILE_SPEED * Math.cos(angle);
    const vy = PROJECTILE_SPEED * Math.sin(angle);
    const groundY = this.canvas.height - 40;

    // Quadratic formula for time of flight
    const a = 0.5 * GRAVITY;
    const b = vy;
    const c = muzzleY - groundY;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      this.state.theoreticalTimeOfFlight = null;
      this.state.theoreticalRange = null;
      return;
    }

    const t = (-b + Math.sqrt(discriminant)) / (2 * a);
    if (t < 0) {
      this.state.theoreticalTimeOfFlight = null;
      this.state.theoreticalRange = null;
      return;
    }

    const range = muzzleX + vx * t;

    this.state.theoreticalTimeOfFlight = t;
    this.state.theoreticalRange = range;
  }

  setCannonAngle(angle: number) {
    this.state.cannonAngle = angle;
    this.calculateTheoreticals();
  }

  fireProjectile() {
    const muzzleX =
      this.state.cannonPos.x + Math.cos(this.state.cannonAngle) * BARREL_LENGTH;
    const muzzleY =
      this.state.cannonPos.y + Math.sin(this.state.cannonAngle) * BARREL_LENGTH;

    const vx = PROJECTILE_SPEED * Math.cos(this.state.cannonAngle);
    const vy = PROJECTILE_SPEED * Math.sin(this.state.cannonAngle);

    const projectile: Projectile = {
      id: ++this.projectileIdCounter,
      position: { x: muzzleX, y: muzzleY },
      velocity: { x: vx, y: vy },
      alive: true,
    };

    this.state.projectiles.push(projectile);
  }

  handleMouseMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const dx = x - this.state.cannonPos.x;
    const dy = y - this.state.cannonPos.y;
    const angle = Math.atan2(dy, dx); // radians [web:26]
    this.setCannonAngle(angle);
  }

  handleClick() {
    this.fireProjectile();
  }
}
