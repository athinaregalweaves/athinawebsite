import heroImage from "@/assets/hero-saree.jpg";
import craftsmanshipImage from "@/assets/craftsmanship.jpg";
import zariDetailImage from "@/assets/section-zari-detail.jpg";
import storeInterior from "@/assets/store-interior.jpg";
import type {
  AboutPageContent,
  ContactPageContent,
  HeritagePageContent,
  SitePageContentMap,
  StorePageContent,
} from "@/types/sitePages";

export const HERITAGE_PAGE_DEFAULT: HeritagePageContent = {
  hero: {
    imageUrl: heroImage,
    caption: "Since 2009",
    title: "Our Heritage",
  },
  story: {
    caption: "The Athina Regal Weaves Story",
    headingLine1: "Weaving Dreams",
    headingLine2Italic: "Since Three Generations",
    paragraphs: [
      "Founded in 2009 in the culturally rich city of Hyderabad, Athina Regal Weaves began as a humble weaving workshop dedicated to preserving the ancient art of handloom saree making.",
      "For over seven decades, we have remained committed to the principles that define Indian textile excellence: the use of premium natural fibers, time-honored weaving techniques, and an unwavering dedication to quality.",
      "Today, we work with over 200 master artisans across India's most celebrated weaving centers.",
    ],
  },
  timeline: [
    { year: "2009", event: "Founded in Hyderabad" },
    { year: "2010", event: "Expanded to Banarasi silks" },
    { year: "2010", event: "Kanchipuram partnerships" },
    { year: "2024", event: "Digital heritage launch" },
  ],
  craftsmanship: {
    imageUrl: craftsmanshipImage,
    caption: "Our Commitment",
    headingLine1: "Preserving the Art",
    headingLine2Italic: "of Handloom",
    features: [
      {
        icon: "Users",
        title: "Artisan Partnerships",
        desc: "Direct collaboration with weaving communities ensuring fair wages and sustainable livelihoods.",
      },
      {
        icon: "Leaf",
        title: "Natural Fibers",
        desc: "We source only the finest silk, cotton, and blended fibers for authentic luxury.",
      },
      {
        icon: "Award",
        title: "Heritage Techniques",
        desc: "From Jamdani to Kadwa weaving, we preserve techniques that date back centuries.",
      },
      {
        icon: "ShieldCheck",
        title: "Quality Assurance",
        desc: "Every saree undergoes meticulous inspection before earning our seal.",
      },
    ],
  },
  weaving: {
    caption: "Weaving Centers",
    headingLine1: "From Loom",
    headingLine2Italic: "to Legacy",
    centers: [
      { loc: "Varanasi", specialty: "Banarasi Silk & Kora" },
      { loc: "Kanchipuram", specialty: "Pure Silk with Gold Zari" },
      { loc: "Chanderi", specialty: "Silk Cotton & Tissue" },
      { loc: "Bhagalpur", specialty: "Tussar Silk Weaving" },
    ],
    sideImageUrl: zariDetailImage,
  },
  cta: {
    title: "Seven Decades of Excellence",
    body: "Visit our atelier to witness the craftsmanship firsthand and explore our heritage collections.",
    primaryPath: "/store",
    primaryLabel: "Visit Atelier",
    secondaryPath: "/collections",
    secondaryLabel: "Explore Collections",
  },
};

