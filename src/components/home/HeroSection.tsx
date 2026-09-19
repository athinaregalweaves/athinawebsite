import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { resolveHeroVideoUrl } from "@/lib/videoEmbed";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface HeroSectionProps {
  caption: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
  /** Optional: direct MP4/WebM URL or YouTube/Vimeo link */
  videoUrl?: string;
  redirect: string;
  buttonText: string;
}

const HeroSection = ({ caption, title, subtitle, description, image, imagePosition, imageZoom = 100, videoUrl, redirect, buttonText }: HeroSectionProps) => {
  const rawVideo = videoUrl?.trim() ?? "";
  const video = rawVideo ? resolveHeroVideoUrl(rawVideo) : null;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoErrored, setVideoErrored] = useState(false);
  /** File video: hide poster overlay once playback has started (Safari handles opacity on video poorly). */
  const [fileVideoPlaying, setFileVideoPlaying] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    setVideoErrored(false);
    setFileVideoPlaying(false);
    setEmbedReady(false);
  }, [video?.src]);

  /** iOS Safari: inline + muted must be set in JS before play(); IO is avoided (iOS often mis-reports hero intersection and pauses forever). */
  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el || video?.kind !== "file") return;
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "true");
    el.setAttribute("x5-playsinline", "true");
    el.playsInline = true;
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");
  }, [video?.kind, video?.src]);

  useEffect(() => {
    if (video?.kind !== "file") return;
    const el = videoRef.current;
    if (!el) return;

    const tryPlay = () => {
      el.muted = true;
      if (el.paused) {
        void el.play().catch(() => {
          /* Low Power Mode / strict autoplay: poster stays until user gesture */
        });
      }
    };

    tryPlay();
    el.addEventListener("canplay", tryPlay);
    el.addEventListener("canplaythrough", tryPlay);
    el.addEventListener("loadeddata", tryPlay);
    el.addEventListener("ended", tryPlay);

    const onVis = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      el.removeEventListener("canplay", tryPlay);
      el.removeEventListener("canplaythrough", tryPlay);
      el.removeEventListener("loadeddata", tryPlay);
      el.removeEventListener("ended", tryPlay);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [video?.kind, video?.src]);

  /** If iOS never fires playing/loadedData, still lift poster so video layer can show (avoids “stuck on image”). */
  useEffect(() => {
    if (video?.kind !== "file" || videoErrored) return;
    const t = window.setTimeout(() => {
      setFileVideoPlaying((was) => (was ? was : true));
    }, 2800);
    return () => window.clearTimeout(t);
  }, [video?.kind, video?.src, videoErrored]);

  /** YouTube/Vimeo: onLoad is flaky cross-origin; fade iframe in anyway after a short delay. */
  useEffect(() => {
    if (video?.kind !== "youtube" && video?.kind !== "vimeo") return;
    const t = window.setTimeout(() => setEmbedReady(true), 600);
    return () => window.clearTimeout(t);
  }, [video?.kind, video?.src]);

  const showImageFallback = !video || videoErrored;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 animate-scale-reveal bg-charcoal" style={{ animationFillMode: "forwards" }}>
        {video && !videoErrored && <div className="absolute inset-0 bg-charcoal" aria-hidden />}
        {video?.kind === "file" && !videoErrored && (
          <>
            <video
              key={video.src}
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)] [-webkit-transform:translateZ(0)]"
              style={{ objectPosition: imagePosition || "center 10%", transform: `translateZ(0) scale(${Math.max(50, Math.min(200, Number(imageZoom || 100))) / 100})` }}
              src={video.src}
              autoPlay
              muted
              loop
              playsInline
              controls={false}
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              // @ts-expect-error fetchPriority helps LCP when hero is above the fold
              fetchPriority="high"
              onLoadedData={() => setFileVideoPlaying(true)}
              onPlaying={() => setFileVideoPlaying(true)}
              onCanPlay={() => setFileVideoPlaying(true)}
              onError={() => {
                console.error("[HeroSection] Failed to load hero video URL:", video.src);
                setVideoErrored(true);
              }}
            />
            {/* Intentionally no poster image when a hero video exists (video-only hero). */}
          </>
        )}
        {(video?.kind === "youtube" || video?.kind === "vimeo") && (
          <div className="pointer-events-none absolute inset-0 isolate overflow-hidden bg-charcoal [-webkit-overflow-scrolling:touch] [transform:translateZ(0)]">
            <iframe
              title="Hero background"
              src={video.src}
              onLoad={() => setEmbedReady(true)}
              className={`absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-500 ease-out max-md:scale-100 md:scale-[1.08] ${
                embedReady ? "opacity-100" : "opacity-0"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {showImageFallback && (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
            style={{
              objectPosition: imagePosition || "center 10%",
              transform: `scale(${Math.max(50, Math.min(200, Number(imageZoom || 100))) / 100})`,
            }}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/10" />
      <div className="relative z-10 flex h-full flex-col justify-end pb-20 md:pb-28 lg:pb-36 luxury-container">
        <div className="w-0 h-[3px] bg-gold mb-8 opacity-0 animate-line-expand animation-delay-200" style={{ animationFillMode: "forwards" }} />
        <p className="luxury-caption text-gold mb-5 opacity-0 animate-fade-in-up" style={{ animationFillMode: "forwards" }}>
          {caption}
        </p>
        <h1 className="luxury-heading-hero mb-6 text-ivory opacity-0 animate-fade-in-up animation-delay-200" style={{ animationFillMode: "forwards" }}>
          {title}
          <br />
          <span className="italic font-light">{subtitle}</span>
        </h1>
        <p className="font-body mb-10 max-w-lg text-lg font-medium text-ivory/80 opacity-0 animate-fade-in-up animation-delay-400 md:text-xl" style={{ animationFillMode: "forwards" }}>
          {description}
        </p>
        <div className="flex flex-col gap-4 opacity-0 animate-fade-in-up animation-delay-600 sm:flex-row" style={{ animationFillMode: "forwards" }}>
          <Link to={redirect} className="luxury-btn-light flex items-center gap-3">
            {buttonText} <ArrowRight size={14} strokeWidth={2.5} className="arrow-tilt" />
          </Link>
          <Link to="/bridal" className="luxury-btn-gold">
            Bridal Sarees
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
