import React from 'react';

interface PragyanRobotLogoProps {
  size?: number | string;
  className?: string;
  withGlow?: boolean;
}

export const PragyanRobotLogo: React.FC<PragyanRobotLogoProps> = ({
  size = 40,
  className = '',
  withGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Soft Glow */}
      {withGlow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/30 via-indigo-500/20 to-purple-500/30 blur-md pointer-events-none" />
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-sm select-none"
      >
        <defs>
          {/* Main Head Gradient: Blue to Purple */}
          <linearGradient id="robotHeadGrad" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>

          {/* Face Screen Gradient: Deep Midnight Indigo */}
          <linearGradient id="faceScreenGrad" x1="25" y1="35" x2="95" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Friendly Glowing Cyan Eyes */}
          <linearGradient id="eyeGlowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Ear-Pad Gradient */}
          <linearGradient id="earPadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Cheerful Blush */}
          <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Antenna --- */}
        <line x1="60" y1="10" x2="60" y2="22" stroke="#818CF8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="8" r="6" fill="#38BDF8" className="animate-pulse" />
        <circle cx="60" cy="8" r="3" fill="#FFFFFF" />

        {/* --- Left Ear Headphone --- */}
        <rect x="8" y="44" width="10" height="26" rx="5" fill="url(#earPadGrad)" />
        <rect x="14" y="49" width="4" height="16" rx="2" fill="#C7D2FE" />

        {/* --- Right Ear Headphone --- */}
        <rect x="102" y="44" width="10" height="26" rx="5" fill="url(#earPadGrad)" />
        <rect x="102" y="49" width="4" height="16" rx="2" fill="#C7D2FE" />

        {/* --- Outer Robot Head (Curved Squircle) --- */}
        <rect
          x="16"
          y="20"
          width="88"
          height="76"
          rx="26"
          fill="url(#robotHeadGrad)"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeOpacity="0.4"
        />

        {/* Top Head Highlight / Gloss */}
        <path
          d="M32 24 C44 22, 76 22, 88 24 C94 25, 96 28, 92 31 C82 28, 38 28, 28 31 C24 28, 26 25, 32 24 Z"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />

        {/* --- Inner Visor / Face Screen --- */}
        <rect
          x="26"
          y="32"
          width="68"
          height="52"
          rx="18"
          fill="url(#faceScreenGrad)"
          stroke="#4F46E5"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />

        {/* --- Friendly Smiling Left Eye (Curved Crescent Wink/Smile) --- */}
        <ellipse cx="45" cy="50" rx="7" ry="8" fill="url(#eyeGlowGrad)" />
        <circle cx="47" cy="48" r="2.8" fill="#FFFFFF" />
        <circle cx="43" cy="53" r="1.2" fill="#FFFFFF" />

        {/* --- Friendly Smiling Right Eye (Expressive) --- */}
        <ellipse cx="75" cy="50" rx="7" ry="8" fill="url(#eyeGlowGrad)" />
        <circle cx="77" cy="48" r="2.8" fill="#FFFFFF" />
        <circle cx="73" cy="53" r="1.2" fill="#FFFFFF" />

        {/* --- Cute Rosy Cheeks --- */}
        <circle cx="37" cy="62" r="5.5" fill="url(#blushGrad)" />
        <circle cx="83" cy="62" r="5.5" fill="url(#blushGrad)" />

        {/* --- Warm Happy Smile --- */}
        <path
          d="M48 64 Q60 74 72 64"
          stroke="#38BDF8"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Smile Little Dimple Ends */}
        <circle cx="48" cy="64" r="1.5" fill="#38BDF8" />
        <circle cx="72" cy="64" r="1.5" fill="#38BDF8" />

        {/* --- Collar / Little Neck Accent --- */}
        <path
          d="M44 96 L76 96 L70 106 L50 106 Z"
          fill="#4F46E5"
          stroke="#818CF8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="101" r="2" fill="#38BDF8" />
      </svg>
    </div>
  );
};
