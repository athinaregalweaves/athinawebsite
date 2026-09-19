const SareeBorder = () => {
  return (
    <div className="relative w-full overflow-hidden bg-white border-y border-[#e7ddc8]" style={{ height: "22px" }}>
      <style>
        {`
          @keyframes athina-marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      {/* Single border strip with scrolling brand line */}
      <div className="absolute inset-0 overflow-hidden bg-white">
        <div
          className="flex w-max text-[10px] tracking-[0.38em] font-bold leading-[22px]"
          style={{
            animation: "athina-marquee 55s linear infinite",
            color: "#7a2437",
            textShadow: "0 0 0.15px #7a2437",
          }}
        >
          {[0, 1].map((setIdx) => (
            <div key={setIdx} className="flex shrink-0">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={`${setIdx}-${i}`} className="mr-8">ATHINA</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SareeBorder;
