import React from "react";

// Helper for bubble letter style rendering for LIVRINHOS title
export const BubbleTitle: React.FC = () => {
  const letters = [
    { char: "L", from: "#5e4cb3", to: "#3c2a91" }, // Purple
    { char: "I", from: "#32b5e2", to: "#138faf" }, // Sky Blue
    { char: "V", from: "#ffb700", to: "#cc8a00" }, // Orange Yellow
    { char: "R", from: "#4bae4f", to: "#2e7c30" }, // Green
    { char: "I", from: "#ff5252", to: "#c62828" }, // Red
    { char: "N", from: "#ffa100", to: "#d87500" }, // Bright Orange
    { char: "H", from: "#f53d71", to: "#c2184d" }, // Pink
    { char: "O", from: "#29b6f6", to: "#0288d1" }, // Light Blue
    { char: "S", from: "#e91e63", to: "#ad1457" }, // Strawberry
  ];

  return (
    <div className="relative py-4 select-none z-10 flex justify-center items-center">
      {/* Global filter defs for the jelly bubble effect, rendered invisibly */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="jelly-bubble-puffy" x="-25%" y="-25%" width="150%" height="150%">
            {/* Smooth bevel map */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="blur" />
            
            {/* Puffy specular glare highlight */}
            <feSpecularLighting in="blur" surfaceScale="6.5" specularConstant="1.8" specularExponent="22" lightingColor="#ffffff" result="spec">
              <feDistantLight azimuth="-45" elevation="55" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="in" result="shine" />
            
            {/* Ambient occlusion / inner deep soft light */}
            <feDiffuseLighting in="blur" surfaceScale="3" diffuseConstant="1.2" lightingColor="#ffffff" result="diff">
              <feDistantLight azimuth="-45" elevation="45" />
            </feDiffuseLighting>
            <feComposite in="diff" in2="SourceGraphic" operator="in" result="inner-diff" />
            
            <feBlend in="inner-diff" in2="SourceGraphic" mode="multiply" result="shaded-graphic" />
            
            {/* Merge the pieces */}
            <feMerge>
              <feMergeNode in="shaded-graphic" />
              <feMergeNode in="shine" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Decorative sticker background backplate to hold all bubble letters together */}
      <div 
        className="flex justify-center items-center bg-white/95 rounded-[36px] sm:rounded-[56px] px-6 sm:px-10 py-2 sm:py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.12)] border-[5px] border-white/60 backdrop-blur-sm gap-1 sm:gap-2.5 transform hover:rotate-1 transition-transform duration-300 relative"
        style={{
          boxShadow: "0 10px 0 #1a237e, 0 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        {letters.map((l, i) => {
          const isThin = l.char === "I";
          const rx = isThin ? 4 : 7.5;
          const cx = isThin ? 46.5 : 38.5;

          return (
            <div 
              key={i} 
              className="relative hover:scale-115 active:scale-95 transition-all duration-200 cursor-pointer overflow-visible"
              style={{
                filter: "drop-shadow(2px 3px 0px rgba(0,0,0,0.06))"
              }}
            >
              <svg 
                className="w-12 h-14 sm:w-20 sm:h-24 md:w-28 md:h-32 overflow-visible"
                viewBox="0 0 100 110"
              >
                <defs>
                  <linearGradient id={`gel-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={l.from} />
                    <stop offset="100%" stopColor={l.to} />
                  </linearGradient>
                </defs>

                {/* Layer 1: Dark Indigo 3D Extrusion Backdrop Offset */}
                <text
                  x="50"
                  y="59"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-black text-[78px]"
                  style={{
                    fontFamily: '"Fredoka", "Outfit", sans-serif',
                  }}
                  fill="#1b247f"
                  stroke="#1b247f"
                  strokeWidth="15"
                  strokeLinejoin="round"
                >
                  {l.char}
                </text>

                {/* Layer 2: Massive White Border Sticker Outline */}
                <text
                  x="50"
                  y="52"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-black text-[78px]"
                  style={{
                    fontFamily: '"Fredoka", "Outfit", sans-serif',
                  }}
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth="15"
                  strokeLinejoin="round"
                >
                  {l.char}
                </text>

                {/* Layer 3: Colored Base Letter with Jelly Puffy Filter */}
                <text
                  x="50"
                  y="52"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-black text-[78px]"
                  style={{
                    fontFamily: '"Fredoka", "Outfit", sans-serif',
                  }}
                  fill={`url(#gel-grad-${i})`}
                  filter="url(#jelly-bubble-puffy)"
                >
                  {l.char}
                </text>

                {/* Layer 4: Exquisite Glare Shiny Vector Overlay (Top-Left spotlight glow) */}
                <ellipse 
                  cx={cx} 
                  cy="29" 
                  rx={rx} 
                  ry="4" 
                  transform={`rotate(-22 ${cx} 29)`} 
                  fill="#ffffff" 
                  opacity="0.82" 
                />

                {/* Decorative Tiny Secondary dot-specular reflex near bottom right */}
                {!isThin && (
                  <circle 
                    cx="65" 
                    cy="72" 
                    r="2" 
                    fill="#ffffff" 
                    opacity="0.3" 
                  />
                )}
              </svg>

              {/* Lovinha Love Heart Icon positioned floating on the last S sticker letter */}
              {i === letters.length - 1 && (
                <span 
                  className="absolute -top-3.5 -right-5 sm:-right-8 text-2xl sm:text-4.5xl text-[#f53d71] drop-shadow-md animate-bounce transform rotate-12"
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    textShadow: "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0px 3.5px 0px #ab0a3d",
                  }}
                >
                  💜
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Left Header Illustration: Jesus with Children reading the Bible
export const JesusHeaderLogo: React.FC = () => {
  return (
    <svg
      viewBox="0 0 240 180"
      className="w-full max-w-[190px] md:max-w-[210px] lg:max-w-[230px] h-auto drop-shadow-lg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky/Clouds Background Group */}
      <circle cx="120" cy="110" r="70" fill="url(#sky-grad)" />
      
      {/* Sun */}
      <circle cx="205" cy="55" r="10" fill="#ffca28" />
      <circle cx="40" cy="60" r="6" fill="#f48fb1" opacity="0.6" />
      
      {/* Grassy ground */}
      <path d="M40,140 Q120,110 200,140 L200,180 L40,180 Z" fill="#81c784" />
      <path d="M20,150 Q120,120 220,150 L220,180 L20,180 Z" fill="#4caf50" />

      {/* Hearts Floating */}
      <path d="M42,95 Q45,90 48,95 L45,100 Z" fill="#ef5350" />
      <path d="M205,90 Q208,85 211,90 L208,95 Z" fill="#ab47bc" />
      <path d="M110,65 Q112,61 114,65 L112,69 Z" fill="#ef5350" />

      {/* Jesus Figure */}
      {/* Hair back */}
      <rect x="100" y="70" width="40" height="40" rx="15" fill="#5d4037" />
      {/* Robe white */}
      <path d="M96,110 C96,110 90,165 92,165 L148,165 C150,165 144,110 144,110 Z" fill="#fafafa" />
      {/* Red Sash */}
      <path d="M103,110 L132,165 L144,165 L115,110 Z" fill="#e53935" />
      
      {/* Head / Face */}
      <circle cx="120" cy="85" r="18" fill="#ffccbc" />
      {/* Beard */}
      <path d="M102,85 C102,98 138,98 138,85 L132,98 L108,98 Z" fill="#5d4037" />
      {/* Hair front */}
      <path d="M102,76 C110,68 130,68 138,76 C134,74 106,74 102,76 Z" fill="#5d4037" />
      {/* Eyes */}
      <circle cx="114" cy="83" r="2" fill="#2d1d17" />
      <circle cx="126" cy="83" r="2" fill="#2d1d17" />
      {/* Smile */}
      <path d="M116,90 Q120,93 124,90" stroke="#2d1d17" strokeWidth="1.5" strokeLinecap="round" />

      {/* Hands holding Bible */}
      <circle cx="111" cy="118" r="4.5" fill="#ffccbc" />
      <circle cx="129" cy="118" r="4.5" fill="#ffccbc" />

      {/* Bible open */}
      <path d="M105,124 L120,121 L135,124 L138,114 L120,111 L102,114 Z" fill="#ffffff" stroke="#1565c0" strokeWidth="1.5" />
      <line x1="120" y1="111" x2="120" y2="121" stroke="#1565c0" strokeWidth="1.5" />
      {/* Small cross on bible cover back */}
      <path d="M120,113 L120,119 M117,115 L123,115" stroke="#ffca28" strokeWidth="1.2" />

      {/* Little Girl (Left) */}
      {/* Hair purple/brown */}
      <circle cx="75" cy="115" r="12" fill="#880e4f" />
      {/* Ponytails */}
      <circle cx="64" cy="112" r="5" fill="#880e4f" />
      <circle cx="86" cy="112" r="5" fill="#880e4f" />
      {/* Body pink */}
      <path d="M62,130 C62,130 55,165 75,165 Q85,165 85,130 Z" fill="#ec407a" />
      {/* Head */}
      <circle cx="75" cy="117" r="10" fill="#fff3e0" />
      {/* Eyes */}
      <circle cx="71" cy="116" r="1.5" fill="#2d1d17" />
      <circle cx="79" cy="116" r="1.5" fill="#2d1d17" />
      {/* Smile */}
      <path d="M72,121 Q75,124 78,121" stroke="#2d1d17" strokeWidth="1" strokeLinecap="round" />

      {/* Little Boy (Right) */}
      {/* Hair brown */}
      <path d="M152,110 C152,100 178,100 178,110 Z" fill="#795548" />
      {/* Body green */}
      <path d="M152,126 C152,126 150,165 170,165 Q180,165 178,126 Z" fill="#4caf50" />
      {/* Head */}
      <circle cx="165" cy="115" r="10" fill="#fff3e0" />
      {/* Eyes */}
      <circle cx="161" cy="114" r="1.5" fill="#2d1d17" />
      <circle cx="169" cy="114" r="1.5" fill="#2d1d17" />
      {/* Smile */}
      <path d="M162,119 Q165,122 168,119" stroke="#2d1d17" strokeWidth="1" strokeLinecap="round" />

      {/* Little flowers & details */}
      <circle cx="50" cy="155" r="3" fill="#ffca28" />
      <circle cx="185" cy="160" r="3.5" fill="#ec407a" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="sky-grad" x1="120" y1="40" x2="120" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="100%" stopColor="#e3f2fd" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Right Header Illustration: Boy drawing & coloring rainbow
export const BoyColoringHeader: React.FC = () => {
  return (
    <svg
      viewBox="0 0 240 180"
      className="w-full max-w-[190px] md:max-w-[210px] lg:max-w-[230px] h-auto drop-shadow-lg"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circles */}
      <circle cx="120" cy="110" r="70" fill="url(#boy-bg-grad)" />
      
      {/* Grassy ground */}
      <path d="M40,140 Q120,110 200,140 L200,180 L40,180 Z" fill="#81c784" />
      <path d="M20,150 Q120,120 220,150 L220,180 L20,180 Z" fill="#4caf50" />

      {/* Pencil Cup (Upper Right) */}
      <rect x="175" y="115" width="22" height="30" rx="3" fill="#7e57c2" />
      <rect x="178" y="100" width="4" height="25" rx="1" fill="#ef5350" transform="rotate(-15, 178, 100)" />
      <rect x="187" y="97" width="4" height="25" rx="1" fill="#4caf50" />
      <rect x="194" y="100" width="4" height="25" rx="1" fill="#ffb300" transform="rotate(15, 194, 100)" />

      {/* Idea Lightbulb (Top Right) */}
      <circle cx="205" cy="50" r="9" fill="#ffeb3b" />
      <path d="M201,57 L209,57 L207,61 L203,61 Z" fill="#b0bec5" />
      {/* Sparkles around lightbulb */}
      <line x1="205" y1="36" x2="205" y2="39" stroke="#ffb300" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="193" y1="45" x2="196" y2="47" stroke="#ffb300" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="217" y1="45" x2="214" y2="47" stroke="#ffb300" strokeWidth="1.5" strokeLinecap="round" />

      {/* Boy Character */}
      {/* Boy Body (blue shirt) */}
      <path d="M80,130 C80,130 75,175 140,175 C145,175 140,130 140,130 Z" fill="#2196f3" />
      {/* Boy Head */}
      <circle cx="110" cy="100" r="17" fill="#ffccbc" />
      {/* Hair (Black/Dark core) */}
      <path d="M92,96 C92,82 128,82 128,96 C118,91 102,91 92,96 Z" fill="#2d1d17" />
      <path d="M92,94 Q100,80 112,87 Q123,83 128,95 L129,101 C129,101 131,88 116,84 C101,80 92,94 92,94 Z" fill="#2d1d17" />
      
      {/* Face details */}
      <circle cx="103" cy="98" r="2.2" fill="#2d1d17" />
      <circle cx="117" cy="98" r="2.2" fill="#2d1d17" />
      {/* Rosy cheeks */}
      <circle cx="97" cy="104" r="2" fill="#ff8a80" opacity="0.8" />
      <circle cx="123" cy="104" r="2" fill="#ff8a80" opacity="0.8" />
      {/* Smile */}
      <path d="M106,105 Q110,111 114,105" stroke="#2d1d17" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Hands holding blue marker drawing */}
      <circle cx="134" cy="128" r="4.5" fill="#ffccbc" />
      {/* Marker */}
      <rect x="135" y="116" width="3.5" height="15" rx="1" fill="#1e88e5" transform="rotate(-30, 135, 116)" />

      {/* Open drawing book */}
      <path d="M75,130 Q110,123 145,130 L140,155 Q110,148 78,155 Z" fill="#fafafa" stroke="#37474f" strokeWidth="1.5" />
      <line x1="110" y1="126" x2="110" y2="152" stroke="#37474f" strokeWidth="1.5" />
      {/* Rainbow inside book */}
      <path d="M85,146 Q100,132 105,146" stroke="#ef5350" strokeWidth="1.8" fill="none" />
      <path d="M88,147 Q100,136 103,147" stroke="#ffb300" strokeWidth="1.8" fill="none" />
      <path d="M91,148 Q100,140 101,148" stroke="#4caf50" strokeWidth="1.8" fill="none" />

      {/* Stars sparkles */}
      <path d="M42,95 L44,91 L46,95 L49,97 L46,99 L44,103 L42,99 L39,97 Z" fill="#ffca28" />
      <path d="M155,75 T157,71 T159,75 T161,77 T159,79 T157,83 T155,79 T151,77 Z" fill="#29b6f6" />

      {/* Gradient */}
      <defs>
        <linearGradient id="boy-bg-grad" x1="120" y1="40" x2="120" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e3f2fd" />
          <stop offset="100%" stopColor="#f1f8e9" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// -------------------------------------------------------------
// Book covers
// -------------------------------------------------------------

// Book 1: A Criação scene
export const CriacaoCover: React.FC = () => {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sky background */}
      <rect width="160" height="210" rx="12" fill="#e0f7fa" />
      <path d="M0,0 L160,0 L160,210 L0,210 Z" fill="url(#criacao-sky-grad)" />
      
      {/* Sun */}
      <circle cx="130" cy="35" r="14" fill="#fbc02d" />
      <circle cx="130" cy="35" r="10.5" fill="#ffa000" />
      {/* Sun Face */}
      <circle cx="127" cy="32" r="1" fill="#3e2723" />
      <circle cx="133" cy="32" r="1" fill="#3e2723" />
      <path d="M128,37 Q130,39 132,37" stroke="#3e2723" strokeWidth="1" strokeLinecap="round" />
      {/* Rays */}
      <path d="M130,13 L130,18 M130,52 L130,57 M108,35 L113,35 M147,35 L152,35 M115,20 L119,24 M141,46 L145,50 M115,50 L119,46 M141,20 L145,24" stroke="#ffa000" strokeWidth="1.8" strokeLinecap="round" />

      {/* Clouds */}
      <path d="M12,45 C12,39 28,39 28,45 C34,45 34,51 28,51 L12,51 Z" fill="#ffffff" opacity="0.9" />
      <path d="M85,30 C85,25 97,25 97,30 C103,30 103,35 97,35 L85,35 Z" fill="#ffffff" opacity="0.75" />

      {/* Grassy ground */}
      <path d="M0,150 Q80,135 160,150 L160,210 L0,210 Z" fill="#81c784" />
      <path d="M0,165 Q80,150 160,165 L160,210 L0,210 Z" fill="#4caf50" />

      {/* Earth Globe in center */}
      <circle cx="80" cy="100" r="32" fill="#3b9cfc" stroke="#1565c0" strokeWidth="2.5" />
      {/* Continents green */}
      <path d="M64,88 Q72,82 78,88 T86,84 T76,108 Z" fill="#5bc23a" />
      <path d="M86,96 Q100,94 104,102 T100,116 T80,122 Z" fill="#5bc23a" />
      <path d="M62,106 Q66,112 70,114 T66,122 Z" fill="#5bc23a" />
      {/* Eyes & Smile on Globe */}
      <circle cx="73" cy="98" r="2.5" fill="#ffffff" />
      <circle cx="73" cy="98" r="1.2" fill="#2d1d17" />
      <circle cx="87" cy="98" r="2.5" fill="#ffffff" />
      <circle cx="87" cy="98" r="1.2" fill="#2d1d17" />
      {/* blush */}
      <circle cx="68" cy="103" r="2" fill="#ef5350" opacity="0.5" />
      <circle cx="92" cy="103" r="2" fill="#ef5350" opacity="0.5" />
      <path d="M75,104 Q80,109 85,104" stroke="#2d1d17" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Giraffe (left) */}
      <rect x="22" y="90" width="8" height="65" rx="3" fill="#ffb74d" stroke="#e65100" strokeWidth="1" /> {/* Neck */}
      <rect x="14" y="130" width="22" height="25" rx="5" fill="#ffb74d" stroke="#e65100" strokeWidth="1" /> {/* Body */}
      <rect x="18" y="86" width="12" height="8" rx="3" fill="#ffb74d" stroke="#e65100" strokeWidth="1" /> {/* Head */}
      {/* Legs */}
      <rect x="18" y="152" width="3" height="15" fill="#ffa726" />
      <rect x="21" y="152" width="3" height="15" fill="#ffa726" />
      <rect x="28" y="152" width="3" height="15" fill="#ffa726" />
      <rect x="31" y="152" width="3" height="15" fill="#ffa726" />
      {/* Ears */}
      <path d="M22,86 L20,81 L23,86 Z M28,86 L30,81 L27,86 Z" fill="#fb8c00" />
      {/* Spots */}
      <circle cx="25" cy="105" r="1.5" fill="#e65100" />
      <circle cx="27" cy="115" r="1.5" fill="#e65100" />
      <circle cx="25" cy="125" r="1.5" fill="#e65100" />
      <circle cx="20" cy="136" r="2" fill="#e65100" />
      <circle cx="29" cy="138" r="2" fill="#e65100" />
      {/* Eye */}
      <circle cx="21" cy="89" r="0.8" fill="#2d1d17" />
      
      {/* Elephant (right) */}
      <circle cx="132" cy="138" r="18" fill="#b0bec5" stroke="#37474f" strokeWidth="1" /> {/* Body */}
      <circle cx="121" cy="132" r="12" fill="#b0bec5" stroke="#37474f" strokeWidth="1" /> {/* Head */}
      {/* Legs */}
      <rect x="122" y="152" width="5" height="15" fill="#78909c" />
      <rect x="134" y="152" width="5" height="15" fill="#78909c" />
      {/* Ear */}
      <ellipse cx="116" cy="130" rx="4" ry="7" fill="#cfd8dc" stroke="#37474f" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="123" cy="129" r="1" fill="#3e2723" />
      {/* Trunk */}
      <path d="M125,136 Q132,143 135,138" stroke="#b0bec5" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Lion face bottom left */}
      <circle cx="56" cy="170" r="13" fill="#ffb74d" stroke="#e65100" strokeWidth="1" /> {/* Mane */}
      <circle cx="56" cy="170" r="9.5" fill="#ffe082" /> {/* Face */}
      <circle cx="53" cy="167" r="1" fill="#3e2723" />
      <circle cx="59" cy="167" r="1" fill="#3e2723" />
      <path d="M54,171 Q56,173 58,171" stroke="#3e2723" strokeWidth="1" strokeLinecap="round" />

      {/* Flower */}
      <circle cx="95" cy="178" r="3" fill="#ec407a" />
      <circle cx="95" cy="178" r="1" fill="#ffca28" />
      <path d="M95,178 L95,185" stroke="#4caf50" strokeWidth="1" />

      {/* Flying bird */}
      <path d="M45,55 Q50,45 55,55 Q60,45 65,55" stroke="#0288d1" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M105,48 Q110,38 115,48 Q120,38 125,48" stroke="#0288d1" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      <defs>
        <linearGradient id="criacao-sky-grad" x1="80" y1="0" x2="80" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="40%" stopColor="#e0f7fa" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Book 2: A Arca de Noé scene
export const ArcaNoeCover: React.FC = () => {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base gradient Sky */}
      <rect width="160" height="210" rx="12" fill="#e1f5fe" />
      <rect width="160" height="210" rx="12" fill="url(#noesky-grad)" />

      {/* Rainbow overlay */}
      <path d="M10,140 C10,40 150,40 150,140" stroke="#ff4081" strokeWidth="5" fill="none" opacity="0.95" />
      <path d="M13,140 C13,46 147,46 147,140" stroke="#ffa726" strokeWidth="4.5" fill="none" opacity="0.95" />
      <path d="M16,140 C16,52 144,52 144,140" stroke="#ffeb3b" strokeWidth="4.5" fill="none" opacity="0.95" />
      <path d="M19,140 C19,58 141,58 141,140" stroke="#66bb6a" strokeWidth="4.5" fill="none" opacity="0.95" />
      <path d="M22,140 C22,64 138,64 138,140" stroke="#29b6f6" strokeWidth="4.5" fill="none" opacity="0.95" />

      {/* Rainbow cloud buffers */}
      <circle cx="15" cy="135" r="11" fill="#ffffff" />
      <circle cx="145" cy="135" r="11" fill="#ffffff" />
      <circle cx="24" cy="138" r="8" fill="#ffffff" />
      <circle cx="136" cy="138" r="8" fill="#ffffff" />

      {/* Noah's Ark Floating */}
      {/* Ship Body */}
      <path d="M25,115 L135,115 L120,150 L40,150 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="2.5" />
      <line x1="33" y1="126" x2="127" y2="126" stroke="#5d4037" strokeWidth="1.8" />
      <circle cx="48" cy="138" r="3.5" fill="#4e342e" />
      <circle cx="112" cy="138" r="3.5" fill="#4e342e" />

      {/* Deckhouse */}
      <rect x="45" y="90" width="70" height="25" rx="3" fill="#efebe9" stroke="#5d4037" strokeWidth="2" />
      {/* Window */}
      <rect x="68" y="96" width="24" height="12" rx="2" fill="#5d4037" />

      {/* Roof */}
      <path d="M40,90 L120,90 L108,74 L52,74 Z" fill="#5d4037" stroke="#3e2723" strokeWidth="2" />

      {/* Animals looking out */}
      {/* Giraffe */}
      <rect x="52" y="70" width="4" height="20" fill="#ffa726" />
      <circle cx="54" cy="68" r="3" fill="#ffa726" />
      <path d="M55,68 L56,64 M53,68 L52,64" stroke="#ffa726" strokeWidth="1" />
      {/* Lion face inside deck window */}
      <circle cx="74" cy="102" r="4.5" fill="#ffb74d" />
      <circle cx="74" cy="102" r="3.2" fill="#ffe082" />
      {/* Elephant snout on other side */}
      <circle cx="86" cy="102" r="4.5" fill="#cfd8dc" />
      <path d="M86,102 Q91,107 92,105" stroke="#cfd8dc" strokeWidth="1.5" fill="none" />

      {/* Sea waves */}
      <path d="M-10,145 Q15,135 40,145 Q65,135 90,145 Q115,135 140,145 Q165,135 190,145 L190,210 L-10,210 Z" fill="#29b6f6" stroke="#0288d1" strokeWidth="1" />
      <path d="M-10,154 Q20,147 50,154 Q80,147 110,154 Q140,147 170,154 L170,210 L-10,210 Z" fill="#0288d1" />
      <path d="M-10,165 Q15,158 40,165 Q65,158 90,165 Q115,158 140,165 Q165,158 190,165 L190,210 L-10,210 Z" fill="#01579b" />

      {/* Cute birds */}
      <path d="M25,40 Q30,32 35,40 Q40,32 45,40" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M125,35 Q130,27 135,35 Q140,27 145,35" stroke="#fafafa" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      <defs>
        <linearGradient id="noesky-grad" x1="80" y1="0" x2="80" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#e1f5fe" />
          <stop offset="100%" stopColor="#e3f2fd" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Book 3: Davi e Golias scene
export const DaviGoliasCover: React.FC = () => {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="210" rx="12" fill="#f1f8e9" />
      <path d="M0,0 L160,0 L160,210 L0,210 Z" fill="url(#davi-hills-grad)" />
      
      {/* Clouds & Sun */}
      <circle cx="140" cy="30" r="10" fill="#fbc02d" opacity="0.8" />
      <path d="M20,35 C20,30 32,30 32,35 C38,35 38,40 32,40 L20,40 Z" fill="#ffffff" opacity="0.9" />
      <path d="M100,25 C100,21 110,21 110,25 C115,25 115,29 110,29 L100,29 Z" fill="#ffffff" opacity="0.8" />

      {/* Rolling Hills */}
      <path d="M-10,140 Q50,110 110,140 T230,140 L230,210 L-10,210 Z" fill="#c8e6c9" />
      <path d="M-10,155 Q80,135 170,155 L170,210 L-10,210 Z" fill="#a5d6a7" />
      <path d="M-10,172 Q40,155 110,172 T230,172 L230,210 L-10,210 Z" fill="#81c784" />

      {/* Goliath (Right Side) */}
      {/* Body */}
      <path d="M98,120 L142,120 L136,180 L104,180 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1.5" />
      {/* Legs */}
      <rect x="108" y="178" width="8" height="15" fill="#5d4037" />
      <rect x="126" y="178" width="8" height="15" fill="#5d4037" />
      {/* Golden breastplate */}
      <path d="M100,123 L140,123 L134,153 L106,153 Z" fill="#ffa000" stroke="#ff8f00" strokeWidth="1.5" />
      <line x1="120" y1="123" x2="120" y2="153" stroke="#ff8f00" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="120" cy="100" r="14" fill="#ffccbc" stroke="#5d4037" strokeWidth="1.5" />
      {/* Helmet with red plume */}
      <path d="M105,92 Q120,80 135,92 L131,100 L109,100 Z" fill="#ffd54f" stroke="#ffa000" strokeWidth="1.5" />
      <path d="M120,80 C120,68 132,68 132,80" stroke="#f44336" strokeWidth="5.5" strokeLinecap="round" />
      {/* Shield */}
      <circle cx="142" cy="148" r="15" fill="#b0bec5" stroke="#78909c" strokeWidth="2.5" />
      <circle cx="142" cy="148" r="10" fill="#90a4ae" />
      {/* Friendly Beard */}
      <path d="M109,103 C109,114 131,114 131,103" fill="#5d4037" />
      <ellipse cx="114" cy="101" rx="1" ry="1.5" fill="#2d1d17" />
      <ellipse cx="126" cy="101" rx="1" ry="1.5" fill="#2d1d17" />
      {/* Smile */}
      <path d="M117,105 Q120,107 123,105" stroke="#fff" strokeWidth="1" strokeLinecap="round" />

      {/* David (Left Side) - cute smiling boy with sling */}
      {/* Body Blue */}
      <path d="M22,135 L52,135 L48,180 L26,180 Z" fill="#29b6f6" stroke="#0288d1" strokeWidth="1.5" />
      <rect x="28" y="178" width="5" height="15" fill="#e0a96d" />
      <rect x="41" y="178" width="5" height="15" fill="#e0a96d" />
      {/* Head */}
      <circle cx="37" cy="118" r="12" fill="#ffccbc" stroke="#5d4037" strokeWidth="1.5" />
      {/* Hair brown */}
      <path d="M25,116 C25,103 49,103 49,116 Z" fill="#5d4037" />
      {/* Cute eyes & smile */}
      <circle cx="33" cy="118" r="1.5" fill="#2d1d17" />
      <circle cx="41" cy="118" r="1.5" fill="#2d1d17" />
      <path d="M34,124 Q37,127 40,124" stroke="#2d1d17" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="31" cy="120" r="1.5" fill="#ec407a" opacity="0.5" />
      <circle cx="43" cy="120" r="1.5" fill="#ec407a" opacity="0.5" />
      {/* Sling */}
      <path d="M48,135 Q58,130 55,152" stroke="#795548" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="55" cy="152" r="4.5" fill="#90a4ae" stroke="#37474f" strokeWidth="1.5" /> {/* Rock */}

      <defs>
        <linearGradient id="davi-hills-grad" x1="80" y1="0" x2="80" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8f5e9" />
          <stop offset="50%" stopColor="#f1f8e9" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Book 4: Jonas e o Peixe (Line Art coloring style)
export const JonasPeixeCover: React.FC = () => {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Coloring book background is plain white */}
      <rect width="156" height="206" rx="12" x="2" y="2" fill="#ffffff" stroke="#2c3e50" strokeWidth="3" />

      {/* Clouds in outline */}
      <path d="M15,40 C15,31 32,31 32,40 C38,40 38,47 32,47 L15,47 Z" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M100,30 C100,23 115,23 115,30 C120,30 120,36 115,36 L100,36 Z" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Spout blow water */}
      <path d="M80,80 Q80,55 70,62 M80,80 Q86,46 98,55" stroke="#2c3e50" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Large Whale (Coloring style) */}
      {/* Whale body path */}
      <path
        d="M15,120 C15,75 105,65 145,100 C155,108 152,90 148,84 C142,78 135,80 132,84 C112,65 52,80 20,126 Z"
        stroke="#2c3e50"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#ffffff"
      />
      {/* Whale underbelly lining */}
      <path d="M28,122 C42,131 82,133 125,110" stroke="#2c3e50" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Tail fin */}
      <path d="M142,100 C153,100 151,120 138,110 Z" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      {/* Eye and smile on Whale */}
      <circle cx="40" cy="100" r="2.5" fill="#2c3e50" />
      <path d="M35,108 Q41,113 46,108" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Jonas outline floating on waves */}
      <circle cx="80" cy="148" r="9" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      {/* Face details */}
      <circle cx="76" cy="146" r="1" fill="#2c3e50" />
      <circle cx="84" cy="146" r="1" fill="#2c3e50" />
      <path d="M77,151 Q80,154 83,151" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Hair */}
      <path d="M72,146 C72,137 88,137 88,146 Z" stroke="#2c3e50" strokeWidth="2" fill="#ffffff" />
      {/* Hands up waving */}
      <path d="M68,152 Q62,144 68,152 M92,152 Q98,144 92,152" stroke="#2c3e50" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* Swim body outline */}
      <path d="M73,157 C73,157 65,185 85,185 C85,185 87,157 87,157" stroke="#2c3e50" strokeWidth="2.2" fill="none" />

      {/* Sea Wave outlines */}
      <path d="M5,165 Q40,152 75,165 T155,165" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
      <path d="M10,180 Q45,170 80,180 T150,180" stroke="#2c3e50" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M5,195 Q40,185 75,195 T155,195" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round" />

      {/* Bubbles */}
      <circle cx="114" cy="135" r="4.5" stroke="#2c3e50" strokeWidth="2" />
      <circle cx="122" cy="126" r="2.2" stroke="#2c3e50" strokeWidth="1.5" />
      <circle cx="110" cy="116" r="1.5" stroke="#2c3e50" strokeWidth="1" />
    </svg>
  );
};

// Book 5: Jesus e as Crianças (Line Art coloring style)
export const JesusCriancasCover: React.FC = () => {
  return (
    <svg viewBox="0 0 160 210" className="w-full h-full object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="156" height="206" rx="12" x="2" y="2" fill="#ffffff" stroke="#2c3e50" strokeWidth="3" />

      {/* Floating Sparkles & Hearts */}
      <path d="M22,35 Q25,29 28,35 L25,41 Z" stroke="#2c3e50" strokeWidth="2" fill="none" />
      <path d="M135,40 Q138,34 141,40 L138,46 Z" stroke="#2c3e50" strokeWidth="2" fill="none" />
      <path d="M35,68 Q39,64 43,68 C43,68 45,74 39,78 C33,74 35,68 35,68" stroke="#2c3e50" strokeWidth="2" fill="none" />
      <path d="M120,60 Q124,56 128,60 C128,60 130,66 124,70 C118,66 120,60 120,60" stroke="#2c3e50" strokeWidth="1.8" fill="none" />

      {/* Jesus in Center */}
      {/* Hair (outline shape) */}
      <rect x="62" y="74" width="36" height="36" rx="10" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      {/* Face */}
      <circle cx="80" cy="85" r="13" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      {/* Eyes & smile */}
      <circle cx="75" cy="84" r="1.2" fill="#2c3e50" />
      <circle cx="85" cy="84" r="1.2" fill="#2c3e50" />
      <path d="M76,91 Q80,94 84,91" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round" />
      {/* Beard Outline */}
      <path d="M67,85 C67,98 93,98 93,85" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      {/* Robe Outline */}
      <path d="M60,110 C60,110 52,165 100,165 C100,165 100,110 100,110" stroke="#2c3e50" strokeWidth="2.2" fill="none" />
      {/* Cross on Chest */}
      <path d="M80,120 L80,135 M73,125 L87,125" stroke="#2c3e50" strokeWidth="1.8" strokeLinecap="round" />

      {/* Child 1 (Left side) */}
      <circle cx="45" cy="115" r="9" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      <path d="M38,123 C38,123 34,165 52,165 Q56,165 52,123" stroke="#2c3e50" strokeWidth="2.2" fill="none" />
      {/* Eye & Smile */}
      <circle cx="41" cy="114" r="1" fill="#2c3e50" />
      <circle cx="47" cy="114" r="1" fill="#2c3e50" />
      <path d="M41,118 Q44,121 47,118" stroke="#2c3e50" strokeWidth="1.2" strokeLinecap="round" />

      {/* Child 2 (Right side) */}
      <circle cx="115" cy="115" r="9" stroke="#2c3e50" strokeWidth="2.2" fill="#ffffff" />
      <path d="M108,123 C108,123 104,165 122,165 Q126,165 122,123" stroke="#2c3e50" strokeWidth="2.2" fill="none" />
      {/* Eye & Smile */}
      <circle cx="111" cy="114" r="1" fill="#2c3e50" />
      <circle cx="117" cy="114" r="1" fill="#2c3e50" />
      <path d="M111,118 Q114,121 117,118" stroke="#2c3e50" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Ground outline */}
      <line x1="10" y1="165" x2="150" y2="165" stroke="#2c3e50" strokeWidth="3" strokeLinecap="round" />
      <path d="M25,178 Q80,172 135,178" stroke="#2c3e50" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
