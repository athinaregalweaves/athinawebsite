import { Fragment } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-saree.jpg";
import craftsmanshipImage from "@/assets/craftsmanship.jpg";
import bridalBanner from "@/assets/bridal-banner.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import collectionTissue from "@/assets/collection-tissue.jpg";
import collectionLinen from "@/assets/collection-linen.jpg";
import bestsellerImage from "@/assets/section-bestseller-new.png";
import zariDetailImage from "@/assets/section-zari-detail.jpg";
import newArrivalsImage from "@/assets/section-new-arrivals.jpg";
import SareeBorder from "@/components/SareeBorder";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import HeroSection from "@/components/home/HeroSection";
import BridalSection from "@/components/home/BridalSection";
import TissueSection from "@/components/home/TissueSection";
import LinenSection from "@/components/home/LinenSection";
import HomepagePromoSection from "@/components/home/HomepagePromoSection";
import { ArrowRight, Truck, ShieldCheck, RefreshCw, Phone, Star, Award, MapPin, Clock } from "lucide-react";

const BUILTIN_SECTION_KEYS = new Set(["hero", "bridal", "tissue", "linen", "bestseller"]);

const Index = () => {
  const { sections, orderedSections, hasData, loaded } = useHomepageSections();

  const extraSections = orderedSections.filter((s) => s.section_key && !BUILTIN_SECTION_KEYS.has(s.section_key));

  // Defaults for each section
  const hero = hasData && sections.hero ? {
    caption: sections.hero.caption,
    title: sections.hero.title,
    subtitle: sections.hero.subtitle,
    description: sections.hero.description,
    image: sections.hero.image_url || heroImage,
    imagePosition: sections.hero.image_position || "center 10%",
    imageZoom: Number(sections.hero.image_zoom || 100),
    videoUrl: sections.hero.video_url?.trim() || undefined,
    redirect: sections.hero.redirect_page,
    buttonText: sections.hero.button_text,
  } : {
    caption: "Hyderabad · Heritage Handloom",
    title: "Timeless Sarees",
    subtitle: "Crafted for Legacy",
    description: "Discover curated handloom sarees designed for modern royalty. Each piece, a masterwork of Indian artistry.",
    image: heroImage,
    imagePosition: "center 10%",
    imageZoom: 100,
    redirect: "/collections",
    buttonText: "Explore Collection",
  };

  const bridal = hasData && sections.bridal ? {
    caption: sections.bridal.caption,
    title: sections.bridal.title,
    subtitle: sections.bridal.subtitle,
    description: sections.bridal.description,
    image: sections.bridal.image_url || bridalBanner,
    imagePosition: sections.bridal.image_position || "center 30%",
    imageZoom: Number(sections.bridal.image_zoom || 100),
    redirect: "/bridal",
    buttonText: sections.bridal.button_text,
  } : {
    caption: "Bridal Couture",
    title: "Bridal Sarees",
    subtitle: "for Grand Celebrations",
    description: "Sarees crafted for the most celebrated moments. Each bridal piece is a masterwork of heritage weaving and timeless beauty.",
    image: bridalBanner,
    imagePosition: "center 30%",
    imageZoom: 100,
    redirect: "/bridal",
    buttonText: "View Bridal Collection",
  };

  const tissue = hasData && sections.tissue ? {
    caption: sections.tissue.caption,
    title: sections.tissue.title,
    subtitle: sections.tissue.subtitle,
    description: sections.tissue.description,
    image: sections.tissue.image_url || collectionTissue,
    imagePosition: sections.tissue.image_position || "center center",
    imageZoom: Number(sections.tissue.image_zoom || 100),
    redirect: "/tissue",
    buttonText: sections.tissue.button_text,
  } : {
    caption: "Ethereal Elegance",
    title: "Tissue &",
    subtitle: "Organza",
    description: "Luminous tissue weaves and delicate organza sarees that capture light and movement with every drape.",
    image: collectionTissue,
    imagePosition: "center center",
    imageZoom: 100,
    redirect: "/tissue",
    buttonText: "Explore Tissue",
  };

  const linen = hasData && sections.linen ? {
    caption: sections.linen.caption,
    title: sections.linen.title,
    subtitle: sections.linen.subtitle,
    description: sections.linen.description,
    image: sections.linen.image_url || collectionLinen,
    imagePosition: sections.linen.image_position || "center center",
    imageZoom: Number(sections.linen.image_zoom || 100),
    redirect: "/linen",
    buttonText: sections.linen.button_text,
  } : {
    caption: "Contemporary Heritage",
    title: "Linen &",
    subtitle: "Cotton",
    description: "Everyday luxury in breathable linen and cotton weaves. Perfect for the modern woman who values comfort and craft.",
    image: collectionLinen,
    imagePosition: "center center",
    imageZoom: 100,
    redirect: "/linen",
    buttonText: "Explore Linen",
  };

  const bestseller = hasData && sections.bestseller ? {
    caption: sections.bestseller.caption || "Bestseller Collection",
    title: sections.bestseller.title || "The Banarasi",
    subtitle: sections.bestseller.subtitle || "Legacy",
    description:
      sections.bestseller.description ||
      "Our most treasured collection — Banarasi silks handwoven by master artisans with pure gold and silver zari.",
    image: sections.bestseller.image_url || bestsellerImage,
    imagePosition: sections.bestseller.image_position || "center center",
    imageZoom: Number(sections.bestseller.image_zoom || 100),
    redirect: sections.bestseller.redirect_page || "/collections",
    buttonText: sections.bestseller.button_text || "Shop Banarasi",
  } : {
    caption: "Bestseller Collection",
    title: "The Banarasi",
    subtitle: "Legacy",
    description:
      "Our most treasured collection — Banarasi silks handwoven by master artisans with pure gold and silver zari.",
    image: bestsellerImage,
    imagePosition: "center center",
    imageZoom: 100,
    redirect: "/collections",
    buttonText: "Shop Banarasi",
  };

  return (
    <main>
      {/* Avoid image-then-video flash: defaults omit video until API returns */}
      {loaded ? (
        <HeroSection {...hero} />
      ) : (
        <section
          className="relative h-screen w-full overflow-hidden bg-charcoal"
          aria-busy="true"
          aria-label="Loading hero"
        />
      )}
      <SareeBorder />
      <BridalSection {...bridal} />
      <SareeBorder />
      <TissueSection {...tissue} />
      <SareeBorder />
      <LinenSection {...linen} />

      {extraSections.map((s) => (
        <Fragment key={s.id}>
          <SareeBorder />
          <HomepagePromoSection
            caption={s.caption || "Featured"}
            title={s.title}
            subtitle={s.subtitle}
            description={s.description}
            image={s.image_url || collectionLinen}
            imagePosition={s.image_position || "center center"}
            imageZoom={Number((s as any).image_zoom || 100)}
            redirect={s.redirect_page || "/collections"}
            buttonText={s.button_text || "Explore"}
          />
        </Fragment>
      ))}

      {/* ===== STATS ===== */}
      <section className="bg-maroon-deep relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A45A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="relative luxury-container py-20 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { number: "10+", label: "Years of Heritage", icon: Clock },
              { number: "200+", label: "Master Artisans", icon: Award },
              { number: "5000+", label: "Sarees Crafted", icon: Star },
              { number: "15+", label: "Weaving Centers", icon: MapPin },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center relative">
                {i < 3 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-16 bg-gold/20" />}
                <stat.icon size={22} strokeWidth={1.5} className="text-gold/60 mx-auto mb-4" />
                <p className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-gold leading-none">{stat.number}</p>
                <p className="font-body text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-ivory/50 mt-3">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BESTSELLER ===== */}
      <section className="bg-background">
        <div className="luxury-container py-16 md:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-gold/40 px-5 py-2 mb-6">
              <Star size={12} strokeWidth={2} className="text-gold" />
              <span className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold">{bestseller.caption}</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
              {bestseller.title} <span className="italic font-light text-maroon">{bestseller.subtitle}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            <div className="lg:col-span-7 relative">
              <img
                src={bestseller.image}
                alt="Bestselling Banarasi silk saree"
                className="w-full h-[450px] lg:h-[600px] object-cover"
                style={{
                  objectPosition: bestseller.imagePosition,
                  transform: `scale(${Math.max(50, Math.min(200, Number(bestseller.imageZoom || 100))) / 100})`,
                }}
              />
            </div>
            <div className="lg:col-span-5 bg-ivory-warm p-10 md:p-14 lg:p-16 flex flex-col justify-center lg:-ml-16 lg:my-12 relative z-10 border border-border">
              <div className="w-12 h-[2px] bg-gold mb-8" />
              <p className="font-body text-base md:text-lg font-medium text-foreground/70 leading-relaxed mb-8">
                {bestseller.description}
              </p>
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { num: "15-30", label: "Days to weave" },
                  { num: "Pure", label: "Gold & Silver Zari" },
                  { num: "3rd", label: "Gen Artisans" },
                ].map((feat) => (
                  <div key={feat.label} className="border-l-2 border-maroon/30 pl-4">
                    <p className="font-display text-2xl font-bold text-maroon leading-none">{feat.num}</p>
                    <p className="font-body text-[9px] uppercase tracking-[0.2em] font-bold text-foreground/40 mt-1">{feat.label}</p>
                  </div>
                ))}
              </div>
              <Link to={bestseller.redirect} className="luxury-btn self-start flex items-center gap-3">
                {bestseller.buttonText} <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="relative h-[60vh] overflow-hidden">
        <img src={newArrivalsImage} alt="New saree arrivals in jewel tones" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center luxury-container">
          <p className="luxury-caption text-gold mb-4">Just Dropped</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tight leading-[1.05] mb-6">New Arrivals</h2>
          <div className="w-16 h-[2px] bg-gold mb-6" />
          <p className="font-body text-base md:text-lg font-medium text-ivory/70 max-w-lg mb-10">Fresh additions to our heritage collection. Be the first to explore the newest weaves.</p>
          <Link to="/collections" className="luxury-btn-light flex items-center gap-3">Discover New <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" /></Link>
        </div>
      </section>

      {/* ===== PURE ZARI ===== */}
      <section className="bg-ivory-warm">
        <div className="luxury-container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-gold/20 hidden lg:block" />
              <img src={zariDetailImage} alt="Close-up of pure gold zari weaving" className="relative w-full h-[450px] lg:h-[550px] object-cover" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-maroon/15 hidden lg:block" />
            </div>
            <div>
              <p className="luxury-caption text-gold mb-4">Our Promise</p>
              <h2 className="font-display text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-foreground mb-6">
                Pure Zari.<br /><span className="italic font-light text-maroon">Pure Craft.</span>
              </h2>
              <div className="w-16 h-[2px] bg-gold mb-8" />
              <p className="font-body text-base md:text-lg font-medium text-foreground/60 leading-relaxed mb-10">
                Every thread is authentic. We use only pure gold and silver zari — never compromised.
                Our direct relationships with weaving families ensure authenticity at every step.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  { icon: ShieldCheck, label: "Certified Authentic", desc: "Every piece verified" },
                  { icon: Truck, label: "Free Shipping", desc: "Pan-India delivery" },
                  { icon: RefreshCw, label: "Easy Returns", desc: "Hassle-free process" },
                  { icon: Phone, label: "Styling Support", desc: "Expert guidance" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-10 h-10 border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon size={18} strokeWidth={1.5} className="text-gold" />
                    </div>
                    <div>
                      <p className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground">{item.label}</p>
                      <p className="font-body text-[11px] text-foreground/50 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/heritage" className="luxury-btn self-start flex items-center gap-3">Learn More <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HANDWOVEN HERITAGE ===== */}
      <section className="bg-background">
        <div className="luxury-container py-16 md:py-24">
          <div className="text-center mb-16">
            <p className="luxury-caption text-gold mb-4">The Art of Weaving</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-foreground">
              Handwoven <span className="italic font-light text-maroon">Heritage</span>
            </h2>
            <div className="w-20 h-[2px] bg-gold mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
            <div className="lg:col-span-5 bg-cream p-10 md:p-14 lg:p-16 flex flex-col justify-center border border-border lg:border-r-0">
              <div className="inline-flex items-center gap-3 border border-gold/30 px-5 py-2 mb-8 w-fit">
                <Award size={14} strokeWidth={1.5} className="text-gold" />
                <span className="font-body text-[10px] uppercase tracking-[0.2em] font-bold text-gold">Master Artisans</span>
              </div>
              <div className="space-y-5 mb-10">
                <p className="font-body text-base font-medium text-foreground/60 leading-relaxed">
                  Every saree is a testament to India's unparalleled textile heritage.
                  Our master weavers bring each piece to life on handlooms that have witnessed generations of artistry.
                </p>
                <p className="font-body text-base font-medium text-foreground/60 leading-relaxed">
                  From Banarasi silk to Kanchipuram techniques, each piece takes weeks
                  to complete — a living art form passed through generations.
                </p>
              </div>
              <Link to="/heritage" className="luxury-btn self-start flex items-center gap-3">Our Heritage <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" /></Link>
            </div>
            <div className="lg:col-span-7 relative">
              <img src={craftsmanshipImage} alt="Artisan weaving silk saree" className="w-full h-[450px] lg:h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ATELIER ===== */}
      <section className="bg-ivory-warm">
        <div className="luxury-container py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch min-h-[550px]">
            <div className="lg:col-span-5 flex flex-col justify-center lg:pr-16 order-2 lg:order-1 py-10 lg:py-0">
              <p className="luxury-caption text-gold mb-3">The Hyderabad Atelier</p>
              <h2 className="luxury-heading mb-4">An Experience<br />Beyond Shopping</h2>
              <div className="luxury-divider-left" />
              <p className="luxury-body mb-8">
                Step into our Jubilee Hills atelier and enter a world where luxury meets tradition.
                Our private viewing rooms offer an intimate setting to explore our finest collections.
              </p>
              <div className="space-y-5 mb-10">
                {[
                  { title: "Private Viewing", desc: "Intimate sessions in our luxurious suites" },
                  { title: "Personal Styling", desc: "Expert guidance for every occasion" },
                  { title: "Exclusive Access", desc: "Collections available only at the atelier" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-gold mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-display text-base font-bold">{item.title}</h4>
                      <p className="font-body text-sm font-medium text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/store" className="luxury-btn self-start flex items-center gap-3">Visit The Atelier <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" /></Link>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <img src={storeInterior} alt="Luxury saree boutique interior in Hyderabad" className="w-full h-[400px] md:h-[500px] lg:h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-maroon-deep relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A45A' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="relative luxury-container text-center">
          <p className="luxury-caption text-gold mb-5">Begin Your Journey</p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-ivory tracking-tight leading-tight mb-6">
            Every Saree Tells a Story.<br />
            <span className="italic font-light text-gold">What Will Yours Be?</span>
          </h2>
          <div className="luxury-divider" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/collections" className="luxury-btn-light flex items-center gap-3 mx-auto sm:mx-0">Explore Collections <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" /></Link>
            <Link to="/contact" className="luxury-btn-gold mx-auto sm:mx-0">Book Private Viewing</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
