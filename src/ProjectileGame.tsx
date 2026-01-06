import React, { useEffect, useRef } from "react";
import targetsConfig from "./targets.json";
import { GameEngine } from "./GameEngine";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 420;

export const ProjectileGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const engine = new GameEngine(ctx, canvas, targetsConfig);
    engineRef.current = engine;
    engine.start();

    const handleMouseMove = (e: MouseEvent) => {
      engine.handleMouseMove(e.clientX, e.clientY);
    };

    const handleClick = () => {
      engine.handleClick();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleClick);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#020617",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: "2px solid #4b5563",
          background: "#111827",
          borderRadius: 8,
          boxShadow: "0 0 40px rgba(0,0,0,0.7)"
        }}
      />
    </div>
  );
};
