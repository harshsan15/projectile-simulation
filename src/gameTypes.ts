export type Vec2 = { x: number; y: number };

export type TargetConfig = {
  id: string;
  x: number;
  y: number;
  radius: number;
};

export type TargetState = TargetConfig & {
  hit: boolean;
};

export type Projectile = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  alive: boolean;
};

export type GameState = {
  cannonPos: Vec2;
  cannonAngle: number;
  projectiles: Projectile[];
  targets: TargetState[];
  theoreticalTimeOfFlight: number | null;
  theoreticalRange: number | null;
};
