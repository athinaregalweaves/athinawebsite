const SareeBorderGeometric = () => {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '56px' }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 56"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="indigoSilk" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1A0A3E" />
            <stop offset="20%" stopColor="#2D1B69" />
            <stop offset="40%" stopColor="#4527A0" />
            <stop offset="50%" stopColor="#5C33B4" />
            <stop offset="60%" stopColor="#4527A0" />
            <stop offset="80%" stopColor="#2D1B69" />
            <stop offset="100%" stopColor="#1A0A3E" />
          </linearGradient>
          <linearGradient id="silverZari" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B8794" />
            <stop offset="20%" stopColor="#B0BEC5" />
            <stop offset="40%" stopColor="#CFD8DC" />
            <stop offset="50%" stopColor="#ECEFF1" />
            <stop offset="60%" stopColor="#CFD8DC" />
            <stop offset="80%" stopColor="#B0BEC5" />
            <stop offset="100%" stopColor="#7B8794" />
          </linearGradient>
          <linearGradient id="templeBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0D0624" />
            <stop offset="50%" stopColor="#170D38" />
            <stop offset="100%" stopColor="#0D0624" />
          </linearGradient>
        </defs>

        <rect width="1200" height="56" fill="url(#templeBg)" />

        {/* Top silver zari band */}
        <rect x="0" y="0" width="1200" height="2" fill="url(#silverZari)" opacity="0.85" />
        <rect x="0" y="2.5" width="1200" height="0.8" fill="#ECEFF1" opacity="0.15" />

        {/* Top stepped temple tower row */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = i * 30;
          return (
            <g key={`temple-top-${i}`}>
              {/* Stepped pyramid - gopuram silhouette */}
              <polygon
                points={`${x + 15},6 ${x + 18},6 ${x + 18},9 ${x + 20},9 ${x + 20},12 ${x + 22},12 ${x + 22},16 ${x + 8},16 ${x + 8},12 ${x + 10},12 ${x + 10},9 ${x + 12},9 ${x + 12},6`}
                fill="#4527A0" fillOpacity="0.2"
                stroke="#B0BEC5" strokeWidth="0.4" opacity="0.6"
              />
              {/* Finial on top */}
              <line x1={x + 15} y1={4} x2={x + 15} y2={6} stroke="#CFD8DC" strokeWidth="0.4" opacity="0.5" />
              <circle cx={x + 15} cy={4} r="0.8" fill="#ECEFF1" fillOpacity="0.5" />
              {/* Window dots */}
              <circle cx={x + 15} cy={8} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
              <circle cx={x + 13} cy={11} r="0.4" fill="#CFD8DC" fillOpacity="0.3" />
              <circle cx={x + 17} cy={11} r="0.4" fill="#CFD8DC" fillOpacity="0.3" />
              <circle cx={x + 15} cy={14} r="0.6" fill="#ECEFF1" fillOpacity="0.35" />
            </g>
          );
        })}

        {/* Central band - intricate diamond lattice chain */}
        <rect x="0" y="17" width="1200" height="0.4" fill="#B0BEC5" opacity="0.3" />
        <rect x="0" y="38.5" width="1200" height="0.4" fill="#B0BEC5" opacity="0.3" />

        {Array.from({ length: 48 }).map((_, i) => {
          const cx = i * 25 + 12.5;
          const cy = 28;
          return (
            <g key={`lattice-${i}`}>
              {/* Outer diamond frame */}
              <rect x={cx - 9} y={cy - 9} width="18" height="18"
                fill="none" stroke="#B0BEC5" strokeWidth="0.5" opacity="0.4"
                transform={`rotate(45,${cx},${cy})`} />
              {/* Inner diamond */}
              <rect x={cx - 6} y={cy - 6} width="12" height="12"
                fill="#4527A0" fillOpacity="0.1" stroke="#CFD8DC" strokeWidth="0.3" opacity="0.5"
                transform={`rotate(45,${cx},${cy})`} />
              {/* Cross inside */}
              <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="#B0BEC5" strokeWidth="0.25" opacity="0.3" />
              <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke="#B0BEC5" strokeWidth="0.25" opacity="0.3" />
              {/* 4 corner squares */}
              {[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([dx, dy], j) => (
                <rect key={j} x={cx + dx - 1} y={cy + dy - 1} width="2" height="2"
                  fill="#5C33B4" fillOpacity="0.15" stroke="#CFD8DC" strokeWidth="0.2" opacity="0.4" />
              ))}
              {/* Center jewel cluster */}
              <circle cx={cx} cy={cy} r="2.5" fill="#4527A0" fillOpacity="0.25" stroke="#ECEFF1" strokeWidth="0.3" opacity="0.5" />
              <circle cx={cx} cy={cy} r="1.2" fill="#5C33B4" fillOpacity="0.4" />
              <circle cx={cx} cy={cy} r="0.5" fill="#ECEFF1" fillOpacity="0.8" />
              {/* Cardinal point dots */}
              <circle cx={cx} cy={cy - 9} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
              <circle cx={cx} cy={cy + 9} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
              <circle cx={cx - 9} cy={cy} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
              <circle cx={cx + 9} cy={cy} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
            </g>
          );
        })}

        {/* Bottom stepped temple tower row (inverted) */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = i * 30;
          return (
            <g key={`temple-bot-${i}`}>
              <polygon
                points={`${x + 15},50 ${x + 18},50 ${x + 18},47 ${x + 20},47 ${x + 20},44 ${x + 22},44 ${x + 22},40 ${x + 8},40 ${x + 8},44 ${x + 10},44 ${x + 10},47 ${x + 12},47 ${x + 12},50`}
                fill="#4527A0" fillOpacity="0.2"
                stroke="#B0BEC5" strokeWidth="0.4" opacity="0.6"
              />
              <line x1={x + 15} y1={50} x2={x + 15} y2={52} stroke="#CFD8DC" strokeWidth="0.4" opacity="0.5" />
              <circle cx={x + 15} cy={52} r="0.8" fill="#ECEFF1" fillOpacity="0.5" />
              <circle cx={x + 15} cy={48} r="0.5" fill="#ECEFF1" fillOpacity="0.4" />
              <circle cx={x + 15} cy={42} r="0.6" fill="#ECEFF1" fillOpacity="0.35" />
            </g>
          );
        })}

        {/* Bottom silver zari band */}
        <rect x="0" y="53" width="1200" height="0.8" fill="#ECEFF1" opacity="0.15" />
        <rect x="0" y="54" width="1200" height="2" fill="url(#silverZari)" opacity="0.85" />
      </svg>
    </div>
  );
};

export default SareeBorderGeometric;