export const STORE_PAGE_DEFAULT: StorePageContent = {
  hero: {
    imageUrl: storeInterior,
    caption: "Jubilee Hills, Hyderabad",
    titleLine1: "The Hyderabad",
    titleLine2Italic: "Atelier",
  },
  intro: {
    caption: "A World Apart",
    headingLine1: "More Than",
    headingLine2Italic: "a Store",
    paragraphs: [
      "Our Hyderabad atelier is a sanctuary for those who appreciate the finer things. Set in the elegant lanes of Jubilee Hills, our space has been designed to offer an immersive experience that honours the art of the saree.",
      "Every visit is curated — from the moment you step in, you're welcomed into a world where heritage meets contemporary luxury, and every drape tells a story.",
    ],
    sideImageUrl: craftsmanshipImage,
  },
  services: {
    sectionCaption: "Our Services",
    headingLine1: "The Atelier",
    headingLine2Italic: "Experience",
    items: [
      {
        icon: "Eye",
        title: "Private Viewing",
        desc: "One-on-one sessions in our luxurious private suites with our finest collections.",
      },
      {
        icon: "Palette",
        title: "Custom Design",
        desc: "Work with our design team for bespoke sarees tailored to your vision.",
      },
      {
        icon: "Lock",
        title: "Exclusive Access",
        desc: "Collections and limited edition pieces available only at the atelier.",
      },
      {
        icon: "Star",
        title: "VIP Treatment",
        desc: "Complimentary refreshments, personal attendant, and styling consultation.",
      },
    ],
  },
  details: {
    items: [
      {
        icon: "MapPin",
        label: "Address",
        value: "No. 1299/K, Road No. 66,\nBeside BSNL Office, Jubilee Hills,\nHyderabad-500033",
      },
      {
        icon: "Clock",
        label: "Hours",
        value: "Monday – Sunday: 10:30 AM – 8:30 PM",
      },
      {
        icon: "Phone",
        label: "Contact",
        value: "+91 97019 01999\n040-3588 9666",
      },
    ],
  },
  map: {
    sectionCaption: "Find Us",
    headingLine1: "Visit Our",
    headingLine2Italic: "Atelier",
    iframeSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.7!2d78.4073!3d17.4285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90c80e3a5c7f%3A0x2b3b4e1f5f6d7e8a!2sRoad%20No.%2066%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },
  cta: {
    title: "Experience It In Person",
    body: "Book a private appointment for an exclusive, personalized saree experience at our Jubilee Hills atelier.",
    bookPath: "/contact",
    bookLabel: "Book Appointment",
    callTel: "+919701901999",
    callLabel: "Call Us",
  },
};

export const ABOUT_PAGE_DEFAULT: AboutPageContent = {
  hero: {
    imageUrl: heroImage,
    caption: "About Us",
    title: "Athina Regal Weaves",
    subtitle: "Heritage handloom sarees crafted for modern royalty since 2009.",
  },
  story: {
    caption: "Our Story",
    headingLine1: "Three Generations of",
    headingLine2Italic: "Handloom Excellence",
    paragraphs: [
      "Athina Regal Weaves was founded in 2009 with a singular vision — to preserve the rich heritage of Indian handloom weaving while making it accessible to the modern connoisseur. What began as a small weaving workshop in Hyderabad has grown into one of South India's most trusted names in luxury handloom sarees.",
      "Today, we work with over 200 master artisans across India, specializing in Banarasi, Kanjivaram, Kora, and silk sarees. Every piece in our collection is handwoven with meticulous attention to detail, using pure zari, organic dyes, and time-honored techniques passed down through generations.",
      "Our atelier in Jubilee Hills, Hyderabad serves as both a showroom and a cultural space where customers can experience the artistry behind every weave. We offer private viewings, bridal consultations, and custom weaving services.",
    ],
    sideImageUrl: craftsmanshipImage,
  },
  collections: {
    sectionCaption: "What We Offer",
    headingTitle: "Our Collections",
    items: [
      {
        title: "Banarasi Sarees",
        desc: "Pure Banarasi silk and Kora sarees with intricate zari work, perfect for weddings and celebrations.",
      },
      {
        title: "Kanjivaram Sarees",
        desc: "Traditional South Indian silk sarees known for their rich texture, vibrant colors, and temple borders.",
      },
      {
        title: "Bridal Collection",
        desc: "Curated bridal sarees with heavy zari, exclusive designs, and luxury packaging for your special day.",
      },
      {
        title: "Linen & Cotton",
        desc: "Lightweight handloom linen and cotton sarees for everyday elegance and comfort.",
      },
      {
        title: "Tissue Sarees",
        desc: "Delicate tissue fabric sarees with subtle shimmer, ideal for festive occasions and parties.",
      },
      {
        title: "Limited Editions",
        desc: "Exclusive, one-of-a-kind pieces featuring rare weaving patterns and heritage motifs.",
      },
    ],
  },
  journey: {
    sectionCaption: "How It Works",
    headingTitle: "Your Shopping Journey",
    steps: [
      { step: "01", title: "Browse", desc: "Explore our curated collections of handloom sarees online" },
      { step: "02", title: "Select", desc: "Choose your favorite saree with detailed images and specifications" },
      { step: "03", title: "Pay Securely", desc: "Complete your purchase through Razorpay (UPI, Cards, Net Banking)" },
      { step: "04", title: "Receive", desc: "Your saree arrives in premium packaging within 5–7 business days" },
    ],
  },
  stats: {
    items: [
      { icon: "Award", value: "10+", label: "Years of Heritage" },
      { icon: "Users", value: "200+", label: "Master Artisans" },
      { icon: "Heart", value: "10,000+", label: "Happy Customers" },
      { icon: "MapPin", value: "3", label: "Experience Centers" },
    ],
  },
  promises: {
    sectionCaption: "Our Promises",
    headingTitle: "Why Choose Athina",
    items: [
      {
        icon: "ShieldCheck",
        title: "100% Authentic Handloom",
        desc: "Every saree comes with a handloom mark and certificate of authenticity.",
      },
      {
        icon: "Leaf",
        title: "Sustainable Craft",
        desc: "We use eco-friendly dyes and support traditional weaving communities.",
      },
      {
        icon: "Heart",
        title: "Artisan Welfare",
        desc: "Fair wages and welfare programs for all our weaving artisans.",
      },
      {
        icon: "Award",
        title: "Premium Quality",
        desc: "Pure zari, finest silk, and meticulous quality checks on every piece.",
      },
      {
        icon: "MapPin",
        title: "Direct from Weavers",
        desc: "No middlemen — directly sourced from artisan clusters across India.",
      },
      {
        icon: "Users",
        title: "Personal Styling",
        desc: "Free bridal consultations and private viewing sessions at our atelier.",
      },
    ],
  },
  cta: {
    caption: "Visit Our Atelier",
    title: "Experience the Art of Handloom",
    body: "Book a private viewing at our Jubilee Hills showroom and discover your perfect saree.",
    primaryPath: "/collections",
    primaryLabel: "Browse Collections",
    secondaryPath: "/contact",
    secondaryLabel: "Book Private Viewing",
  },
};

