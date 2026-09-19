import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Clock, User, Bookmark } from "lucide-react";

// Banarasi
import blogBaranasiMain from "@/assets/blog-banarasi-main.jpg";
import blogBaranasiZari from "@/assets/blog-banarasi-zari.jpg";
import blogBaranasiLoom from "@/assets/blog-banarasi-loom.jpg";
import blogSilkThreads from "@/assets/blog-silk-threads.jpg";

// Kanjeevaram
import blogKanjeeMain from "@/assets/blog-kanjee-final.jpg";
import blogKanjeeWeave from "@/assets/blog-kanjee-weave.jpg";
import blogKanjeeMotif from "@/assets/blog-kanjee-motif.jpg";

// Bridal
import blogBridalPrep from "@/assets/blog-bridal-prep.jpg";
import blogBridalStyled from "@/assets/blog-bridal-styled.jpg";
import blogBridalJewelry from "@/assets/blog-bridal-jewelry.jpg";

// Chanderi
import blogChanderiDrape from "@/assets/blog-chanderi-drape.jpg";
import blogChanderiLoom from "@/assets/blog-chanderi-loom.jpg";
import blogChanderiBooti from "@/assets/blog-chanderi-booti.jpg";

// Tissue
import blogTissueFinal from "@/assets/blog-tissue-final.jpg";
import blogTissueLoom from "@/assets/blog-tissue-loom.jpg";
import blogTissuePainting from "@/assets/blog-tissue-painting.jpg";

// Patola
import blogPatolaFinal from "@/assets/blog-patola-final.jpg";
import blogPatolaDyeing from "@/assets/blog-patola-dyeing.jpg";
import blogPatolaWeavers from "@/assets/blog-patola-weavers.jpg";

// Tussar
import blogTussarStretch from "@/assets/blog-tussar-stretch.jpg";
import blogTussarCocoons from "@/assets/blog-tussar-cocoons.jpg";
import blogTussarPainted from "@/assets/blog-tussar-painted.jpg";

interface InlineImage {
  src: string;
  caption: string;
  position: "left" | "right" | "full";
}

interface BlogPost {
  id: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  headline: string;
  subheadline: string;
  excerpt: string;
  body: string[];
  image: string;
  imageCaption: string;
  pullQuote?: string;
  processImage: string;
  processImageCaption: string;
  inlineImages: InlineImage[];
}

