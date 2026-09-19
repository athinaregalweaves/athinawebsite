import { Link } from "react-router-dom";
import { SitePageIcon } from "@/components/site/SitePageIcon";
import { ABOUT_PAGE_DEFAULT } from "@/data/sitePageContentDefaults";
import { useSitePageContent } from "@/hooks/useSitePageContent";

const AboutUs = () => {
  const { content: c } = useSitePageContent("about", ABOUT_PAGE_DEFAULT);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={c.hero.imageUrl}
          alt="Athina Regal Weaves heritage"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-charcoal/10" />
        <div className="relative z-10 flex flex-col justify-end h-full pb-16 md:pb-24 luxury-container">
          <p className="luxury-caption text-gold mb-4">{c.hero.caption}</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-ivory tracking-tight leading-[1.05]">
            {c.hero.title}
          </h1>
          <p className="font-body text-base md:text-lg text-ivory/70 mt-4 max-w-xl">{c.hero.subtitle}</p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="luxury-container py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="luxury-caption text-gold mb-4">{c.story.caption}</p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-6">
              {c.story.headingLine1}
              <br />
              <span className="italic font-light text-maroon">{c.story.headingLine2Italic}</span>
            </h2>
            <div className="font-body text-foreground/70 space-y-4 leading-relaxed">
              {c.story.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
          <div className="aspect-[4/5] overflow-hidden">
            <img src={c.story.sideImageUrl} alt="Handloom craftsmanship" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* What We Sell */}
      <section className="bg-charcoal-mid py-16 md:py-24">
        <div className="luxury-container">
          <div className="text-center mb-12">
            <p className="luxury-caption text-gold mb-4">{c.collections.sectionCaption}</p>
            <h2 className="font-display text-3xl md:text-4xl font-black text-ivory tracking-tight">{c.collections.headingTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.collections.items.map((item) => (
              <div key={item.title} className="p-6 border border-ivory/10 bg-charcoal/50">
                <h3 className="font-display text-lg font-bold text-ivory mb-2">{item.title}</h3>
                <p className="font-body text-sm text-ivory/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="luxury-container py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="luxury-caption text-gold mb-4">{c.journey.sectionCaption}</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">{c.journey.headingTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {c.journey.steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 border-2 border-gold flex items-center justify-center">
                <span className="font-display text-lg font-bold text-gold">{item.step}</span>
              </div>
              <h3 className="font-body text-sm font-bold uppercase tracking-wider text-foreground mb-2">{item.title}</h3>
              <p className="font-body text-sm text-foreground/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary/30 py-16 md:py-20">
        <div className="luxury-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {c.stats.items.map((stat) => (
              <div key={stat.label}>
                <SitePageIcon name={stat.icon} size={28} className="mx-auto text-gold mb-3" />
                <p className="font-display text-3xl md:text-4xl font-black text-foreground">{stat.value}</p>
                <p className="font-body text-xs uppercase tracking-wider text-foreground/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promises */}
      <section className="luxury-container py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="luxury-caption text-gold mb-4">{c.promises.sectionCaption}</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight">{c.promises.headingTitle}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.promises.items.map((item) => (
            <div key={item.title} className="p-6 border border-border bg-background">
              <SitePageIcon name={item.icon} size={24} className="text-gold mb-3" />
              <h3 className="font-body text-sm font-bold uppercase tracking-wider text-foreground mb-2">{item.title}</h3>
              <p className="font-body text-sm text-foreground/60 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal-mid py-16 md:py-24">
        <div className="luxury-container text-center">
          <p className="luxury-caption text-gold mb-4">{c.cta.caption}</p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-ivory tracking-tight mb-4">{c.cta.title}</h2>
          <p className="font-body text-ivory/60 max-w-md mx-auto mb-8">{c.cta.body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={c.cta.primaryPath} className="luxury-btn-gold inline-block">
              {c.cta.primaryLabel}
            </Link>
            <Link to={c.cta.secondaryPath} className="luxury-btn-maroon inline-block">
              {c.cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
