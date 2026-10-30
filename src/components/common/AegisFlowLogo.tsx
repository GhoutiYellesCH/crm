import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function AegisFlowLogo({ size = 32, className = "", showText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]"
      >
        <defs>
          <linearGradient id="aegisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="innerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Shield Outer Silhouette */}
        <path
          d="M 50 12 L 82 22 C 82 52, 68 76, 50 88 C 32 76, 18 52, 18 22 Z"
          fill="#090d16"
          stroke="url(#aegisGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield */}
        <path
          d="M 50 19 L 76 27 C 76 50, 64 69, 50 79 C 36 69, 24 50, 24 27 Z"
          fill="#040711"
          stroke="url(#innerGlow)"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeLinejoin="round"
        />

        {/* Dynamic Workflow Geometry */}
        <path
          d="M 50 30 L 35 52 L 50 68 L 65 52 Z"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 50 30 L 50 68"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        <path
          d="M 35 52 L 65 52"
          fill="none"
          stroke="#c084fc"
          strokeWidth="1.5"
        />

        {/* Hub Nodes */}
        <circle cx="50" cy="30" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
        <circle cx="35" cy="52" r="3.5" fill="#818cf8" stroke="#ffffff" strokeWidth="1" />
        <circle cx="65" cy="52" r="3.5" fill="#a855f7" stroke="#ffffff" strokeWidth="1" />
        <circle cx="50" cy="68" r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.2" />
      </svg>

      {showText && (
        <div className="flex flex-col select-none leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              AEGISFLOW
            </span>
            <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-primary/20 text-primary border border-primary/30">
              CRM
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground font-medium tracking-tight mt-0.5">
            Privacy & Security Suite
          </span>
        </div>
      )}
    </div>
  );
}