const blogPosts: BlogPost[] = [
  {
    id: "the-dying-art-of-banarasi-weaving",
    date: "March 28, 2026",
    readTime: "14 min read",
    author: "Athina Editorial",
    category: "Heritage & Craft",
    headline: "The Dying Art of Banarasi Weaving: How Three Generations Keep India's Golden Thread Alive",
    subheadline: "In the narrow lanes of Varanasi, master weavers fight to preserve a 600-year-old tradition that produces some of the world's most exquisite silk textiles",
    excerpt: "As dawn breaks over the ghats of Varanasi, the rhythmic clatter of wooden looms echoes through ancient alleyways. Here, in workshops that have stood for centuries, master artisans continue a tradition that predates the Mughal Empire itself — the art of weaving Banarasi silk with pure gold and silver zari. This is not merely a craft; it is a living, breathing testament to India's unparalleled textile heritage, a tradition so magnificent that it was once reserved exclusively for royalty and the highest echelons of society.",
    body: [
      "The story of Banarasi silk is, in many ways, the story of India itself — a tapestry woven from threads of empire, devotion, and extraordinary human skill. When the Mughal courts first commissioned these fabrics in the 14th century, they demanded nothing less than perfection. Weavers responded by developing techniques so intricate that a single saree could take up to six months to complete, with every motif telling a story drawn from Persian gardens, Hindu mythology, or the natural world.",
      "Today, fewer than 200 master weavers remain in Varanasi who possess the complete knowledge of traditional kadwa weaving — the most laborious technique where each motif is individually woven by hand rather than using the faster jacquard method. These artisans, many of them third and fourth-generation weavers, represent the last guardians of a craft that UNESCO has recognized as an Intangible Cultural Heritage of Humanity.",
      "At Athina Regal Weaves, our relationship with these weaving families spans over seven decades. We work directly with 200+ artisan households across Varanasi, Bhadohi, and Mubarakpur, ensuring that every saree in our collection carries not just the beauty of the weave, but the livelihood and dignity of its creator.",
      "The process of creating a single Banarasi masterpiece is nothing short of remarkable. It begins with the selection of the finest mulberry silk threads, which are then dyed using both traditional and modern colour-fast techniques. The warp threads are carefully set on the loom — a process that itself takes several days of meticulous preparation.",
      "Perhaps the most precious element is the zari — the metallic thread that gives Banarasi silk its legendary shimmer. Authentic zari is made by flattening fine gold or silver wire and wrapping it around a silk core. At Athina, we insist on pure zari for our premium collections, refusing the cheaper alternatives that have flooded the market.",
      "The motifs found on Banarasi sarees are a visual encyclopedia of India's cultural heritage. The 'bel' (creeper vine) represents continuity and growth; the 'jhumki' (earring) motif speaks of adornment and celebration; the 'asharfi' (gold coin) pattern symbolizes prosperity.",
      "The future of Banarasi weaving hangs in a delicate balance. Young weavers, drawn by the promise of steady income in factories, are increasingly reluctant to undertake the years of rigorous apprenticeship required to master this art. It is this understanding that drives our mission at Athina.",
    ],
    image: blogBaranasiMain,
    imageCaption: "A master weaver in his dimly lit Varanasi workshop, guided by oil lamp light, continues a tradition passed down through generations.",
    pullQuote: "\"Each thread we weave carries the prayers of our ancestors and the hopes of our children. This is not merely a craft — it is our sacred duty.\" — Ustad Rehman Ansari, Master Weaver, Varanasi",
    processImage: blogBaranasiLoom,
    processImageCaption: "The artisan's hands guide silk threads on a traditional pit loom, transforming raw silk and zari into textile masterpieces.",
    inlineImages: [
      { src: blogBaranasiZari, caption: "Pure gold zari threads laid over royal purple Banarasi silk — the precious metallic element that gives these sarees their legendary shimmer.", position: "right" },
      { src: blogSilkThreads, caption: "A vibrant palette of hand-dyed silk thread bobbins in a Varanasi weaver's workshop — each colour carefully matched to the naqsha design.", position: "full" },
    ],
  },
  {
    id: "kanjeevaram-silk-complete-guide",
    date: "March 25, 2026",
    readTime: "16 min read",
    author: "Athina Heritage Desk",
    category: "Saree Encyclopedia",
    headline: "Kanjeevaram Silk: The Queen of Indian Sarees — A Complete Guide to the World's Most Revered Textile",
    subheadline: "From the temple town of Kanchipuram to global runways, understanding the grandeur, craftsmanship, and cultural significance of South India's most treasured silk",
    excerpt: "In the ancient temple town of Kanchipuram, nestled in the heart of Tamil Nadu, a textile tradition thrives that is as old as the temples themselves. The Kanjeevaram silk saree — often called the 'Queen of Silks' — is not merely a garment; it is an institution, a cultural artifact, and for millions of South Indian women, an indispensable part of life's most sacred moments.",
    body: [
      "The history of Kanjeevaram weaving stretches back over 400 years, with legends attributing its origins to Sage Markanda, the master weaver of the gods. The weavers of Kanchipuram perfected their art under the patronage of the Pallava, Chola, and Vijayanagara dynasties, each era adding new dimensions to the craft.",
      "What distinguishes a Kanjeevaram silk from all other Indian sarees is its extraordinary construction. The body and the border are woven separately and then interlocked using a technique called 'korvai' — a method unique to Kanchipuram weaving that creates an incredibly durable bond.",
      "The silk used in Kanjeevaram sarees comes from South Indian mulberry silk and the finest Japanese and Chinese silk threads. The raw silk is treated with rice starch and vegetable oils — the famous 'kalappam' process — giving it that distinctive stiffness and rustling sound.",
      "The zari work in Kanjeevaram sarees is legendary. Traditionally, pure silver wire dipped in 24-carat gold was drawn into fine threads and woven into the fabric. The weight of a traditional Kanjeevaram with heavy zari work can exceed one kilogram — a tangible measure of its opulence.",
      "The motifs are drawn primarily from magnificent South Indian temple architecture — the 'gopuram' (temple tower) border, the 'annapakshi' (mythical swan-peacock), and the 'manga malai' (mango chain). The pallu alone can take several days to weave.",
      "At Athina Regal Weaves, our Kanjeevaram collection is sourced directly from the most respected weaving cooperatives in Kanchipuram. Every piece undergoes rigorous quality testing — silk purity, zari gold content, and korvai interlocking integrity.",
      "Caring for a Kanjeevaram is an art in itself. These robust silks, when properly maintained, can last for over a century. The zari develops a beautiful antique patina over time, which many connoisseurs consider more valuable than the original brightness.",
      "A genuine Kanjeevaram starts at around ₹8,000, while elaborate bridal pieces with heavy pure gold zari can command prices upwards of ₹5,00,000 or more.",
    ],
    image: blogKanjeeMain,
    imageCaption: "A magnificent deep crimson Kanjeevaram silk saree with heavy gold temple border, displayed alongside traditional jasmine garland on antique wood.",
    pullQuote: "\"A Kanjeevaram saree is not purchased — it is inherited, gifted, or earned. It represents not just wealth, but the cultural memory of an entire civilization.\" — Dr. S. Swaminathan, Textile Historian",
    processImage: blogKanjeeWeave,
    processImageCaption: "Crimson and gold silk threads on the loom during the three-shuttle korvai interlocking process — the signature technique of Kanchipuram.",
    inlineImages: [
      { src: blogKanjeeMotif, caption: "Exquisite peacock and gopuram temple tower motifs woven in gold zari on emerald green Kanjeevaram silk — each design drawn from South Indian temple architecture.", position: "full" },
    ],
  },
  {
    id: "bridal-saree-guide-2026",
    date: "March 22, 2026",
    readTime: "12 min read",
    author: "Athina Bridal Desk",
    category: "Bridal Couture",
    headline: "The Definitive Bridal Saree Guide for 2026: From Kanjeevaram Reds to Pastel Banarasis",
    subheadline: "This season's brides are rewriting tradition with unexpected colour palettes and heritage weaves reimagined for the modern ceremony",
    excerpt: "The Indian bridal saree is undergoing its most exciting transformation in decades. While the classic red Banarasi and the resplendent Kanjeevaram continue to reign supreme, a new wave of brides is embracing unexpected hues — dusty roses, midnight indigos, and even ivory golds — all rendered in the finest handloom traditions.",
    body: [
      "This year's bridal season at Athina Regal Weaves has revealed a fascinating duality in bridal preferences. On one hand, there is a powerful resurgence of deeply traditional choices — heavy kadwa Banarasis in classic maroon and crimson. We've seen a 40% increase in orders for traditional heavy Banarasis compared to last year.",
      "On the other hand, a growing number of contemporary brides are seeking pieces that honour tradition while expressing their individual identity. Soft blush pinks, sage greens, and champagne golds retain all the grandeur of traditional weaving techniques but present them in a modern colour vocabulary.",
      "The concept of 'trousseau building' is also evolving. Many of our clients opt for a 'Heritage Trousseau' — a carefully curated collection spanning different weaving traditions: Kanjeevaram for ceremony, Banarasi for reception, Chanderi for mehendi, Patola for haldi, and tissue for sangeet.",
      "Our bridal consultants recommend starting the saree selection process at least three to four months before the wedding date. Custom pieces with personalized motifs require extensive weaving time. We also offer virtual consultations for brides abroad.",
      "The investment in a bridal Banarasi is not merely a purchase — it is an acquisition of living art. A well-maintained Banarasi silk saree can last for over a century, its colours deepening with age and its gold zari developing a rich patina.",
      "Accessorising the bridal saree has become an art form in itself. For Kanjeevaram brides — classic temple jewellery. For Banarasi brides — Kundan and Polki sets. For modern brides choosing pastel tissue — contemporary minimalist jewellery in rose gold.",
    ],
    image: blogBridalPrep,
    imageCaption: "A bride admires her mehendi as morning light catches the gold of her Kanjeevaram saree — the quiet moments before the ceremony begins.",
    pullQuote: "\"A bridal saree is not just fabric — it is the first chapter of a family's new story, woven with love and blessed with tradition.\"",
    processImage: blogBridalStyled,
    processImageCaption: "The culmination of months of weaving artistry — a bride adorned in red and gold Banarasi with temple jewellery, radiating bridal splendour.",
    inlineImages: [
      { src: blogBridalJewelry, caption: "The art of bridal adornment — an elaborate set of temple jewellery including necklace, jhumkas, maang tikka, and vaddanam, each piece complementing the saree's grandeur.", position: "full" },
    ],
  },
  {
    id: "chanderi-saree-the-sheer-elegance",
    date: "March 18, 2026",
    readTime: "11 min read",
    author: "Athina Style Bureau",
    category: "Fabric Focus",
    headline: "Chanderi Sarees: The Poetry of Sheer Elegance — India's Most Graceful Handloom Tradition",
    subheadline: "From the royal courts of Bundelkhand to modern wardrobes, the luminous Chanderi weave is experiencing an unprecedented renaissance among discerning saree connoisseurs",
    excerpt: "There are textiles that drape, and then there are textiles that float. The Chanderi saree belongs firmly to the latter category — a fabric so gossamer, so luminous, that wearing one feels like being draped in captured moonlight. Originating from the small town of Chanderi in Madhya Pradesh, this 700-year-old weaving tradition produces some of the most ethereally beautiful fabrics in the Indian subcontinent.",
    body: [
      "The origins of Chanderi weaving are intertwined with the cultural history of Central India. The Mughal emperor Babur himself mentioned the fine muslins of Chanderi in his memoirs, describing them as fabrics 'through which the moon could be seen.' This poetic description captures Chanderi's essential quality — its extraordinary sheerness.",
      "What makes Chanderi unique is its distinctive combination of materials: pure silk (the most luxurious), cotton (lighter and breathable), and silk-cotton blend (the classic that offers the best of both worlds). The most prized variant uses a silk warp with a cotton weft.",
      "The hallmark of Chanderi weaving is the 'booti' — delicate, precisely placed decorative elements woven using extra weft threads. The traditional coin motif, floral spray, peacock, and geometric lattice — each floats within the transparent fabric like stars in a clear night sky.",
      "The weaving process is a study in patience. The town's 3,500 weaver families work on traditional pit looms, with each saree taking two days to three weeks. Even slight humidity changes can affect thread tension.",
      "At Athina, we source Chanderi sarees exclusively from master weavers certified by the Chanderi Development Foundation, ensuring authenticity and fair wages. Each piece features the GI-tagged Chanderi hallmark.",
      "Styling a Chanderi offers a world of possibilities. For formal events — rich silk Chanderi in deep jewel tones with contrast brocade blouse. For daytime — lighter cotton-silk blends in pastels with minimal jewellery.",
      "The future of Chanderi weaving is both promising and precarious — growing consumer awareness has created new demand, but competition from power-loom imitations and migration of young weavers remain challenges.",
    ],
    image: blogChanderiDrape,
    imageCaption: "Chanderi silk drapes through an ancient stone arch, sunlight filtering through the gossamer fabric — a textile so sheer it was once described as 'woven moonlight.'",
    pullQuote: "\"Chanderi is not a fabric — it is frozen poetry. Every thread catches the light differently, creating a living canvas that changes with the wearer's every movement.\" — Padma Shri Rashid Ahmed Ansari",
    processImage: blogChanderiLoom,
    processImageCaption: "Delicate threads stretched on a traditional handloom bathed in natural sunlight — where gossamer Chanderi fabric takes shape thread by thread.",
    inlineImages: [
      { src: blogChanderiBooti, caption: "The signature Chanderi booti — tiny golden coin and floral motifs woven into sheer fabric, visible through the translucent silk like constellations.", position: "right" },
    ],
  },
  {
    id: "tissue-organza-revolution",
    date: "March 15, 2026",
    readTime: "10 min read",
    author: "Athina Style Bureau",
    category: "Trend Report",
    headline: "The Tissue & Organza Revolution: Why India's Lightest Sarees Are Having Their Biggest Moment",
    subheadline: "From Bollywood red carpets to South Indian soirées, the ethereal charm of tissue and organza weaves is captivating a new generation of saree connoisseurs",
    excerpt: "There is a quiet revolution happening in the world of Indian textiles. While heavyweight silks have long dominated the luxury saree market, a new category of featherlight weaves is capturing the imagination. Tissue sarees — with their distinctive shimmer and almost weightless drape — have emerged as the most sought-after category in our Spring 2026 collection.",
    body: [
      "The appeal of tissue and organza sarees lies in combining visual opulence with remarkable comfort. Unlike traditional silk sarees weighing 800+ grams, a fine tissue saree typically weighs 300 to 450 grams, making it ideal for extended wear. This lightness does not come at the cost of beauty — tissue weaves catch and reflect light in a way that creates an almost celestial glow.",
      "At Athina, our tissue collection represents the intersection of Banarasi weaving traditions with contemporary textile innovation. Metallic zari threads woven into a sheer base fabric create a translucent effect that is both subtle and spectacular — a saree that appears woven from liquid gold.",
      "The history of tissue weaving dates back to the Mughal era, when court weavers experimented with incorporating metallic threads into the lightest possible base fabrics. The emperors prized these translucent, glittering textiles for their court appearances.",
      "Styling a tissue saree offers endless creative possibilities. Gold tissue with contrast velvet blouse and temple jewellery for formal events. Pastel tissue — mint green or powder blue — with minimal jewellery for daytime celebrations. Perfect for destination weddings.",
      "Our latest collection features an exclusive range of hand-painted organza sarees, where traditional motifs are rendered in watercolour-like washes on sheer organza. Each piece is a unique work of art, signed by the artist.",
      "Care for tissue sarees requires a gentle touch — dry cleaning initially, then gentle hand washing. Always store flat, wrapped in soft muslin cloth. With proper care, these ethereal weaves retain their luminous quality for years.",
    ],
    image: blogTissueFinal,
    imageCaption: "Champagne gold tissue organza draped on marble — the sheer metallic fabric catches light like captured starlight, defining modern Indian elegance.",
    pullQuote: "\"When a woman wears a tissue saree, she doesn't just wear a garment — she wears light itself.\" — Ritu Kumar, Fashion Designer",
    processImage: blogTissueLoom,
    processImageCaption: "Golden metallic zari threads shimmer on the loom as a tissue saree takes form — the translucent fabric catching and refracting light in the artisan's workshop.",
    inlineImages: [
      { src: blogTissuePainting, caption: "An artist's brush applies delicate floral motifs onto sheer organza — each hand-painted tissue saree is a unique watercolour artwork.", position: "left" },
    ],
  },
  {
    id: "patola-double-ikat-masterpiece",
    date: "March 10, 2026",
    readTime: "13 min read",
    author: "Athina Heritage Desk",
    category: "Rare Textiles",
    headline: "Patola Silk: The ₹5 Lakh Saree That Takes Six Months to Weave — Decoding India's Rarest Double Ikat",
    subheadline: "Only three families in all of India still practice the ancient art of Patan Patola weaving, making these geometric masterpieces among the world's most exclusive textiles",
    excerpt: "In the dusty lanes of Patan, Gujarat, one of the world's most extraordinary textile traditions survives by the thinnest of threads. The Patola saree — a double ikat silk of such geometric perfection that it was once believed to possess magical protective powers — is created using a technique so complex that only three Salvi families in the entire world still possess the knowledge to produce it.",
    body: [
      "To understand what makes Patola extraordinary, one must understand 'double ikat' — arguably the most technically demanding weaving technique in existence. BOTH the warp and weft threads are independently resist-dyed with mathematical precision. A misalignment of even a single thread destroys the entire pattern.",
      "Creating a single Patola saree is an exercise in extraordinary patience. The design calculations take weeks, then bundles of threads are tied with wax-resistant bindings and dyed in sequence. A saree with five colours requires five separate dyeing cycles for both warp and weft threads. The actual weaving takes four to six months.",
      "The motifs — 'nari kunj' (dancing girl), 'phool bhat' (flower), 'pan bhat' (pipal leaf), 'ratan chowk' (jewel square) — each carries centuries of cultural significance. Different patterns were historically associated with different communities and occasions.",
      "The cultural significance extends far beyond Gujarat. In Southeast Asia — Indonesia, Malaysia, Philippines — Patola sarees were considered sacred objects imbued with magical protective powers. Indonesian batik still shows clear Patola-derived motifs.",
      "At Athina, we offer a curated selection of authentic Patan Patola, sourced directly from the Salvi families. Fewer than 20 sarees are produced annually by all three families combined — our collection operates on a pre-order basis.",
      "A genuine Patola starts at approximately ₹2,00,000 for simpler designs and can exceed ₹8,00,000 for complex multi-colour patterns. Several 18th-century Patola sarees have sold at international auctions for prices exceeding $50,000.",
      "It is important to distinguish authentic Patan Patola from the more widely available 'Rajkot Patola,' which uses single ikat and power looms. At Athina, we clearly differentiate between the two.",
    ],
    image: blogPatolaFinal,
    imageCaption: "A vibrant Patan Patola silk saree with characteristic double ikat pattern in red and green, hung against a whitewashed Gujarat haveli wall.",
    pullQuote: "\"Our ancestors swore an oath never to teach this art outside our family. We weave Patola not for profit, but because to stop would be to break a sacred trust.\" — Rohit Salvi, Sixth-Generation Patola Weaver",
    processImage: blogPatolaDyeing,
    processImageCaption: "Bundles of silk threads carefully tied and dyed in vibrant hues — the intricate resist-dyeing process where mathematical precision meets centuries-old tradition.",
    inlineImages: [
      { src: blogPatolaWeavers, caption: "A weaver at her loom in Gujarat, carefully interlocking resist-dyed threads to create the precisely symmetrical Patola pattern — a process requiring absolute concentration.", position: "full" },
    ],
  },
  {
    id: "tussar-silk-earths-golden-treasure",
    date: "March 5, 2026",
    readTime: "11 min read",
    author: "Athina Editorial",
    category: "Sustainable Luxury",
    headline: "Tussar Silk: Earth's Golden Treasure — The Wild Silk Revolution Transforming Indian Fashion",
    subheadline: "Harvested from forests rather than farms, Tussar silk represents the perfect marriage of sustainability, tribal craftsmanship, and understated luxury",
    excerpt: "While most Indian silks are cultivated in carefully controlled environments, Tussar silk follows a different path — one that begins in the wild forests of Jharkhand, Chhattisgarh, and Bihar, where silkworms feed on Sal and Arjun tree leaves. Known as 'Kosa' silk, Tussar has a natural golden-beige colour and organic irregularity that makes every piece unique.",
    body: [
      "The production of Tussar silk is fundamentally different from mulberry silk. Tussar silkworms are semi-wild insects feeding on forest trees. The moths are allowed to emerge naturally from cocoons before harvesting, making Tussar inherently more ethical than conventional sericulture.",
      "The natural golden-beige colour comes from tannins in the forest leaves consumed by the silkworms — even undyed Tussar has a depth impossible to replicate artificially. When dyed, it takes on uniquely rich, earthy tones.",
      "The texture of Tussar silk — natural slub irregularities — is what gives it organic beauty. When light falls on a Tussar saree, it scatters in complex ways, creating a subtle play of light and shadow that is endlessly fascinating.",
      "In Jharkhand and Chhattisgarh, Tussar production provides vital livelihood for thousands of tribal families. Semi-cultivation practices on managed forest plots balance conservation with economic sustainability.",
      "At Athina, our Tussar collection is sourced through cooperatives in Bhagalpur and Champa. Our artisans combine the Tussar base with Madhubani-inspired hand painting, Kantha embroidery, or Jamdani-inspired extra weft patterns.",
      "Styling Tussar is a joy — for festive occasions, rich Tussar with zari borders. For casual elegance, Tussar cotton blend with block-printed designs. The natural golden tone complements virtually every skin tone.",
      "The growing interest in Tussar among international fashion circles — Milan, Paris, New York — is heartening for the tribal communities who produce it. At Athina, we see Tussar as the fabric of the future.",
    ],
    image: blogTussarStretch,
    imageCaption: "Golden Tussar silk stretched on a bamboo frame in an open forest setting — the wild silk drying under dappled sunlight before being woven into sarees.",
    pullQuote: "\"Tussar silk does not try to be perfect — and that is precisely what makes it perfect. It carries within its threads the wildness of forests and the golden warmth of the Indian earth.\"",
    processImage: blogTussarCocoons,
    processImageCaption: "Where it all begins — golden Tussar silk cocoons hanging from tree branches in the forests of Jharkhand, where wild silkworms produce India's most sustainable luxury silk.",
    inlineImages: [
      { src: blogTussarPainted, caption: "The finished masterpiece — a golden Tussar silk saree with hand-painted Madhubani-inspired floral motifs in red and black, displayed with autumn leaves.", position: "full" },
    ],
  },
];

