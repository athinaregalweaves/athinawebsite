const SareeBorderFloral = () => {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '60px' }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="maroonSilk" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A0E1C" />
            <stop offset="15%" stopColor="#7B1636" />
            <stop offset="30%" stopColor="#A31D4A" />
            <stop offset="50%" stopColor="#C72260" />
            <stop offset="70%" stopColor="#A31D4A" />
            <stop offset="85%" stopColor="#7B1636" />
            <stop offset="100%" stopColor="#4A0E1C" />
          </linearGradient>
          <linearGradient id="copperZari" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B4513" />
            <stop offset="25%" stopColor="#CD7F32" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="75%" stopColor="#CD7F32" />
            <stop offset="100%" stopColor="#8B4513" />
          </linearGradient>
          <linearGradient id="palluBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A0A14" />
            <stop offset="50%" stopColor="#3D0E1E" />
            <stop offset="100%" stopColor="#2A0A14" />
          </linearGradient>
        </defs>

        <rect width="1200" height="60" fill="url(#palluBg)" />

        {/* Top zari border - thick woven edge */}
        <rect x="0" y="0" width="1200" height="2.5" fill="url(#copperZari)" opacity="0.9" />
        <rect x="0" y="3" width="1200" height="1" fill="#DAA520" opacity="0.25" />
        {/* Top running zigzag thread */}
        <polyline
          points={Array.from({ length: 120 }, (_, i) => `${i * 10},${i % 2 === 0 ? 5.5 : 8.5}`).join(' ')}
          fill="none" stroke="#CD7F32" strokeWidth="0.5" opacity="0.35"
        />

        {/* MAIN MOTIF: Large Mango/Paisley with internal detail */}
        {Array.from({ length: 15 }).map((_, i) => {
          const cx = i * 80 + 40;
          const flip = i % 2 === 0 ? 1 : -1;
          return (
            <g key={`paisley-${i}`} transform={`translate(${cx},30)`}>
              {/* Outer paisley body */}
              <path
                d={`M0,-16 C${12 * flip},-14 ${16 * flip},-4 ${14 * flip},4 C${12 * flip},12 ${4 * flip},18 0,20 C${-4 * flip},18 ${-8 * flip},14 ${-10 * flip},8 C${-12 * flip},2 ${-10 * flip},-8 ${-6 * flip},-14 Z`}
                fill="#7B1636" fillOpacity="0.3"
                stroke="#CD7F32" strokeWidth="0.8" opacity="0.7"
              />
              {/* Inner paisley */}
              <path
                d={`M0,-11 C${8 * flip},-9 ${11 * flip},-2 ${9 * flip},4 C${7 * flip},9 ${3 * flip},13 0,14 C${-3 * flip},13 ${-5 * flip},10 ${-6 * flip},6 C${-8 * flip},1 ${-6 * flip},-6 ${-3 * flip},-10 Z`}
                fill="#A31D4A" fillOpacity="0.15"
                stroke="#DAA520" strokeWidth="0.4" opacity="0.6"
              />
              {/* Paisley curl tip */}
              <path
                d={`M0,-16 C${5 * flip},-20 ${10 * flip},-18 ${8 * flip},-13`}
                fill="none" stroke="#CD7F32" strokeWidth="0.6" opacity="0.6"
              />
              {/* Internal flower cluster */}
              {[0, 60, 120, 180, 240, 300].map((angle, j) => {
                const rad = (angle * Math.PI) / 180;
                const px = Math.cos(rad) * 4;
                const py = Math.sin(rad) * 4 + 2;
                return (
                  <ellipse key={`fl-${j}`} cx={px} cy={py} rx="2.2" ry="1.2"
                    fill="#C72260" fillOpacity="0.2" stroke="#DAA520" strokeWidth="0.25"
                    transform={`rotate(${angle},${px},${py})`} />
                );
              })}
              <circle cx={0} cy={2} r="1.8" fill="#CD7F32" fillOpacity="0.4" />
              <circle cx={0} cy={2} r="0.9" fill="#DAA520" fillOpacity="0.7" />
              {/* Leaf sprays from paisley */}
              <path d={`M${-10 * flip},6 Q${-16 * flip},2 ${-18 * flip},6`} fill="none" stroke="#CD7F32" strokeWidth="0.4" opacity="0.4" />
              <ellipse cx={-18 * flip} cy={5} rx="2.5" ry="1" fill="#7B1636" fillOpacity="0.25" stroke="#CD7F32" strokeWidth="0.2" transform={`rotate(${flip * -25},${-18 * flip},5)`} />
              <path d={`M${-10 * flip},8 Q${-14 * flip},12 ${-16 * flip},10`} fill="none" stroke="#CD7F32" strokeWidth="0.3" opacity="0.35" />
              <ellipse cx={-16 * flip} cy={10} rx="2" ry="0.8" fill="#7B1636" fillOpacity="0.2" stroke="#CD7F32" strokeWidth="0.2" transform={`rotate(${flip * 15},${-16 * flip},10)`} />
            </g>
          );
        })}

        {/* Small filler flowers between paisleys */}
        {Array.from({ length: 14 }).map((_, i) => {
          const cx = i * 80 + 80;
          return (
            <g key={`fill-${i}`}>
              {[0, 72, 144, 216, 288].map((a, j) => {
                const rad = (a * Math.PI) / 180;
                return <ellipse key={j} cx={cx + Math.cos(rad) * 2.5} cy={30 + Math.sin(rad) * 2.5}
                  rx="1.5" ry="0.8" fill="#C72260" fillOpacity="0.15" stroke="#DAA520" strokeWidth="0.2"
                  transform={`rotate(${a},${cx + Math.cos(rad) * 2.5},${30 + Math.sin(rad) * 2.5})`} />;
              })}
              <circle cx={cx} cy={30} r="1" fill="#DAA520" fillOpacity="0.5" />
            </g>
          );
        })}

        {/* Bottom zigzag thread */}
        <polyline
          points={Array.from({ length: 120 }, (_, i) => `${i * 10},${i % 2 === 0 ? 51 : 54}`).join(' ')}
          fill="none" stroke="#CD7F32" strokeWidth="0.5" opacity="0.35"
        />
        {/* Bottom zari border */}
        <rect x="0" y="56" width="1200" height="1" fill="#DAA520" opacity="0.25" />
        <rect x="0" y="57.5" width="1200" height="2.5" fill="url(#copperZari)" opacity="0.9" />

        {/* Scattered zari dots along edges */}
        {Array.from({ length: 100 }).map((_, i) => (
          <g key={`dots-${i}`}>
            <circle cx={i * 12 + 6} cy={10} r="0.4" fill="#DAA520" fillOpacity="0.3" />
            <circle cx={i * 12 + 6} cy={50} r="0.4" fill="#DAA520" fillOpacity="0.3" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default SareeBorderFloral;
