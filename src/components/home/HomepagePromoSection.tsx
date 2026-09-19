import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Full-bleed promo block for admin-added homepage sections (same rhythm as Linen / Tissue). */
export interface HomepagePromoSectionProps {
  caption: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition?: string;
  imageZoom?: number;
  redirect: string;
  buttonText: string;
}

const HomepagePromoSection = ({
  caption,
  title,
  subtitle,
  description,
  image,
  imagePosition,
  imageZoom = 100,
  redirect,
  buttonText,
}: HomepagePromoSectionProps) => (
  <section className="relative min-h-[70vh] md:h-[75vh] overflow-hidden">
    <img
      src={image}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        objectPosition: imagePosition || "center center",
        transform: `scale(${Math.max(50, Math.min(200, Number(imageZoom || 100))) / 100})`,
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/35 to-transparent" />
    <div className="relative z-10 flex flex-col justify-center min-h-[70vh] md:min-h-0 md:h-full luxury-container py-16 md:py-0">
      <div className="max-w-lg">
        <p className="luxury-caption text-gold mb-5">{caption}</p>
        <h2 className="font-display text-4xl md:text-6xl font-black text-ivory tracking-tight leading-[1.05] mb-6">
          {title}
          {subtitle ? (
            <>
              <br />
              <span className="italic font-light">{subtitle}</span>
            </>
          ) : null}
        </h2>
        <div className="w-16 h-[2px] bg-gold mb-8" />
        <p className="font-body text-base md:text-lg font-medium text-ivory/70 mb-10">{description}</p>
        <Link to={redirect} className="luxury-btn-light inline-flex items-center gap-3">
          {buttonText} <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
        </Link>
      </div>
    </div>
  </section>
);

export default HomepagePromoSection;