/* ═══ Inline image component ═══ */
const InlineImg = ({ img }: { img: InlineImage }) => {
  if (img.position === "full") {
    return (
      <div className="my-6 break-inside-avoid">
        <img src={img.src} alt={img.caption} className="w-full h-[200px] md:h-[260px] object-cover" loading="lazy" width={1024} height={576} style={{ filter: "sepia(12%) contrast(1.04)" }} />
        <p className="font-body text-[9px] md:text-[10px] italic text-foreground/40 mt-1.5 leading-relaxed">{img.caption}</p>
      </div>
    );
  }
  return (
    <div className={`my-4 break-inside-avoid ${img.position === "left" ? "md:float-left md:mr-5 md:mb-3" : "md:float-right md:ml-5 md:mb-3"} md:w-[45%]`}>
      <img src={img.src} alt={img.caption} className="w-full h-[180px] md:h-[220px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(14%) contrast(1.03)" }} />
      <p className="font-body text-[8px] md:text-[9px] italic text-foreground/40 mt-1 leading-relaxed">{img.caption}</p>
    </div>
  );
};

const BlogSection = () => {
  const featuredPost = blogPosts[0];
  const secondaryPosts = blogPosts.slice(1, 3);
  const remainingPosts = blogPosts.slice(3);

  return (
    <section className="bg-ivory-warm relative min-h-screen">
      {/* Newspaper texture overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative luxury-container py-16 md:py-24">
        {/* ═══ VINTAGE NEWSPAPER MASTHEAD ═══ */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[2px] w-16 md:w-32 bg-charcoal/30" />
            <BookOpen size={16} strokeWidth={1.5} className="text-gold" />
            <div className="h-[2px] w-16 md:w-32 bg-charcoal/30" />
          </div>
          <p className="font-body text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold text-gold mb-3">The Athina Chronicle</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-black tracking-tight leading-none text-foreground" style={{ fontVariant: "small-caps" }}>
            Heritage & Style
          </h1>
          <p className="font-body text-sm md:text-base text-foreground/50 mt-3 max-w-2xl mx-auto italic">
            In-depth explorations of India's most magnificent textile traditions — from the looms of Varanasi to the forests of Jharkhand
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 mb-2">
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40">Vol. LXXI</span>
            <span className="text-foreground/20">·</span>
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40">Hyderabad Edition</span>
            <span className="text-foreground/20">·</span>
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/40">Est. 1955</span>
          </div>
        </div>

        <div className="border-t-[3px] border-b border-charcoal/70 py-[2px] mb-10" />

        {/* ═══ FEATURED ARTICLE ═══ */}
        <article className="mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-5">
              <div className="relative">
                <img src={featuredPost.image} alt={featuredPost.imageCaption} className="w-full h-[350px] md:h-[500px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(15%) contrast(1.05)" }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-4">
                  <p className="font-body text-[10px] italic text-ivory/80 leading-relaxed">{featuredPost.imageCaption}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="bg-maroon text-primary-foreground font-body text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1">{featuredPost.category}</span>
                <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Calendar size={10} /> {featuredPost.date}</span>
                <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Clock size={10} /> {featuredPost.readTime}</span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight text-foreground mb-4">
                {featuredPost.headline}
              </h2>

              <p className="font-body text-sm md:text-base italic text-foreground/60 leading-relaxed mb-5 border-l-2 border-gold pl-4">
                {featuredPost.subheadline}
              </p>

              <div className="flex items-center gap-2 mb-5">
                <User size={12} strokeWidth={1.5} className="text-foreground/40" />
                <span className="font-body text-[10px] uppercase tracking-[0.15em] font-bold text-foreground/50">By {featuredPost.author}</span>
              </div>

              <div className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                <span className="float-left font-display text-6xl md:text-7xl font-black text-maroon leading-[0.8] mr-2 mt-1">{featuredPost.excerpt[0]}</span>
                {featuredPost.excerpt.slice(1)}
              </div>

              <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                {featuredPost.body[0]}
              </p>

              {featuredPost.pullQuote && (
                <blockquote className="my-8 py-6 px-6 border-t-2 border-b-2 border-gold/40 bg-cream/50">
                  <p className="font-display text-lg md:text-xl italic text-maroon leading-relaxed text-center">
                    {featuredPost.pullQuote}
                  </p>
                </blockquote>
              )}

              <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85]" style={{ textAlign: "justify" }}>
                {featuredPost.body[1]}
              </p>
            </div>
          </div>

          {/* Process image pair */}
          <div className="mt-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <img src={featuredPost.processImage} alt={featuredPost.processImageCaption} className="w-full h-[240px] md:h-[280px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(15%) contrast(1.05)" }} />
                <div className="absolute top-3 left-3 bg-gold/90 text-charcoal font-body text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1">The Making</div>
              </div>
              <div className="relative">
                <img src={featuredPost.image} alt={featuredPost.imageCaption} className="w-full h-[240px] md:h-[280px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(12%) contrast(1.03)" }} />
                <div className="absolute top-3 left-3 bg-maroon/90 text-primary-foreground font-body text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1">The Artisan</div>
              </div>
            </div>
            <p className="font-body text-[10px] italic text-foreground/40 mt-2 text-center">{featuredPost.processImageCaption}</p>
          </div>

          {/* Continued body with inline images */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-10">
            {featuredPost.body.slice(2).map((para, i) => (
              <div key={i} className="break-inside-avoid">
                {/* Insert inline image after certain paragraphs */}
                {i === 1 && featuredPost.inlineImages[0] && <InlineImg img={featuredPost.inlineImages[0]} />}
                <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                  {para}
                </p>
                {i === 3 && featuredPost.inlineImages[1] && <InlineImg img={featuredPost.inlineImages[1]} />}
              </div>
            ))}
          </div>
        </article>

        <div className="border-t-2 border-b border-charcoal/30 py-[1px] mb-12" />

        {/* ═══ SECONDARY ARTICLES ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x md:divide-charcoal/15 mb-14">
          {secondaryPosts.map((post, index) => (
            <article key={post.id} className={`${index === 0 ? "md:pr-10" : "md:pl-10"} mb-10 md:mb-0`}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-charcoal/10 font-body text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 text-foreground/60">{post.category}</span>
                <span className="font-body text-[10px] text-foreground/40">{post.date}</span>
                <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Clock size={9} /> {post.readTime}</span>
              </div>

              <h2 className="font-display text-xl md:text-2xl font-black leading-[1.15] tracking-tight text-foreground mb-3">
                {post.headline}
              </h2>

              <p className="font-body text-xs italic text-foreground/50 leading-relaxed mb-4">
                {post.subheadline}
              </p>

              <div className="relative mb-4">
                <img src={post.image} alt={post.imageCaption} className="w-full h-[260px] md:h-[300px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(10%) contrast(1.02)" }} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/60 to-transparent p-3">
                  <p className="font-body text-[9px] italic text-ivory/80">{post.imageCaption}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <User size={11} strokeWidth={1.5} className="text-foreground/40" />
                <span className="font-body text-[9px] uppercase tracking-[0.15em] font-bold text-foreground/40">By {post.author}</span>
              </div>

              <div className="font-body text-[13px] text-foreground/65 leading-[1.85] mb-4" style={{ textAlign: "justify" }}>
                <span className="float-left font-display text-5xl font-black text-maroon leading-[0.8] mr-2 mt-1">{post.excerpt[0]}</span>
                {post.excerpt.slice(1)}
              </div>

              {post.body.slice(0, 2).map((para, i) => (
                <p key={i} className="font-body text-[13px] text-foreground/65 leading-[1.85] mb-4" style={{ textAlign: "justify" }}>
                  {para}
                </p>
              ))}

              {/* Process image inline */}
              <div className="my-4">
                <div className="relative">
                  <img src={post.processImage} alt={post.processImageCaption} className="w-full h-[180px] md:h-[200px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(15%) contrast(1.05)" }} />
                  <div className="absolute top-2 left-2 bg-gold/90 text-charcoal font-body text-[7px] uppercase tracking-[0.2em] font-bold px-2 py-0.5">The Making</div>
                </div>
                <p className="font-body text-[9px] italic text-foreground/40 mt-1">{post.processImageCaption}</p>
              </div>

              {post.pullQuote && (
                <blockquote className="my-6 py-4 px-5 border-l-[3px] border-gold/50 bg-cream/40">
                  <p className="font-display text-base italic text-maroon/80 leading-relaxed">
                    {post.pullQuote}
                  </p>
                </blockquote>
              )}

              {post.body.slice(2, 4).map((para, i) => (
                <p key={i} className="font-body text-[13px] text-foreground/65 leading-[1.85] mb-4" style={{ textAlign: "justify" }}>
                  {para}
                </p>
              ))}

              {/* Inline images */}
              {post.inlineImages.map((img, i) => (
                <InlineImg key={i} img={img} />
              ))}

              {post.body.slice(4).map((para, i) => (
                <p key={i} className="font-body text-[13px] text-foreground/65 leading-[1.85] mb-4" style={{ textAlign: "justify" }}>
                  {para}
                </p>
              ))}
            </article>
          ))}
        </div>

        <div className="border-t-2 border-b border-charcoal/30 py-[1px] mb-12" />

        {/* ═══ REMAINING FULL-WIDTH ARTICLES ═══ */}
        {remainingPosts.map((post, postIndex) => (
          <article key={post.id} className="mb-16">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-maroon/90 text-primary-foreground font-body text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1">{post.category}</span>
              <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Calendar size={10} /> {post.date}</span>
              <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Clock size={10} /> {post.readTime}</span>
              <span className="font-body text-[10px] text-foreground/40 flex items-center gap-1"><Bookmark size={10} /> Feature</span>
            </div>

            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-black leading-[1.1] tracking-tight text-foreground mb-3">
              {post.headline}
            </h2>

            <p className="font-body text-sm md:text-base italic text-foreground/55 leading-relaxed mb-4 border-l-2 border-gold pl-4 max-w-3xl">
              {post.subheadline}
            </p>

            <div className="flex items-center gap-2 mb-6">
              <User size={12} strokeWidth={1.5} className="text-foreground/40" />
              <span className="font-body text-[10px] uppercase tracking-[0.15em] font-bold text-foreground/50">By {post.author}</span>
            </div>

            {/* Alternating layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-6">
              <div className={`${postIndex % 2 !== 0 ? "lg:col-span-5 lg:order-2" : "lg:col-span-5"}`}>
                <div className="relative">
                  <img src={post.image} alt={post.imageCaption} className="w-full h-[300px] md:h-[420px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(12%) contrast(1.03)" }} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-4">
                    <p className="font-body text-[10px] italic text-ivory/80 leading-relaxed">{post.imageCaption}</p>
                  </div>
                </div>
              </div>

              <div className={`${postIndex % 2 !== 0 ? "lg:col-span-7 lg:order-1" : "lg:col-span-7"}`}>
                <div className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                  <span className="float-left font-display text-6xl md:text-7xl font-black text-maroon leading-[0.8] mr-2 mt-1">{post.excerpt[0]}</span>
                  {post.excerpt.slice(1)}
                </div>

                <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                  {post.body[0]}
                </p>

                {post.pullQuote && (
                  <blockquote className="my-8 py-6 px-6 border-t-2 border-b-2 border-gold/40 bg-cream/50">
                    <p className="font-display text-base md:text-lg italic text-maroon leading-relaxed text-center">
                      {post.pullQuote}
                    </p>
                  </blockquote>
                )}

                <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85]" style={{ textAlign: "justify" }}>
                  {post.body[1]}
                </p>
              </div>
            </div>

            {/* Process image pair */}
            <div className="my-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <img src={post.processImage} alt={post.processImageCaption} className="w-full h-[220px] md:h-[260px] object-cover" loading="lazy" width={1024} height={768} style={{ filter: "sepia(15%) contrast(1.05)" }} />
                  <div className="absolute top-3 left-3 bg-gold/90 text-charcoal font-body text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1">The Making</div>
                </div>
                <div className="relative">
                  <img src={post.image} alt={post.imageCaption} className="w-full h-[220px] md:h-[260px] object-cover object-center" loading="lazy" width={1024} height={768} style={{ filter: "sepia(10%) contrast(1.03)" }} />
                  <div className="absolute top-3 left-3 bg-maroon/90 text-primary-foreground font-body text-[8px] uppercase tracking-[0.2em] font-bold px-2 py-1">Final Product</div>
                </div>
              </div>
              <p className="font-body text-[10px] italic text-foreground/40 mt-2 text-center">{post.processImageCaption}</p>
            </div>

            {/* Remaining body with inline images */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-10">
              {post.body.slice(2).map((para, i) => (
                <div key={i} className="break-inside-avoid">
                  <p className="font-body text-sm md:text-[15px] text-foreground/70 leading-[1.85] mb-5" style={{ textAlign: "justify" }}>
                    {para}
                  </p>
                  {/* Insert inline image after 2nd paragraph in columns */}
                  {i === 1 && post.inlineImages[0] && <InlineImg img={post.inlineImages[0]} />}
                </div>
              ))}
            </div>

            {postIndex < remainingPosts.length - 1 && (
              <div className="border-t border-charcoal/15 mt-10 flex items-center justify-center">
                <div className="bg-ivory-warm px-6 -mt-3">
                  <div className="flex items-center gap-2 text-gold">
                    <div className="h-[1px] w-8 bg-gold/40" />
                    <BookOpen size={14} strokeWidth={1.5} />
                    <div className="h-[1px] w-8 bg-gold/40" />
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}

        {/* ═══ BOTTOM RULE & CTA ═══ */}
        <div className="border-t-[3px] border-b border-charcoal/70 py-[2px] mt-6 mb-8" />
        <div className="text-center">
          <p className="font-body text-[10px] uppercase tracking-[0.3em] text-foreground/40 mb-4">Continue Exploring Our World of Textiles</p>
          <Link to="/heritage" className="luxury-btn inline-flex items-center gap-3">
            Explore Our Heritage <ArrowRight size={12} strokeWidth={2.5} className="arrow-tilt" />
          </Link>
          <p className="font-body text-xs text-foreground/30 mt-6 italic">
            "In every thread lies a story; in every weave, a civilization." — The Athina Chronicle
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
