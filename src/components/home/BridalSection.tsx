import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface BridalSectionProps {
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

const BridalSection = ({ caption, title, subtitle, description, image, imagePosition, imageZoom = 100, redirect, buttonText }: BridalSectionProps) => (
  <section className="relative h-[85vh] overflow-hidden">
    <img
      src={image}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        objectPosition: imagePosition || "center 30%",
        transform: `scale(${Math.max(50, Math.min(200, Number(imageZoom || 100))) / 100})`,
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent" />
    <div className="relative z-10 flex flex-col justify-center h-full luxury-container">
      <div className="max-w-xl">
        <p className="luxury-caption text-gold mb-5">{caption}</p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-ivory tracking-tight leading-[1.05] mb-6">
          {title}<br /><span className="italic font-light">{subtitle}</span><br />Celebrations
        </h2>
        <div className="w-16 h-[2px] bg-gold mb-8" />
        <p className="font-body text-base md:text-lg font-medium text-ivory/70 mb-10 max-w-md">{description}</p>
        <Link to={redirect} className="luxury-btn-light flex items-center gap-3">
          {buttonText} <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
        </Link>
      </div>
    </div>
  </section>
);

export default BridalSection;
