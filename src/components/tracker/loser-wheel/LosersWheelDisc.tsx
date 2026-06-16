"use client";

import { WHEEL_SEGMENTS } from "@/lib/loser-wheel";

type LosersWheelDiscProps = {
  rotation: number;
  spinning: boolean;
};

export function LosersWheelDisc({ rotation, spinning }: LosersWheelDiscProps) {
  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <div
      className={[
        "relative aspect-square w-full max-w-[min(92vw,420px)]",
        spinning ? "losers-wheel-blur" : "",
      ].join(" ")}
    >
      <div
        className="absolute inset-0 rounded-full border-4 border-wc-gold/80 shadow-[0_0_60px_rgba(245,197,66,0.35),inset_0_0_40px_rgba(0,0,0,0.5)]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? undefined : "transform 0.3s ease-out",
        }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {WHEEL_SEGMENTS.map((segment, index) => {
            const startAngle = index * segmentAngle - 90;
            const endAngle = startAngle + segmentAngle;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = 100 + 95 * Math.cos(startRad);
            const y1 = 100 + 95 * Math.sin(startRad);
            const x2 = 100 + 95 * Math.cos(endRad);
            const y2 = 100 + 95 * Math.sin(endRad);
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const midAngle = startAngle + segmentAngle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const labelX = 100 + 62 * Math.cos(midRad);
            const labelY = 100 + 62 * Math.sin(midRad);

            return (
              <g key={segment.id}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  stroke="rgba(0,0,0,0.25)"
                  strokeWidth="0.5"
                />
                <text
                  x={labelX}
                  y={labelY - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                >
                  {segment.emoji}
                </text>
                <text
                  x={labelX}
                  y={labelY + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="6.5"
                  fontWeight="700"
                  style={{ letterSpacing: "0.02em" }}
                >
                  {segment.label.toUpperCase()}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="18" fill="#1a1f2e" stroke="#f5c542" strokeWidth="2" />
          <text x="100" y="104" textAnchor="middle" fontSize="16">
            🎡
          </text>
        </svg>
      </div>

      {/* Pointer */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
        <div className="h-0 w-0 border-x-[14px] border-b-[24px] border-x-transparent border-b-wc-gold drop-shadow-[0_2px_8px_rgba(245,197,66,0.6)]" />
      </div>
    </div>
  );
}
