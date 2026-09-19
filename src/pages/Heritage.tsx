import { Link } from "react-router-dom";
import { SitePageIcon } from "@/components/site/SitePageIcon";
import { HERITAGE_PAGE_DEFAULT } from "@/data/sitePageContentDefaults";
import { useSitePageContent } from "@/hooks/useSitePageContent";
import { ArrowRight, Clock } from "lucide-react";

const Heritage = () => {
  const { content: c } = useSitePageContent("heritage", HERITAGE_PAGE_DEFAULT);

  return (
    <main>
      {/* Hero */}
      <section className="relative h-[80vh] overflow-hidden">
        <img
          src={c.hero.imageUrl}
          alt="Heritage saree craftsmanship"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
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
            {c.hero.title}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="bg-background">
        <div className="luxury-container py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="luxury-caption text-gold mb-4">{c.story.caption}</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.05] text-foreground mb-6">
                {c.story.headingLine1}
                <br />
                <span className="italic font-light text-maroon">{c.story.headingLine2Italic}</span>
              </h2>
              <div className="w-16 h-[2px] bg-gold mb-8" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              {c.story.paragraphs.map((para, i) => (
                <p key={i} className="font-body text-base md:text-lg font-medium text-foreground/60 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

     {/* {/* Timeline 
      <section className="bg-maroon-deep">
        <div className="luxury-container py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {c.timeline.map((item, i) => (
              <div key={`${item.year}-${i}`} className="relative">
                {i < c.timeline.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-12 bg-gold/20" />
                )}
                <p className="font-display text-3xl md:text-4xl font-black text-gold leading-none">{item.year}</p>
                <p className="font-body text-[11px] uppercase tracking-[0.2em] font-semibold text-ivory/50 mt-3">
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}



      {/* Timeline */}
      <section className="bg-maroon-deep">
        <div className="luxury-container py-20">

          <div className="flex flex-wrap justify-center gap-12 md:gap-16 text-center">
            {c.timeline.map((item: { year: string; event: string }, i: number) => (
              
              <div key={`${item.year}-${i}`} className="group relative flex flex-col items-center justify-start min-w-[150px] transition-all duration-500 ease-out hover:-translate-y-1">
              
              {/* Divider line */}
                {i < c.timeline.length - 1 && (
                  <div className="hidden md:block absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 w-[1px] h-14 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
                )}

                <p className="font-display text-4xl md:text-5xl font-black text-gold tracking-tight transition-all duration-300 group-hover:scale-105">
                  {item.year}
                </p>

                {/* Dot indicator */}
                <div className="w-2 h-2 bg-gold rounded-full mt-3 mb-3 opacity-70 group-hover:opacity-100 transition" />

                <p className="font-body text-[11px] md:text-xs uppercase tracking-[0.25em] font-semibold text-ivory/60 leading-relaxed max-w-[160px]">
                  {item.event}
                 </p>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Craftsmanship */}
      <section className="bg-ivory-warm">
        <div className="luxury-container py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold/20 hidden lg:block" />
              <img
                src={c.craftsmanship.imageUrl}
                alt="Artisan at handloom"
                className="relative w-full h-[450px] lg:h-[550px] object-cover"
              />
            </div>
            <div>
              <p className="luxury-caption text-gold mb-4">{c.craftsmanship.caption}</p>
              <h2 className="font-display text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6">
                {c.craftsmanship.headingLine1}
                <br />
                <span className="italic font-light text-maroon">{c.craftsmanship.headingLine2Italic}</span>
              </h2>
              <div className="w-12 h-[2px] bg-gold mb-8" />
              <div className="space-y-5">
                {c.craftsmanship.features.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <SitePageIcon name={item.icon} size={18} strokeWidth={1.5} className="text-gold" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-bold mb-1">{item.title}</h4>
                      <p className="font-body text-[13px] text-foreground/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zari detail */}
      <section className="bg-background">
        <div className="luxury-container py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            <div className="lg:col-span-5 bg-cream p-10 md:p-14 lg:p-16 flex flex-col justify-center border border-border lg:border-r-0">
              <p className="luxury-caption text-gold mb-4">{c.weaving.caption}</p>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
                {c.weaving.headingLine1}
                <br />
                <span className="italic font-light text-maroon">{c.weaving.headingLine2Italic}</span>
              </h3>
              <div className="w-12 h-[2px] bg-gold mb-6" />
              <div className="space-y-4">
                {c.weaving.centers.map((center) => (
                  <div key={center.loc} className="flex items-center gap-3 py-2 border-b border-border">
                    <SitePageIcon name="MapPin" size={14} strokeWidth={1.5} className="text-gold flex-shrink-0" />
                    <div>
                      <span className="font-display text-sm font-bold">{center.loc}</span>
                      <span className="font-body text-[11px] text-foreground/40 ml-2">· {center.specialty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <img
                src={c.weaving.sideImageUrl}
                alt="Zari weaving detail"
                className="w-full h-[400px] lg:h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal">
        <div className="luxury-container py-20 md:py-24 text-center">
          <Clock size={28} strokeWidth={1.5} className="text-gold mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ivory mb-4">{c.cta.title}</h2>
          <p className="font-body text-base text-ivory/60 max-w-lg mx-auto mb-10">{c.cta.body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={c.cta.primaryPath} className="luxury-btn-light flex items-center gap-3 mx-auto sm:mx-0">
              {c.cta.primaryLabel} <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
            </Link>
            <Link to={c.cta.secondaryPath} className="luxury-btn-gold mx-auto sm:mx-0">
              {c.cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Heritage;
