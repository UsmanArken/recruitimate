"use client";

interface RadarPoint {
  label: string;
  value: number; // 0–100
  invert?: boolean; // lower is better — flip visually
}

interface Props {
  points: RadarPoint[];
  size?: number;
}

export function SignalRadar({ points, size = 240 }: Props) {
  // pad adds extra canvas around the polygon so labels fit without overflow-visible clipping
  const pad = 38;
  const cx = size / 2 + pad;
  const cy = size / 2 + pad;
  const r = size * 0.30;
  const n = points.length;

  // angle starts at top (-π/2), goes clockwise
  function angle(i: number) {
    return (i * 2 * Math.PI) / n - Math.PI / 2;
  }

  function polar(i: number, radius: number) {
    const a = angle(i);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  // Grid rings at 25 / 50 / 75 / 100%
  const rings = [0.25, 0.5, 0.75, 1];

  // Axis lines
  const axes = points.map((_, i) => {
    const outer = polar(i, r);
    return { x1: cx, y1: cy, x2: outer.x, y2: outer.y };
  });

  // Data polygon — invert means high score = bad, so we still plot the raw value
  // but visually a low value on a bad-axis fills LESS (correct — hesitation 80 → large slice looks bad)
  const dataPoints = points.map((p, i) => {
    const pct = Math.min(1, Math.max(0, p.value / 100));
    return polar(i, r * pct);
  });
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";

  // Label positions — push out but keep within viewBox
  const labelPad = r * 0.55;
  const labels = points.map((p, i) => {
    const pos = polar(i, r + labelPad);
    const a = angle(i);
    // anchor text based on x position
    const anchor: "middle" | "end" | "start" =
      Math.abs(Math.cos(a)) < 0.15 ? "middle" : Math.cos(a) < 0 ? "end" : "start";
    return { ...pos, label: p.label, value: p.value, invert: p.invert, anchor };
  });

  const total = size + pad * 2;

  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      width={total}
      height={total}
      aria-label="Signal radar chart"
    >
      {/* Grid rings */}
      {rings.map((ring) => {
        const ringPoints = points.map((_, i) => polar(i, r * ring));
        const d = ringPoints
          .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
          .join(" ") + " Z";
        return (
          <path
            key={ring}
            d={d}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={ring === 1 ? 1.5 : 0.75}
            opacity={0.7}
          />
        );
      })}

      {/* Axis lines */}
      {axes.map((ax, i) => (
        <line
          key={i}
          x1={ax.x1}
          y1={ax.y1}
          x2={ax.x2}
          y2={ax.y2}
          stroke="var(--color-border)"
          strokeWidth={0.75}
          opacity={0.6}
        />
      ))}

      {/* Data fill */}
      <path
        d={dataPath}
        fill="var(--color-interview)"
        fillOpacity={0.15}
        stroke="var(--color-interview)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill="var(--color-interview)"
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <g key={i}>
          <text
            x={l.x}
            y={l.y - 7}
            textAnchor={l.anchor}
            fontSize={9.5}
            fontWeight={600}
            fill="var(--color-muted)"
            letterSpacing={0.3}
            className="uppercase"
          >
            {l.label}
          </text>
          <text
            x={l.x}
            y={l.y + 5}
            textAnchor={l.anchor}
            fontSize={11}
            fontWeight={700}
            fill={
              l.invert
                ? l.value > 60
                  ? "var(--color-risk)"
                  : l.value > 35
                  ? "var(--color-warning)"
                  : "var(--color-success)"
                : l.value >= 70
                ? "var(--color-success)"
                : l.value >= 40
                ? "var(--color-warning)"
                : "var(--color-risk)"
            }
          >
            {Math.round(l.value)}
          </text>
        </g>
      ))}
    </svg>
  );
}