export const CONTACT_PAGE_DEFAULT: ContactPageContent = {
  header: {
    caption: "Private Appointment",
    title: "Book Your Visit",
    body: "Request a private viewing at our Hyderabad atelier. Our stylists will curate an exclusive experience tailored to your preferences.",
  },
  form: {
    fields: [
      { key: "name", label: "Full Name", placeholder: "Your name" },
      { key: "phone", label: "Phone Number", placeholder: "+91" },
      { key: "email", label: "Email Address", placeholder: "your@email.com" },
      { key: "preferredDate", label: "Preferred Visit Date", placeholder: "" },
    ],
    messageLabel: "Message (Optional)",
    messagePlaceholder: "Tell us about the occasion or your preferences",
    submitLabel: "Request Private Appointment",
  },
  thankYou: {
    caption: "Thank You",
    title: "We have received your request",
    body: "Our team will contact you within 24 hours to confirm your appointment.",
  },
  sidebar: {
    mapIframeSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.7!2d78.4073!3d17.4285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90c80e3a5c7f%3A0x2b3b4e1f5f6d7e8a!2sRoad%20No.%2066%2C%20Jubilee%20Hills%2C%20Hyderabad%2C%20Telangana%20500033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    addressHtml:
      "No. 1299/K, Road No. 66, Beside BSNL Office,<br />Jubilee Hills, Hyderabad-500033",
    phones: [
      { href: "tel:+919701901999", display: "+91 97019 01999" },
      { href: "tel:04035889666", display: "040-3588 9666" },
    ],
  },
};

export const SITE_PAGE_DEFAULTS: SitePageContentMap = {
  heritage: HERITAGE_PAGE_DEFAULT,
  about: ABOUT_PAGE_DEFAULT,
  store: STORE_PAGE_DEFAULT,
  contact: CONTACT_PAGE_DEFAULT,
};
