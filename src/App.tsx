import React, { useState, useEffect, useRef } from 'react';

// Seedable mulberry32 pseudo-random generator
function createPRNG(seed: number) {
  let s = seed;
  return function() {
    let t = s += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Shape {
  id: string;
  type: 'circle' | 'rect' | 'path' | 'polygon' | 'line';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rx?: number;
  ry?: number;
  points?: string;
  d?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  strokeDasharray?: string;
  driftX: number;
  driftY: number;
  rotSpeed: number;
  pulseSpeed: number;
  phaseOffset: number;
}

interface PresetPalette {
  name: string;
  colors: string[];
  bg: string;
}

interface SavedPattern {
  id: string;
  seed: number;
  complexity: number;
  styleMode: 'Bauhaus' | 'Memphis' | 'Organic' | 'Neo Brutal' | 'Line Pattern';
  paletteIndex: number;
}

const PRESET_PALETTES: PresetPalette[] = [
  {
    name: 'Ocean Glow',
    colors: ['#0077b6', '#0096c7', '#03045e', '#00b4d8', '#90e0ef'],
    bg: '#03045e'
  },
  {
    name: 'Vibrant Play',
    colors: ['#4F7CFF', '#FFC83D', '#8BE3A1', '#FF4F79', '#31C6D4'],
    bg: '#191733'
  },
  {
    name: 'Bauhaus Stark',
    colors: ['#db3a34', '#084c61', '#ffc857', '#17c3b2', '#222222'],
    bg: '#f7f5f0'
  },
  {
    name: 'Memphis Soda',
    colors: ['#ff70a6', '#ff9770', '#ffd670', '#e9ff70', '#70d6ff'],
    bg: '#121216'
  },
  {
    name: 'Cyberpunk Neon',
    colors: ['#ff0055', '#00ffcc', '#ffcc00', '#9d00ff', '#0033ff'],
    bg: '#0b0c10'
  },
  {
    name: 'Organic Earth',
    colors: ['#4a5759', '#dedbd2', '#f7e1d7', '#edafb8', '#b0c4b1'],
    bg: '#2f3e46'
  }
];

const generateShapes = (seed: number, complexity: number, styleMode: string, colors: string[], brutalShadowDir: 'left' | 'right' = 'right'): Shape[] => {
  const random = createPRNG(seed);
  const shapes: Shape[] = [];
  const count = complexity * 4 + 6;

  const randomRange = (min: number, max: number) => min + random() * (max - min);
  
  function choose<T>(arr: T[]): T {
    return arr[Math.floor(random() * arr.length)];
  }

  const brutalOffsetX = brutalShadowDir === 'left' ? -12 : 12;

  if (styleMode === 'Bauhaus') {
    shapes.push({
      id: 'bg-block-1',
      type: 'rect',
      fill: choose(colors),
      stroke: 'none',
      strokeWidth: 0,
      opacity: 0.15,
      x: randomRange(0, 400),
      y: randomRange(0, 300),
      w: randomRange(400, 800),
      h: randomRange(300, 600),
      driftX: randomRange(-15, 15),
      driftY: randomRange(-15, 15),
      rotSpeed: 0,
      pulseSpeed: randomRange(0.2, 0.5),
      phaseOffset: randomRange(0, Math.PI * 2)
    });

    for (let i = 0; i < count; i++) {
      const type = choose(['circle', 'rect', 'polygon', 'line', 'semicircle']);
      const color = choose(colors);

      if (type === 'circle') {
        shapes.push({
          id: `bauhaus-circle-${i}`,
          type: 'circle',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.8, 1),
          cx: randomRange(100, 1100),
          cy: randomRange(100, 700),
          r: randomRange(40, 180),
          driftX: randomRange(-20, 20),
          driftY: randomRange(-20, 20),
          rotSpeed: 0,
          pulseSpeed: randomRange(0.1, 0.6),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'rect') {
        shapes.push({
          id: `bauhaus-rect-${i}`,
          type: 'rect',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.8, 1),
          x: randomRange(100, 1000),
          y: randomRange(100, 600),
          w: randomRange(60, 240),
          h: randomRange(60, 240),
          driftX: randomRange(-15, 15),
          driftY: randomRange(-15, 15),
          rotSpeed: choose([0, 90, 45, -45]) * 0.01,
          pulseSpeed: randomRange(0.1, 0.5),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'polygon') {
        const x = randomRange(100, 1000);
        const y = randomRange(100, 600);
        const size = randomRange(80, 250);
        const points = `${x},${y} ${x + size},${y} ${x + size / 2},${y - size}`;
        shapes.push({
          id: `bauhaus-poly-${i}`,
          type: 'polygon',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.8, 1),
          points,
          driftX: randomRange(-20, 20),
          driftY: randomRange(-20, 20),
          rotSpeed: randomRange(-0.02, 0.02),
          pulseSpeed: randomRange(0.2, 0.6),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'line') {
        shapes.push({
          id: `bauhaus-line-${i}`,
          type: 'line',
          fill: 'none',
          stroke: color,
          strokeWidth: choose([4, 8, 12, 16]),
          opacity: randomRange(0.7, 1),
          x1: randomRange(50, 1150),
          y1: randomRange(50, 750),
          x2: randomRange(50, 1150),
          y2: randomRange(50, 750),
          driftX: randomRange(-10, 10),
          driftY: randomRange(-10, 10),
          rotSpeed: randomRange(-0.01, 0.01),
          pulseSpeed: randomRange(0.1, 0.4),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'semicircle') {
        const x = randomRange(100, 1000);
        const y = randomRange(100, 600);
        const r = randomRange(50, 150);
        const d = `M ${x} ${y} A ${r} ${r} 0 0 1 ${x + r * 2} ${y} Z`;
        shapes.push({
          id: `bauhaus-semi-${i}`,
          type: 'path',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.8, 1),
          d,
          driftX: randomRange(-15, 15),
          driftY: randomRange(-15, 15),
          rotSpeed: randomRange(-0.03, 0.03),
          pulseSpeed: randomRange(0.1, 0.5),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      }
    }
  } else if (styleMode === 'Memphis') {
    for (let i = 0; i < count; i++) {
      const type = choose(['squiggle', 'pill', 'circle', 'triangle', 'confetti']);
      const color = choose(colors);

      if (type === 'squiggle') {
        const startX = randomRange(100, 1000);
        const startY = randomRange(100, 700);
        const len = randomRange(100, 300);
        const d = `M ${startX} ${startY} Q ${startX + len/4} ${startY - 60} ${startX + len/2} ${startY} T ${startX + len} ${startY}`;
        shapes.push({
          id: `memphis-sq-${i}`,
          type: 'path',
          fill: 'none',
          stroke: color,
          strokeWidth: 4,
          opacity: 1,
          d,
          driftX: randomRange(-15, 15),
          driftY: randomRange(-15, 15),
          rotSpeed: randomRange(-0.04, 0.04),
          pulseSpeed: randomRange(0.3, 0.7),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'pill') {
        shapes.push({
          id: `memphis-pill-${i}`,
          type: 'rect',
          fill: color,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x: randomRange(100, 1000),
          y: randomRange(100, 600),
          w: randomRange(120, 260),
          h: randomRange(40, 70),
          rx: 30,
          ry: 30,
          driftX: randomRange(-20, 20),
          driftY: randomRange(-20, 20),
          rotSpeed: randomRange(-0.05, 0.05),
          pulseSpeed: randomRange(0.2, 0.6),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'circle') {
        shapes.push({
          id: `memphis-circle-${i}`,
          type: 'circle',
          fill: color,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          cx: randomRange(100, 1100),
          cy: randomRange(100, 700),
          r: randomRange(25, 90),
          driftX: randomRange(-25, 25),
          driftY: randomRange(-25, 25),
          rotSpeed: 0,
          pulseSpeed: randomRange(0.3, 0.8),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'triangle') {
        const x = randomRange(100, 1000);
        const y = randomRange(100, 600);
        const s = randomRange(40, 100);
        const points = `${x},${y} ${x + s},${y + s} ${x - s},${y + s}`;
        shapes.push({
          id: `memphis-tri-${i}`,
          type: 'polygon',
          fill: color,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          points,
          driftX: randomRange(-15, 15),
          driftY: randomRange(-15, 15),
          rotSpeed: randomRange(-0.06, 0.06),
          pulseSpeed: randomRange(0.4, 0.8),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'confetti') {
        const x = randomRange(50, 1150);
        const y = randomRange(50, 750);
        const size = 15;
        const d = `M ${x - size} ${y} L ${x + size} ${y} M ${x} ${y - size} L ${x} ${y + size}`;
        shapes.push({
          id: `memphis-con-${i}`,
          type: 'path',
          fill: 'none',
          stroke: color,
          strokeWidth: 3,
          opacity: 0.9,
          d,
          driftX: randomRange(-30, 30),
          driftY: randomRange(-30, 30),
          rotSpeed: randomRange(-0.08, 0.08),
          pulseSpeed: randomRange(0.5, 1.2),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      }
    }
  } else if (styleMode === 'Organic') {
    for (let i = 0; i < count; i++) {
      const type = choose(['ellipse', 'blob', 'wave']);
      const color = choose(colors);

      if (type === 'ellipse') {
        shapes.push({
          id: `organic-el-${i}`,
          type: 'rect',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.4, 0.75),
          x: randomRange(50, 950),
          y: randomRange(50, 550),
          w: randomRange(150, 450),
          h: randomRange(100, 300),
          rx: 150,
          ry: 100,
          driftX: randomRange(-25, 25),
          driftY: randomRange(-25, 25),
          rotSpeed: randomRange(-0.02, 0.02),
          pulseSpeed: randomRange(0.1, 0.4),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'blob') {
        const cx = randomRange(200, 1000);
        const cy = randomRange(150, 650);
        const r = randomRange(100, 280);
        const d = `M ${cx - r} ${cy} 
                   C ${cx - r} ${cy - r * 0.8} ${cx - r * 0.2} ${cy - r * 1.2} ${cx + r * 0.3} ${cy - r}
                   C ${cx + r * 0.8} ${cy - r * 0.8} ${cx + r} ${cy - r * 0.1} ${cx + r * 0.7} ${cy + r * 0.7}
                   C ${cx + r * 0.5} ${cy + r * 1.1} ${cx - r * 0.4} ${cy + r} ${cx - r * 0.8} ${cy + r * 0.5}
                   Z`;
        shapes.push({
          id: `organic-blob-${i}`,
          type: 'path',
          fill: color,
          stroke: 'none',
          strokeWidth: 0,
          opacity: randomRange(0.35, 0.7),
          d,
          driftX: randomRange(-35, 35),
          driftY: randomRange(-35, 35),
          rotSpeed: randomRange(-0.015, 0.015),
          pulseSpeed: randomRange(0.08, 0.3),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      } else if (type === 'wave') {
        const startY = randomRange(200, 600);
        const amp = randomRange(50, 150);
        const d = `M 0 ${startY} C 300 ${startY - amp} 600 ${startY + amp} 900 ${startY - amp} T 1200 ${startY}`;
        shapes.push({
          id: `organic-wave-${i}`,
          type: 'path',
          fill: 'none',
          stroke: color,
          strokeWidth: randomRange(2, 6),
          opacity: randomRange(0.5, 0.95),
          d,
          driftX: 0,
          driftY: randomRange(-20, 20),
          rotSpeed: 0,
          pulseSpeed: randomRange(0.2, 0.5),
          phaseOffset: randomRange(0, Math.PI * 2)
        });
      }
    }
  } else if (styleMode === 'Neo Brutal') {
    shapes.push({
      id: 'brutal-grid-x1',
      type: 'line',
      fill: 'none',
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 2,
      opacity: 1,
      x1: 300, y1: 0, x2: 300, y2: 800,
      driftX: 0, driftY: 0, rotSpeed: 0, pulseSpeed: 0, phaseOffset: 0
    });
    shapes.push({
      id: 'brutal-grid-x2',
      type: 'line',
      fill: 'none',
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 2,
      opacity: 1,
      x1: 600, y1: 0, x2: 600, y2: 800,
      driftX: 0, driftY: 0, rotSpeed: 0, pulseSpeed: 0, phaseOffset: 0
    });
    shapes.push({
      id: 'brutal-grid-x3',
      type: 'line',
      fill: 'none',
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 2,
      opacity: 1,
      x1: 900, y1: 0, x2: 900, y2: 800,
      driftX: 0, driftY: 0, rotSpeed: 0, pulseSpeed: 0, phaseOffset: 0
    });
    shapes.push({
      id: 'brutal-grid-y1',
      type: 'line',
      fill: 'none',
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 2,
      opacity: 1,
      x1: 0, y1: 266, x2: 1200, y2: 266,
      driftX: 0, driftY: 0, rotSpeed: 0, pulseSpeed: 0, phaseOffset: 0
    });
    shapes.push({
      id: 'brutal-grid-y2',
      type: 'line',
      fill: 'none',
      stroke: 'rgba(255,255,255,0.06)',
      strokeWidth: 2,
      opacity: 1,
      x1: 0, y1: 532, x2: 1200, y2: 532,
      driftX: 0, driftY: 0, rotSpeed: 0, pulseSpeed: 0, phaseOffset: 0
    });

    for (let i = 0; i < count; i++) {
      const type = choose(['rect', 'circle', 'triangle', 'arrow']);
      const color = choose(colors);

      if (type === 'rect') {
        const x = randomRange(100, 950);
        const y = randomRange(100, 550);
        const w = randomRange(100, 300);
        const h = randomRange(100, 250);
        const driftX = randomRange(-15, 15);
        const driftY = randomRange(-15, 15);
        const rotSpeed = randomRange(-0.02, 0.02);
        const pulseSpeed = randomRange(0.15, 0.45);
        const phaseOffset = randomRange(0, Math.PI * 2);

        shapes.push({
          id: `brutal-rect-shadow-${i}`,
          type: 'rect',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x + brutalOffsetX,
          y: y + 12,
          w, h,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        shapes.push({
          id: `brutal-rect-real-${i}`,
          type: 'rect',
          fill: color,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x, y, w, h,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (type === 'circle') {
        const cx = randomRange(150, 1050);
        const cy = randomRange(150, 650);
        const r = randomRange(45, 130);
        const driftX = randomRange(-20, 20);
        const driftY = randomRange(-20, 20);
        const rotSpeed = 0;
        const pulseSpeed = randomRange(0.2, 0.5);
        const phaseOffset = randomRange(0, Math.PI * 2);

        shapes.push({
          id: `brutal-circle-shadow-${i}`,
          type: 'circle',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          cx: cx + brutalOffsetX,
          cy: cy + 12,
          r,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        shapes.push({
          id: `brutal-circle-real-${i}`,
          type: 'circle',
          fill: color,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          cx, cy, r,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (type === 'triangle') {
        const x = randomRange(100, 950);
        const y = randomRange(100, 550);
        const size = randomRange(90, 220);
        const driftX = randomRange(-15, 15);
        const driftY = randomRange(-15, 15);
        const rotSpeed = randomRange(-0.03, 0.03);
        const pulseSpeed = randomRange(0.2, 0.6);
        const phaseOffset = randomRange(0, Math.PI * 2);

        const pointsShadow = `${x + brutalOffsetX},${y + 12} ${x + size + brutalOffsetX},${y + 12} ${x + size/2 + brutalOffsetX},${y - size + 12}`;
        shapes.push({
          id: `brutal-tri-shadow-${i}`,
          type: 'polygon',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: pointsShadow,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });

        const pointsReal = `${x},${y} ${x + size},${y} ${x + size / 2},${y - size}`;
        shapes.push({
          id: `brutal-tri-real-${i}`,
          type: 'polygon',
          fill: color,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: pointsReal,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (type === 'arrow') {
        const x = randomRange(100, 950);
        const y = randomRange(100, 550);
        const w = 180;
        const h = 70;
        const driftX = randomRange(-15, 15);
        const driftY = randomRange(-15, 15);
        const rotSpeed = randomRange(-0.04, 0.04);
        const pulseSpeed = randomRange(0.25, 0.65);
        const phaseOffset = randomRange(0, Math.PI * 2);

        const dShadow = `M ${x + brutalOffsetX} ${y + 12} L ${x + w/2 + brutalOffsetX} ${y + 12} L ${x + w/2 + brutalOffsetX} ${y - h/2 + 12} L ${x + w + brutalOffsetX} ${y + h/2 + 12} L ${x + w/2 + brutalOffsetX} ${y + h * 1.5 + 12} L ${x + w/2 + brutalOffsetX} ${y + h + 12} L ${x + brutalOffsetX} ${y + h + 12} Z`;
        shapes.push({
          id: `brutal-arrow-shadow-${i}`,
          type: 'path',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          d: dShadow,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });

        const dReal = `M ${x} ${y} L ${x + w / 2} ${y} L ${x + w / 2} ${y - h / 2} L ${x + w} ${y + h / 2} L ${x + w / 2} ${y + h * 1.5} L ${x + w / 2} ${y + h} L ${x} ${y + h} Z`;
        shapes.push({
          id: `brutal-arrow-real-${i}`,
          type: 'path',
          fill: color,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          d: dReal,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      }
    }
  } else if (styleMode === 'Line Pattern') {
    const lineType = choose(['waves', 'starburst', 'orbits', 'maze']);
    const strokeWidth = choose([2, 3, 4, 6]);

    if (lineType === 'waves') {
      const lineCount = complexity * 5 + 8;
      const baseSpacing = 800 / lineCount;
      const amp = randomRange(30, 100);
      const phaseShift = randomRange(0.2, 0.8);

      for (let i = 0; i < lineCount; i++) {
        const startY = i * baseSpacing + randomRange(-10, 10);
        const color = choose(colors);
        const d = `M 0 ${startY} C 300 ${startY - amp} 600 ${startY + amp} 900 ${startY - amp} T 1200 ${startY}`;
        shapes.push({
          id: `line-wave-${i}`,
          type: 'path',
          fill: 'none',
          stroke: color,
          strokeWidth: randomRange(1.5, strokeWidth),
          opacity: randomRange(0.6, 0.95),
          d,
          driftX: 0,
          driftY: randomRange(-25, 25),
          rotSpeed: 0,
          pulseSpeed: randomRange(0.2, 0.6),
          phaseOffset: i * phaseShift
        });
      }
    } else if (lineType === 'starburst') {
      const centerCount = choose([1, 2]);
      for (let c = 0; c < centerCount; c++) {
        const cx = randomRange(200, 1000);
        const cy = randomRange(150, 650);
        const rayCount = complexity * 10 + 16;
        const driftX = randomRange(-40, 40);
        const driftY = randomRange(-40, 40);
        const pulseSpeed = randomRange(0.3, 0.7);

        for (let i = 0; i < rayCount; i++) {
          const angle = (i * Math.PI * 2) / rayCount;
          const length = 1500;
          const x2 = cx + Math.cos(angle) * length;
          const y2 = cy + Math.sin(angle) * length;

          shapes.push({
            id: `line-ray-${c}-${i}`,
            type: 'line',
            fill: 'none',
            stroke: choose(colors),
            strokeWidth: randomRange(1, 4),
            opacity: randomRange(0.5, 0.9),
            x1: cx,
            y1: cy,
            x2,
            y2,
            driftX,
            driftY,
            rotSpeed: randomRange(-0.01, 0.01),
            pulseSpeed,
            phaseOffset: i * 0.1
          });
        }
      }
    } else if (lineType === 'orbits') {
      const cx = randomRange(300, 900);
      const cy = randomRange(200, 600);
      const orbitCount = complexity * 4 + 8;
      const baseRadius = randomRange(40, 100);
      const radiusStep = randomRange(15, 35);
      const driftX = randomRange(-30, 30);
      const driftY = randomRange(-30, 30);
      const pulseSpeed = randomRange(0.1, 0.4);

      for (let i = 0; i < orbitCount; i++) {
        const r = baseRadius + i * radiusStep;
        shapes.push({
          id: `line-orbit-${i}`,
          type: 'circle',
          fill: 'none',
          stroke: choose(colors),
          strokeWidth: randomRange(1.5, 6),
          opacity: randomRange(0.6, 0.95),
          cx,
          cy,
          r,
          driftX,
          driftY,
          rotSpeed: 0,
          pulseSpeed,
          phaseOffset: i * 0.2
        });
      }
    } else if (lineType === 'maze') {
      const spacing = randomRange(40, 80);
      const cols = Math.floor(1200 / spacing) + 2;
      const rows = Math.floor(800 / spacing) + 2;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * spacing;
          const y = row * spacing;
          const color = choose(colors);
          const orientation = choose(['slash', 'backslash', 'both']);
          const driftX = randomRange(-15, 15);
          const driftY = randomRange(-15, 15);
          const pulseSpeed = randomRange(0.2, 0.5);

          if (orientation === 'slash' || orientation === 'both') {
            shapes.push({
              id: `line-maze-s-${col}-${row}`,
              type: 'line',
              fill: 'none',
              stroke: color,
              strokeWidth: randomRange(2, 5),
              opacity: randomRange(0.7, 0.95),
              x1: x,
              y1: y + spacing,
              x2: x + spacing,
              y2: y,
              driftX,
              driftY,
              rotSpeed: 0,
              pulseSpeed,
              phaseOffset: (col + row) * 0.1
            });
          }
          if (orientation === 'backslash' || orientation === 'both') {
            shapes.push({
              id: `line-maze-bs-${col}-${row}`,
              type: 'line',
              fill: 'none',
              stroke: color,
              strokeWidth: randomRange(2, 5),
              opacity: randomRange(0.7, 0.95),
              x1: x,
              y1: y,
              x2: x + spacing,
              y2: y + spacing,
              driftX,
              driftY,
              rotSpeed: 0,
              pulseSpeed,
              phaseOffset: (col + row) * 0.1 + 0.5
            });
          }
        }
      }
    }
  }

  return shapes;
};

export default function AbstractPatternGenerator() {
  const [seed, setSeed] = useState(837291);
  const [complexity, setComplexity] = useState(7);
  const [styleMode, setStyleMode] = useState<'Bauhaus' | 'Memphis' | 'Organic' | 'Neo Brutal' | 'Line Pattern'>('Bauhaus');
  const [activePalette, setActivePalette] = useState(PRESET_PALETTES[1]); // default Vibrant Play
  const [isAnimating, setIsAnimating] = useState(false);
  const [time, setTime] = useState(0);
  const [savedPresets, setSavedPresets] = useState([] as SavedPattern[]);
  
  // New States for Image Upload and Background Transparency
  const [sourceImageName, setSourceImageName] = useState<string | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [transparentBg, setTransparentBg] = useState(false);

  // State for user stamped custom shapes
  const [userShapes, setUserShapes] = useState([] as Shape[]);
  // State for manual object generator style selection
  const [objectStyle, setObjectStyle] = useState<'Bauhaus' | 'Memphis' | 'Organic' | 'Neo Brutal'>('Neo Brutal');
  // State for representational object type spawner
  const [spawnerType, setSpawnerType] = useState<'People' | 'Buildings' | 'Roads' | 'Trees'>('People');
  // State for canvas clearing
  const [isCanvasCleared, setIsCanvasCleared] = useState(false);
  // State for Neo Brutalist shadow direction
  const [brutalShadowDir, setBrutalShadowDir] = useState<'left' | 'right'>('right');

  const animationFrameId = useRef<number | null>(null);

  const handleColorChange = (index: number, newColor: string) => {
    const updatedColors = [...activePalette.colors];
    updatedColors[index] = newColor;
    setActivePalette({
      ...activePalette,
      name: activePalette.name.startsWith('Custom') ? activePalette.name : `Custom Palette`,
      colors: updatedColors
    });
  };

  const handleBgColorChange = (newColor: string) => {
    setActivePalette({
      ...activePalette,
      name: activePalette.name.startsWith('Custom') ? activePalette.name : `Custom Palette`,
      bg: newColor
    });
  };

  const handleClearStamps = () => {
    setUserShapes([]);
  };

  const handleClearCanvas = () => {
    setIsCanvasCleared(true);
    setUserShapes([]);
  };

  const spawnStyledObject = (
    x: number,
    y: number,
    type: 'People' | 'Buildings' | 'Roads' | 'Trees',
    style: 'Bauhaus' | 'Memphis' | 'Organic' | 'Neo Brutal'
  ) => {
    const seedVal = Math.floor(x * y + Date.now() % 10000);
    const random = createPRNG(seedVal);
    
    function choose<T>(arr: T[]): T {
      return arr[Math.floor(random() * arr.length)];
    }
    const randomRange = (min: number, max: number) => min + random() * (max - min);

    const colors = activePalette.colors;
    const size = randomRange(100, 180);
    const shapeId = `user-shape-${Date.now()}-${Math.floor(random() * 1000)}`;

    const driftX = randomRange(-15, 15);
    const driftY = randomRange(-15, 15);
    const rotSpeed = randomRange(-0.02, 0.02);
    const pulseSpeed = randomRange(0.2, 0.5);
    const phaseOffset = randomRange(0, Math.PI * 2);

    const newShapes: Shape[] = [];
    const brutalOffsetX = brutalShadowDir === 'left' ? -12 : 12;

    if (type === 'People') {
      if (style === 'Neo Brutal') {
        // Torso shadow
        newShapes.push({
          id: `${shapeId}-torso-shadow`,
          type: 'polygon',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x - size / 3.2 + brutalOffsetX},${y + size / 2 + 12} ${x + size / 3.2 + brutalOffsetX},${y + size / 2 + 12} ${x + brutalOffsetX},${y + 12}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Head shadow
        newShapes.push({
          id: `${shapeId}-head-shadow`,
          type: 'circle',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          cx: x + brutalOffsetX,
          cy: y - size / 5 + 12,
          r: size / 5.2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Torso real
        newShapes.push({
          id: `${shapeId}-torso-real`,
          type: 'polygon',
          fill: choose(colors),
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x - size / 3.2},${y + size / 2} ${x + size / 3.2},${y + size / 2} ${x},${y}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Head real
        newShapes.push({
          id: `${shapeId}-head-real`,
          type: 'circle',
          fill: choose(colors),
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          cx: x,
          cy: y - size / 5,
          r: size / 5.2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Bauhaus') {
        const color1 = colors[0];
        const color2 = colors[1] || colors[0];
        const color3 = colors[2] || colors[0];
        const rTorso = size / 3.2;
        // Torso
        newShapes.push({
          id: `${shapeId}-torso`,
          type: 'path',
          fill: color1,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          d: `M ${x - rTorso} ${y + size/2} A ${rTorso} ${rTorso} 0 0 1 ${x + rTorso} ${y + size/2} Z`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Head
        newShapes.push({
          id: `${shapeId}-head`,
          type: 'circle',
          fill: color2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          cx: x,
          cy: y - size / 5,
          r: size / 6.5,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Legs
        newShapes.push({
          id: `${shapeId}-leg-l`,
          type: 'line',
          fill: 'none',
          stroke: color3,
          strokeWidth: 8,
          opacity: 0.9,
          x1: x - size / 8,
          y1: y + size / 2,
          x2: x - size / 8,
          y2: y + size / 1.5,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-leg-r`,
          type: 'line',
          fill: 'none',
          stroke: color3,
          strokeWidth: 8,
          opacity: 0.9,
          x1: x + size / 8,
          y1: y + size / 2,
          x2: x + size / 8,
          y2: y + size / 1.5,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Memphis') {
        const mColor1 = choose(colors);
        const mColor2 = choose(colors);
        const mColor3 = choose(colors);
        // Torso (cylinder pill)
        newShapes.push({
          id: `${shapeId}-torso`,
          type: 'rect',
          fill: mColor1,
          stroke: '#000000',
          strokeWidth: 3,
          opacity: 1,
          x: x - size / 4,
          y,
          w: size / 2,
          h: size / 2,
          rx: 18,
          ry: 18,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Head
        newShapes.push({
          id: `${shapeId}-head`,
          type: 'circle',
          fill: mColor2,
          stroke: '#000000',
          strokeWidth: 3,
          opacity: 1,
          cx: x,
          cy: y - size / 4,
          r: size / 6.5,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Bowtie
        newShapes.push({
          id: `${shapeId}-bowtie-l`,
          type: 'polygon',
          fill: mColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          points: `${x - 14},${y - 6} ${x},${y} ${x - 14},${y + 6}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-bowtie-r`,
          type: 'polygon',
          fill: mColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          points: `${x + 14},${y - 6} ${x},${y} ${x + 14},${y + 6}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Organic') {
        const oColor1 = choose(colors);
        const oColor2 = choose(colors);
        // Torso
        newShapes.push({
          id: `${shapeId}-torso`,
          type: 'path',
          fill: oColor1,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.65,
          d: `M ${x} ${y - size/6} C ${x - size/3.2} ${y + size/6} ${x - size/4} ${y + size/2} ${x} ${y + size/2} C ${x + size/4} ${y + size/2} ${x + size/3.2} ${y + size/6} ${x} ${y - size/6} Z`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Head
        newShapes.push({
          id: `${shapeId}-head`,
          type: 'rect',
          fill: oColor2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.75,
          x: x - size / 6.5,
          y: y - size / 3,
          w: size / 3.25,
          h: size / 4.2,
          rx: size / 6.5,
          ry: size / 8.4,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      }
    } else if (type === 'Buildings') {
      if (style === 'Neo Brutal') {
        const bColor1 = choose(colors);
        const bColor2 = choose(colors);
        const bColor3 = choose(colors);
        // Shadows
        newShapes.push({
          id: `${shapeId}-wing-shadow`,
          type: 'rect',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - size / 2.2 + brutalOffsetX,
          y: y - size / 10 + 12,
          w: size / 3.2,
          h: size * 0.5,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-tower-shadow`,
          type: 'rect',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - size / 8 + brutalOffsetX,
          y: y - size / 2 + 12,
          w: size / 2.5,
          h: size * 0.9,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-spire-shadow`,
          type: 'polygon',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x - size / 8 + brutalOffsetX},${y - size / 2 + 12} ${x + size / 3.6 + brutalOffsetX},${y - size / 2 + 12} ${x + size / 12 + brutalOffsetX},${y - size / 1.5 + 12}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Real structures
        newShapes.push({
          id: `${shapeId}-wing-real`,
          type: 'rect',
          fill: bColor1,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - size / 2.2,
          y: y - size / 10,
          w: size / 3.2,
          h: size * 0.5,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-tower-real`,
          type: 'rect',
          fill: bColor2,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - size / 8,
          y: y - size / 2,
          w: size / 2.5,
          h: size * 0.9,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-spire-real`,
          type: 'polygon',
          fill: bColor3,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x - size / 8},${y - size / 2} ${x + size / 3.6},${y - size / 2} ${x + size / 12},${y - size / 1.5}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Windows
        newShapes.push({
          id: `${shapeId}-slot-1`,
          type: 'line',
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 4,
          opacity: 1,
          x1: x + size / 24,
          y1: y - size / 3,
          x2: x + size / 24,
          y2: y + size / 4,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-slot-2`,
          type: 'line',
          fill: 'none',
          stroke: '#FFFFFF',
          strokeWidth: 4,
          opacity: 1,
          x1: x + size / 8,
          y1: y - size / 3,
          x2: x + size / 8,
          y2: y + size / 4,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Bauhaus') {
        const bbColor1 = colors[0];
        const bbColor2 = colors[1] || colors[0];
        const bbColor3 = colors[2] || colors[0];
        const bbColor4 = colors[3] || colors[0];
        // Stacked geometric blocks
        newShapes.push({
          id: `${shapeId}-base`,
          type: 'rect',
          fill: bbColor1,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          x: x - size / 2,
          y: y + size / 6,
          w: size,
          h: size / 4,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-mid`,
          type: 'rect',
          fill: bbColor2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          x: x - size / 3,
          y: y - size / 4,
          w: size / 1.5,
          h: size / 2.3,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-top`,
          type: 'rect',
          fill: bbColor3,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          x: x - size / 6,
          y: y - size / 2,
          w: size / 3,
          h: size / 4,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Circle detail
        const semiR = size / 8;
        newShapes.push({
          id: `${shapeId}-deco`,
          type: 'path',
          fill: bbColor4,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.9,
          d: `M ${x - size/4} ${y - size/4} A ${semiR} ${semiR} 0 0 1 ${x} ${y - size/4} Z`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Memphis') {
        const mbColor1 = choose(colors);
        const mbColor2 = choose(colors);
        const mbColor3 = choose(colors);
        // Memphis facade
        newShapes.push({
          id: `${shapeId}-facade`,
          type: 'rect',
          fill: mbColor1,
          stroke: '#000000',
          strokeWidth: 3,
          opacity: 1,
          x: x - size / 3,
          y: y - size / 2.2,
          w: size / 1.5,
          h: size * 0.9,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Memphis roof
        newShapes.push({
          id: `${shapeId}-roof`,
          type: 'polygon',
          fill: mbColor2,
          stroke: '#000000',
          strokeWidth: 3,
          opacity: 1,
          points: `${x - size / 3},${y - size / 2.2} ${x + size / 3},${y - size / 2.2} ${x},${y - size / 1.5}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Stripe on roof
        newShapes.push({
          id: `${shapeId}-roof-line`,
          type: 'line',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x1: x - size / 6,
          y1: y - size / 1.9,
          x2: x + size / 6,
          y2: y - size / 1.9,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Windows
        const winW = 15;
        newShapes.push({
          id: `${shapeId}-win-1`,
          type: 'rect',
          fill: mbColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x: x - size / 6,
          y: y - size / 3,
          w: winW,
          h: winW,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-win-2`,
          type: 'rect',
          fill: mbColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x: x + size / 12,
          y: y - size / 3,
          w: winW,
          h: winW,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-win-3`,
          type: 'rect',
          fill: mbColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x: x - size / 6,
          y: y - size / 6,
          w: winW,
          h: winW,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-win-4`,
          type: 'rect',
          fill: mbColor3,
          stroke: '#000000',
          strokeWidth: 2,
          opacity: 1,
          x: x + size / 12,
          y: y - size / 6,
          w: winW,
          h: winW,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Organic') {
        const obColor1 = choose(colors);
        const obColor2 = choose(colors);
        // Organic dome
        newShapes.push({
          id: `${shapeId}-dome`,
          type: 'path',
          fill: obColor1,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.6,
          d: `M ${x - size/3} ${y + size/2} C ${x - size/3} ${y - size/3} ${x} ${y - size/1.8} ${x} ${y - size/1.8} C ${x} ${y - size/1.8} ${x + size/3} ${y - size/3} ${x + size/3} ${y + size/2} Z`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Rounded soft window
        newShapes.push({
          id: `${shapeId}-window`,
          type: 'rect',
          fill: obColor2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.75,
          x: x - size / 8,
          y: y - size / 8,
          w: size / 4,
          h: size / 3,
          rx: size / 8,
          ry: size / 6,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      }
    } else if (type === 'Roads') {
      if (style === 'Neo Brutal') {
        const roadCol = choose(colors);
        // Shadow
        newShapes.push({
          id: `${shapeId}-shadow`,
          type: 'path',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 52,
          opacity: 1,
          d: `M ${x - size + brutalOffsetX} ${y + 12} C ${x - size/2 + brutalOffsetX} ${y - size/3 + 12} ${x + size/2 + brutalOffsetX} ${y + size/3 + 12} ${x + size + brutalOffsetX} ${y + 12}`,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Outline
        newShapes.push({
          id: `${shapeId}-outline`,
          type: 'path',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 44,
          opacity: 1,
          d: `M ${x - size} ${y} C ${x - size/2} ${y - size/3} ${x + size/2} ${y + size/3} ${x + size} ${y}`,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Face
        newShapes.push({
          id: `${shapeId}-face`,
          type: 'path',
          fill: 'none',
          stroke: roadCol,
          strokeWidth: 32,
          opacity: 1,
          d: `M ${x - size} ${y} C ${x - size/2} ${y - size/3} ${x + size/2} ${y + size/3} ${x + size} ${y}`,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Dashed lines
        newShapes.push({
          id: `${shapeId}-dividers`,
          type: 'path',
          fill: 'none',
          stroke: '#FFD166',
          strokeWidth: 3,
          strokeDasharray: '12,18',
          opacity: 1,
          d: `M ${x - size} ${y} C ${x - size/2} ${y - size/3} ${x + size/2} ${y + size/3} ${x + size} ${y}`,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Bauhaus') {
        const brColor1 = colors[0];
        const brColor2 = colors[1] || colors[0];
        const brColor3 = colors[2] || colors[0];
        // Diagonal intersecting primary bands
        newShapes.push({
          id: `${shapeId}-road-1`,
          type: 'line',
          fill: 'none',
          stroke: brColor1,
          strokeWidth: 32,
          opacity: 0.95,
          x1: x - size,
          y1: y - size / 2,
          x2: x + size,
          y2: y + size / 2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-road-2`,
          type: 'line',
          fill: 'none',
          stroke: brColor2,
          strokeWidth: 16,
          opacity: 0.9,
          x1: x - size / 3,
          y1: y + size / 2,
          x2: x + size / 3,
          y2: y - size / 2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-divider`,
          type: 'line',
          fill: 'none',
          stroke: brColor3,
          strokeWidth: 4,
          opacity: 0.95,
          x1: x - size,
          y1: y - size / 2,
          x2: x + size,
          y2: y + size / 2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Memphis') {
        const mrColor1 = choose(colors);
        const mrColor2 = choose(colors);
        const roadD = `M ${x - size} ${y} Q ${x} ${y - size/2} ${x + size} ${y}`;
        // Road outline
        newShapes.push({
          id: `${shapeId}-outline`,
          type: 'path',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 28,
          opacity: 1,
          d: roadD,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Road face
        newShapes.push({
          id: `${shapeId}-face`,
          type: 'path',
          fill: 'none',
          stroke: mrColor1,
          strokeWidth: 22,
          opacity: 1,
          d: roadD,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        // Road dashed lane
        newShapes.push({
          id: `${shapeId}-dashes`,
          type: 'path',
          fill: 'none',
          stroke: mrColor2,
          strokeWidth: 3,
          strokeDasharray: '8,8',
          opacity: 1,
          d: roadD,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Organic') {
        const orColor1 = choose(colors);
        const orColor2 = choose(colors);
        const organicRoadD = `M ${x - size} ${y - size/4} C ${x - size/2} ${y - size/2} ${x + size/2} ${y + size/2} ${x + size} ${y - size/4}`;
        // Translucent wide curved river road
        newShapes.push({
          id: `${shapeId}-river`,
          type: 'path',
          fill: 'none',
          stroke: orColor1,
          strokeWidth: 28,
          opacity: 0.5,
          d: organicRoadD,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-lane`,
          type: 'path',
          fill: 'none',
          stroke: orColor2,
          strokeWidth: 12,
          opacity: 0.75,
          d: organicRoadD,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      }
    } else if (type === 'Trees') {
      if (style === 'Neo Brutal') {
        const tColor1 = choose(colors);
        const tColor2 = choose(colors);
        const tColor3 = choose(colors);
        // Trunk shadow
        newShapes.push({
          id: `${shapeId}-trunk-shadow`,
          type: 'rect',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - 10 + brutalOffsetX,
          y: y + 12,
          w: 20,
          h: size / 2,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Foliage tier shadows
        newShapes.push({
          id: `${shapeId}-tier2-shadow`,
          type: 'polygon',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x + brutalOffsetX},${y - size/4 + 12} ${x - size/2.2 + brutalOffsetX},${y + size/6 + 12} ${x + size/2.2 + brutalOffsetX},${y + size/6 + 12}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-tier1-shadow`,
          type: 'polygon',
          fill: '#000000',
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x + brutalOffsetX},${y - size/2 + 12} ${x - size/3.5 + brutalOffsetX},${y - size/5 + 12} ${x + size/3.5 + brutalOffsetX},${y - size/5 + 12}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Real trunk
        newShapes.push({
          id: `${shapeId}-trunk-real`,
          type: 'rect',
          fill: tColor1,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          x: x - 10,
          y,
          w: 20,
          h: size / 2,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Real bottom tier
        newShapes.push({
          id: `${shapeId}-tier2-real`,
          type: 'polygon',
          fill: tColor2,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x},${y - size/4} ${x - size/2.2},${y + size/6} ${x + size/2.2},${y + size/6}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Real top tier
        newShapes.push({
          id: `${shapeId}-tier1-real`,
          type: 'polygon',
          fill: tColor3,
          stroke: '#000000',
          strokeWidth: 5,
          opacity: 1,
          points: `${x},${y - size/2} ${x - size/3.5},${y - size/5} ${x + size/3.5},${y - size/5}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      } else if (style === 'Bauhaus') {
        const btColor1 = colors[0];
        const btColor2 = colors[1] || colors[0];
        const btColor3 = colors[2] || colors[0];
        // Symmetrical Bauhaus geometry spruce
        newShapes.push({
          id: `${shapeId}-trunk`,
          type: 'rect',
          fill: btColor1,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          x: x - 6,
          y,
          w: 12,
          h: size / 1.6,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-foliage-base`,
          type: 'circle',
          fill: btColor2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.95,
          cx: x,
          cy: y - size / 4,
          r: size / 3.2,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-foliage-accent`,
          type: 'circle',
          fill: btColor3,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.9,
          cx: x - size / 10,
          cy: y - size / 3,
          r: size / 8,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Memphis') {
        const mtColor1 = choose(colors);
        const mtColor2 = choose(colors);
        const mtColor3 = choose(colors);
        // Whimsical Memphis palm tree
        newShapes.push({
          id: `${shapeId}-trunk`,
          type: 'line',
          fill: 'none',
          stroke: '#000000',
          strokeWidth: 4,
          opacity: 1,
          x1: x,
          y1: y + size / 2,
          x2: x,
          y2: y - size / 6,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-leaf-l`,
          type: 'circle',
          fill: mtColor1,
          stroke: '#000000',
          strokeWidth: 2.5,
          opacity: 1,
          cx: x - size / 4,
          cy: y - size / 4,
          r: size / 5,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-leaf-r`,
          type: 'circle',
          fill: mtColor2,
          stroke: '#000000',
          strokeWidth: 2.5,
          opacity: 1,
          cx: x + size / 4,
          cy: y - size / 4,
          r: size / 5,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
        newShapes.push({
          id: `${shapeId}-leaf-c`,
          type: 'circle',
          fill: mtColor3,
          stroke: '#000000',
          strokeWidth: 2.5,
          opacity: 1,
          cx: x,
          cy: y - size / 2.2,
          r: size / 4.5,
          driftX, driftY, rotSpeed: 0, pulseSpeed, phaseOffset
        });
      } else if (style === 'Organic') {
        const otColor1 = choose(colors);
        const otColor2 = choose(colors);
        // Curving organic trunk
        newShapes.push({
          id: `${shapeId}-trunk`,
          type: 'path',
          fill: 'none',
          stroke: otColor1,
          strokeWidth: 8,
          opacity: 0.7,
          d: `M ${x} ${y + size/2} Q ${x - size/12} ${y + size/4} ${x} ${y}`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
        // Flowy bean leaf foliage
        newShapes.push({
          id: `${shapeId}-foliage`,
          type: 'path',
          fill: otColor2,
          stroke: 'none',
          strokeWidth: 0,
          opacity: 0.6,
          d: `M ${x} ${y - size/3} C ${x - size/3.2} ${y - size/3} ${x - size/2.5} ${y + size/12} ${x} ${y + size/12} C ${x + size/2.5} ${y + size/12} ${x + size/3.2} ${y - size/3} ${x} ${y - size/3} Z`,
          driftX, driftY, rotSpeed, pulseSpeed, phaseOffset
        });
      }
    }

    setUserShapes(prev => [...prev, ...newShapes]);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1200;
    const y = ((e.clientY - rect.top) / rect.height) * 800;

    spawnStyledObject(x, y, spawnerType, objectStyle);
  };

  const handleGenerateRandomObject = () => {
    const x = Math.random() * 1000 + 100;
    const y = Math.random() * 600 + 100;
    spawnStyledObject(x, y, spawnerType, objectStyle);
  };

  useEffect(() => {
    const saved = localStorage.getItem('abstract-patterns');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  useEffect(() => {
    if (isAnimating) {
      const tick = () => {
        setTime(prev => prev + 0.03);
        animationFrameId.current = requestAnimationFrame(tick);
      };
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isAnimating]);

  const generateNewPattern = () => {
    setSeed(Math.floor(Math.random() * 900000) + 100000);
    setUserShapes([]);
    setIsCanvasCleared(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSourceImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Create small in-memory canvas to sample pixel colors
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 30, 30);
        
        const imgData = ctx.getImageData(0, 0, 30, 30).data;
        const sampledColors: string[] = [];
        
        // Sample every 16th pixel to find high contrast options
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const hex = '#' + [r, g, b].map(x => {
            const hexStr = x.toString(16);
            return hexStr.length === 1 ? '0' + hexStr : hexStr;
          }).join('');
          sampledColors.push(hex);
        }

        // Deduplicate and choose 5 distinct colors based on Euclidean color distance
        const distinct: string[] = [];
        for (const c of sampledColors) {
          if (distinct.length >= 5) break;
          const isDistinct = distinct.every(existC => {
            const r1 = parseInt(c.slice(1, 3), 16);
            const g1 = parseInt(c.slice(3, 5), 16);
            const b1 = parseInt(c.slice(5, 7), 16);
            const r2 = parseInt(existC.slice(1, 3), 16);
            const g2 = parseInt(existC.slice(3, 5), 16);
            const b2 = parseInt(existC.slice(5, 7), 16);
            const diff = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
            return diff > 45; 
          });
          if (isDistinct) {
            distinct.push(c);
          }
        }

        // Fill remaining palette slots if image had low color variance
        while (distinct.length < 5 && sampledColors.length > 0) {
          const c = sampledColors.pop()!;
          if (!distinct.includes(c)) {
            distinct.push(c);
          }
        }
        while (distinct.length < 5) {
          distinct.push('#ffffff');
        }

        // Derive seed from image properties so it generates a deterministic layout
        const derivedSeed = file.size + file.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setSeed(derivedSeed);

        setActivePalette({
          name: `Image: ${file.name.slice(0, 10)}...`,
          colors: distinct,
          bg: distinct[4] || '#121216'
        });
        
        setSourceImagePreview(reader.result as string);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSourceImageName(null);
    setSourceImagePreview(null);
    setActivePalette(PRESET_PALETTES[1]); // Reset back to Vibrant Play
  };

  const handleSavePreset = () => {
    const paletteIndex = PRESET_PALETTES.findIndex(p => p.name === activePalette.name);
    const newPreset: SavedPattern = {
      id: String(Date.now()),
      seed,
      complexity,
      styleMode,
      paletteIndex: paletteIndex !== -1 ? paletteIndex : 1 // fallback to Vibrant Play if custom image palette
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    localStorage.setItem('abstract-patterns', JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('abstract-patterns', JSON.stringify(updated));
  };

  const handleLoadPreset = (preset: SavedPattern) => {
    setSeed(preset.seed);
    setComplexity(preset.complexity);
    setStyleMode(preset.styleMode);
    const pal = PRESET_PALETTES[preset.paletteIndex];
    if (pal) {
      setActivePalette(pal);
      setSourceImagePreview(null);
      setSourceImageName(null);
    }
    setUserShapes([]);
    setIsCanvasCleared(false);
  };

  const handleExportSVG = () => {
    const svgEl = document.getElementById('pattern-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `abstract-pattern-${seed}-${styleMode.toLowerCase().replace(' ', '-')}${transparentBg ? '-transparent' : ''}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const svgEl = document.getElementById('pattern-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw background only if not transparent
        if (!transparentBg) {
          ctx.fillStyle = activePalette.bg;
          ctx.fillRect(0, 0, 1200, 800);
        }
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `abstract-pattern-${seed}-${styleMode.toLowerCase().replace(' ', '-')}${transparentBg ? '-transparent' : ''}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const shapes = isCanvasCleared
    ? []
    : generateShapes(seed, complexity, styleMode, activePalette.colors, brutalShadowDir);

  return (
    <div className="min-h-screen bg-[#0c0c0f] text-white flex items-center justify-center p-10">
      <div className="w-full max-w-7xl grid grid-cols-[320px_1fr] gap-6">
        <aside className="bg-[#151518]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4 sidebar-panel">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
              Abstract Pattern Generator
            </p>
            <h1 className="text-3xl font-black leading-tight">
              Generative
              <br />
              Playground
            </h1>
          </div>

          <button
            onClick={generateNewPattern}
            className="w-full h-14 rounded-2xl bg-[#4F7CFF] font-semibold text-lg hover:scale-[1.02] transition-transform shadow-lg shadow-[#4F7CFF]/20"
          >
            Generate Pattern
          </button>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Complexity</p>
              <p className="text-sm text-white/40">{complexity}</p>
            </div>

            <input
              type="range"
              min="2"
              max="15"
              value={complexity}
              onChange={(e) => setComplexity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <p className="text-sm text-white/70 mb-3">Style Mode</p>

            <div className="grid grid-cols-2 gap-2">
              {(['Bauhaus', 'Memphis', 'Organic', 'Neo Brutal', 'Line Pattern'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStyleMode(mode)}
                  style={{ gridColumn: mode === 'Line Pattern' ? 'span 2' : undefined }}
                  className={`h-11 rounded-xl text-sm transition ${
                    styleMode === mode
                      ? 'bg-[#4F7CFF] border-[#4F7CFF] text-white font-medium shadow-md shadow-[#4F7CFF]/15'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Generate from Image Upload panel */}
          <div className="space-y-2">
            <p className="text-sm text-white/70">Generate from Image</p>
            {sourceImagePreview ? (
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <img
                    src={sourceImagePreview}
                    alt="Source image preview"
                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-white/90 truncate max-w-[140px] font-medium">
                      {sourceImageName}
                    </span>
                    <span className="text-[10px] text-white/40">Palette Sampled</span>
                  </div>
                </div>
                <button
                  onClick={handleClearImage}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
                  title="Clear source image"
                >
                  ×
                </button>
              </div>
            ) : (
              <label className="image-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <svg className="w-5 h-5 text-white/50 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="font-semibold text-white/80">Upload source image</p>
                <p className="text-[10px]">Extracts palette & seed</p>
              </label>
            )}
          </div>

          <div>
            <p className="text-sm text-white/70 mb-3">Palette Presets</p>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRESET_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    onClick={() => {
                      setActivePalette(pal);
                      setSourceImagePreview(null);
                      setSourceImageName(null);
                    }}
                    className={`flex items-center justify-center p-1 rounded-xl border transition ${
                      activePalette.name === pal.name && !sourceImagePreview ? 'border-[#4F7CFF] bg-[#4F7CFF]/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                    title={pal.name}
                  >
                    <div className="flex gap-1">
                      {pal.colors.slice(0, 4).map((c, index) => (
                        <span key={index} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Palette & BG colors */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <p className="text-xs uppercase tracking-[0.1em] text-white/40 mb-2">Edit Colors & Background</p>
            <div className="flex gap-2 items-center flex-wrap">
              {activePalette.colors.map((color, index) => (
                <label
                  key={index}
                  className="relative w-8 h-8 rounded-full border border-white/20 cursor-pointer overflow-hidden hover:scale-110 transition-transform shadow-md shadow-black/30"
                  style={{ backgroundColor: color }}
                  title={`Edit shape color ${index + 1}`}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              ))}
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <label
                className="relative w-8 h-8 rounded-full border border-white/20 cursor-pointer overflow-hidden hover:scale-110 transition-transform flex items-center justify-center bg-black/25 shadow-md shadow-black/30"
                style={{ backgroundColor: activePalette.bg }}
                title="Edit background color"
              >
                <span className="text-[9px] text-white/60 font-black tracking-tighter select-none">BG</span>
                <input
                  type="color"
                  value={activePalette.bg}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </div>

          {/* Switch toggle for transparent background export */}
          <div className="switch-container">
            <span className="text-sm text-white/70 font-semibold">Transparent Background</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportSVG}
              className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 transition font-medium"
            >
              Export SVG
            </button>

            <button
              onClick={handleExportPNG}
              className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/15 transition font-medium"
            >
              Export PNG
            </button>
          </div>

          {/* Styled Object Spawner panel */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <p className="text-xs uppercase tracking-[0.1em] text-white/40 mb-1">Object Spawner</p>
            
            <p className="text-[11px] text-white/40">Object Style</p>
            <div className="grid grid-cols-2 gap-2">
              {(['Bauhaus', 'Memphis', 'Organic', 'Neo Brutal'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => setObjectStyle(style)}
                  className={`h-9 rounded-xl text-xs transition ${
                    objectStyle === style
                      ? 'bg-[#4F7CFF] border-[#4F7CFF] text-white font-medium shadow-md shadow-[#4F7CFF]/15'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-white/40">Object Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['People', 'Buildings', 'Roads', 'Trees'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSpawnerType(type)}
                  className={`h-9 rounded-xl text-xs transition ${
                    spawnerType === type
                      ? 'bg-[#4F7CFF] border-[#4F7CFF] text-white font-medium shadow-md shadow-[#4F7CFF]/15'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-white/40">Brutal Shadow Direction</p>
                <span className="text-[10px] text-white/50 capitalize font-medium">{brutalShadowDir}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['left', 'right'] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setBrutalShadowDir(dir)}
                    className={`h-8 rounded-lg text-xs transition ${
                      brutalShadowDir === dir
                        ? 'bg-[#4F7CFF] border-[#4F7CFF] text-white font-medium shadow-sm'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {dir === 'left' ? '← Left' : 'Right →'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateRandomObject}
              className="w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition"
            >
              Generate {objectStyle} {spawnerType === 'People' ? 'Person' : spawnerType === 'Buildings' ? 'Building' : spawnerType === 'Roads' ? 'Road' : 'Tree'}
            </button>
          </div>

          {/* Saved presets list */}
          {savedPresets.length > 0 && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs uppercase tracking-[0.1em] text-white/40 mb-2">Saved Seeds</p>
              <div className="saved-presets-container space-y-2">
                {savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="saved-preset-card cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white/90">Seed #{preset.seed}</span>
                      <span className="text-[10px] text-white/40">{preset.styleMode} • C:{preset.complexity}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeletePreset(preset.id, e)}
                      title="Delete Preset"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className={`relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl min-h-[760px] flex items-center justify-center transition ${
          transparentBg ? 'preview-transparent' : ''
        }`} style={{ backgroundColor: transparentBg ? undefined : '#121216' }}>
          <div className="absolute top-6 right-6 z-20 flex gap-3">
            {userShapes.length > 0 && (
              <button
                onClick={handleClearStamps}
                className="h-11 px-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition font-medium"
              >
                Clear Stamps
              </button>
            )}

            <button
              onClick={handleClearCanvas}
              className="h-11 px-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition font-medium"
            >
              Clear Canvas
            </button>

            <button
              onClick={handleSavePreset}
              className="h-11 px-5 rounded-2xl bg-black/45 backdrop-blur-xl border border-white/10 text-sm hover:bg-black/60 transition"
            >
              Save Seed
            </button>

            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`h-11 px-5 rounded-2xl backdrop-blur-xl border text-sm transition ${
                isAnimating
                  ? 'bg-[#8BE3A1]/20 border-[#8BE3A1]/40 text-[#8BE3A1] font-semibold'
                  : 'bg-black/45 border-white/10 text-white hover:bg-black/60'
              }`}
            >
              {isAnimating ? 'Pause' : 'Animate'}
            </button>
          </div>

          <svg
            id="pattern-svg"
            width="100%"
            height="100%"
            viewBox="0 0 1200 800"
            className="absolute inset-0 cursor-crosshair"
            onClick={handleCanvasClick}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Omit background rectangle if transparency is enabled */}
            {!transparentBg && <rect width="1200" height="800" fill={activePalette.bg} />}

            {[...shapes, ...userShapes].map((shape) => {
              // Apply real-time animation offsets
              const dx = isAnimating ? shape.driftX * Math.sin(time + shape.phaseOffset) : 0;
              const dy = isAnimating ? shape.driftY * Math.cos(time + shape.phaseOffset) : 0;
              const angle = isAnimating ? shape.rotSpeed * time * 57.2958 : 0; // convert to degrees
              const scale = isAnimating ? 1 + 0.08 * Math.sin(shape.pulseSpeed * time + shape.phaseOffset) : 1;

              // Compound transform matrices
              let transformStr = '';
              if (shape.type === 'circle' && (dx !== 0 || dy !== 0 || scale !== 1)) {
                transformStr = `translate(${dx}, ${dy}) translate(${shape.cx}, ${shape.cy}) scale(${scale}) translate(${-shape.cx!}, ${-shape.cy!})`;
              } else if (shape.type === 'rect') {
                const cx = shape.x! + shape.w! / 2;
                const cy = shape.y! + shape.h! / 2;
                transformStr = `translate(${dx}, ${dy}) translate(${cx}, ${cy}) rotate(${angle}) scale(${scale}) translate(${-cx}, ${-cy})`;
              } else if (shape.type === 'polygon' || shape.type === 'path') {
                transformStr = `translate(${dx}, ${dy}) translate(600, 400) rotate(${angle}) scale(${scale}) translate(-600, -400)`;
              } else if (shape.type === 'line') {
                transformStr = `translate(${dx}, ${dy})`;
              }

              if (shape.type === 'circle') {
                return (
                  <circle
                    key={shape.id}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    fill={shape.fill}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeDasharray={shape.strokeDasharray || undefined}
                    opacity={shape.opacity}
                    transform={transformStr || undefined}
                  />
                );
              } else if (shape.type === 'rect') {
                return (
                  <rect
                    key={shape.id}
                    x={shape.x}
                    y={shape.y}
                    width={shape.w}
                    height={shape.h}
                    rx={shape.rx}
                    ry={shape.ry}
                    fill={shape.fill}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeDasharray={shape.strokeDasharray || undefined}
                    opacity={shape.opacity}
                    transform={transformStr || undefined}
                  />
                );
              } else if (shape.type === 'polygon') {
                return (
                  <polygon
                    key={shape.id}
                    points={shape.points}
                    fill={shape.fill}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeDasharray={shape.strokeDasharray || undefined}
                    opacity={shape.opacity}
                    transform={transformStr || undefined}
                  />
                );
              } else if (shape.type === 'path') {
                return (
                  <path
                    key={shape.id}
                    d={shape.d}
                    fill={shape.fill}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeDasharray={shape.strokeDasharray || undefined}
                    opacity={shape.opacity}
                    transform={transformStr || undefined}
                  />
                );
              } else if (shape.type === 'line') {
                return (
                  <line
                    key={shape.id}
                    x1={shape.x1}
                    y1={shape.y1}
                    x2={shape.x2}
                    y2={shape.y2}
                    stroke={shape.stroke}
                    strokeWidth={shape.strokeWidth}
                    strokeDasharray={shape.strokeDasharray || undefined}
                    opacity={shape.opacity}
                    transform={transformStr || undefined}
                  />
                );
              }
              return null;
            })}
          </svg>
 
          <div className="absolute bottom-6 left-6 z-20 bg-black/45 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-[#8BE3A1] animate-pulse' : 'bg-white/40'}`} />
            <p className="text-sm text-white/70 font-mono">Seed #{seed}</p>
          </div>
 
          {/* Mouse Click stamp tip */}
          <div className="absolute bottom-6 right-6 z-20 bg-black/45 border border-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 pointer-events-none">
            <p className="text-xs text-white/50">💡 Click canvas to stamp {objectStyle} {spawnerType}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
