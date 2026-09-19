import { Link } from "react-router-dom";
import { SitePageIcon } from "@/components/site/SitePageIcon";
import { STORE_PAGE_DEFAULT } from "@/data/sitePageContentDefaults";
import { useSitePageContent } from "@/hooks/useSitePageContent";
import { ArrowRight } from "lucide-react";

const Store = () => {
  const { content: c } = useSitePageContent("store", STORE_PAGE_DEFAULT);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[80vh] overflow-hidden">
        <img
          src={c.hero.imageUrl}
          alt="Athina Regal Weaves Hyderabad Atelier"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-charcoal/10" />
        <div className="relative z-10 flex flex-col justify-end h-full pb-20 md:pb-28 luxury-container">
          <div
            className="w-0 h-[3px] bg-gold mb-8 opacity-0 animate-line-expand animation-delay-200"
            style={{ animationFillMode: "forwards" }}
          />
          <p
            className="luxury-caption text-gold mb-5 opacity-0 animate-fade-in-up"
            style={{ animationFillMode: "forwards" }}
          >
            {c.hero.caption}
          </p>
          <h1
            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-black text-ivory tracking-tight leading-[1.05] opacity-0 animate-fade-in-up animation-delay-200"
            style={{ animationFillMode: "forwards" }}
          >
            {c.hero.titleLine1}
            <br />
            <span className="italic font-light">{c.hero.titleLine2Italic}</span>
          </h1>
        </div>
      </section>

      {/* Experience intro */}
      <section className="bg-background">
        <div className="luxury-container py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="luxury-caption text-gold mb-4">{c.intro.caption}</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-foreground mb-6">
                {c.intro.headingLine1}
                <br />
                <span className="italic font-light text-maroon">{c.intro.headingLine2Italic}</span>
              </h2>
              <div className="w-16 h-[2px] bg-gold mb-8" />
              {c.intro.paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`font-body text-base md:text-lg font-medium text-foreground/60 leading-relaxed ${i < c.intro.paragraphs.length - 1 ? "mb-6" : ""}`}
                >
                  {p}
                </p>
              ))}
            </div>
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-full h-full border-2 border-gold/20 hidden lg:block" />
              <img
                src={c.intro.sideImageUrl}
                alt="Atelier interior"
                className="relative w-full h-[400px] lg:h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-ivory-warm">
        <div className="luxury-container py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="luxury-caption text-gold mb-4">{c.services.sectionCaption}</p>
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {c.services.headingLine1} <span className="italic font-light text-maroon">{c.services.headingLine2Italic}</span>
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {c.services.items.map((item) => (
              <div
                key={item.title}
                className="bg-background border border-border p-8 flex flex-col text-center group hover:border-gold/50 transition-colors duration-300"
              >
                <div className="w-14 h-14 border border-gold/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                  <SitePageIcon
                    name={item.icon}
                    size={22}
                    strokeWidth={1.5}
                    className="text-gold group-hover:text-charcoal transition-colors duration-300"
                  />
                </div>
                <h3 className="font-display text-lg font-bold mb-3">{item.title}</h3>
                <p className="font-body text-[13px] text-foreground/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store details */}
      <section className="bg-maroon-deep">
        <div className="luxury-container py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {c.details.items.map((item) => (
              <div key={item.label} className="py-4">
                <SitePageIcon name={item.icon} size={22} strokeWidth={1.5} className="text-gold mx-auto mb-4" />
                <p className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-3">{item.label}</p>
                <p className="font-body text-sm text-ivory/60 whitespace-pre-line leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-background">
        <div className="luxury-container py-20 md:py-28">
          <div className="text-center mb-12">
            <p className="luxury-caption text-gold mb-4">{c.map.sectionCaption}</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {c.map.headingLine1} <span className="italic font-light text-maroon">{c.map.headingLine2Italic}</span>
            </h2>
          </div>
          <div className="w-full h-[400px] md:h-[500px] border border-border">
            <iframe
              src={c.map.iframeSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Athina Regal Weaves Hyderabad Atelier Location"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal">
        <div className="luxury-container py-20 md:py-24 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory mb-4">{c.cta.title}</h2>
          <p className="font-body text-base text-ivory/60 max-w-lg mx-auto mb-10">{c.cta.body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={c.cta.bookPath} className="luxury-btn-light flex items-center gap-3 mx-auto sm:mx-0">
              {c.cta.bookLabel} <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
            </Link>
            <a href={`tel:${c.cta.callTel.replace(/\s/g, "")}`} className="luxury-btn-gold mx-auto sm:mx-0">
              {c.cta.callLabel}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Store;
