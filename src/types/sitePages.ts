/** Lucide icon names used in site page JSON (resolved in SitePageIcon) */
export type SitePageIconName =
  | "Users"
  | "Leaf"
  | "Award"
  | "ShieldCheck"
  | "Eye"
  | "Palette"
  | "Lock"
  | "Star"
  | "MapPin"
  | "Clock"
  | "Phone"
  | "Heart";

export type SitePageKey = "heritage" | "about" | "store" | "contact";

export interface HeritagePageContent {
  hero: {
    imageUrl: string;
    caption: string;
    title: string;
  };
  story: {
    caption: string;
    headingLine1: string;
    headingLine2Italic: string;
    paragraphs: string[];
  };
  timeline: { year: string; event: string }[];
  craftsmanship: {
    imageUrl: string;
    caption: string;
    headingLine1: string;
    headingLine2Italic: string;
    features: { icon: SitePageIconName; title: string; desc: string }[];
  };
  weaving: {
    caption: string;
    headingLine1: string;
    headingLine2Italic: string;
    centers: { loc: string; specialty: string }[];
    sideImageUrl: string;
  };
  cta: {
    title: string;
    body: string;
    primaryPath: string;
    primaryLabel: string;
    secondaryPath: string;
    secondaryLabel: string;
  };
}

export interface StorePageContent {
  hero: {
    imageUrl: string;
    caption: string;
    titleLine1: string;
    titleLine2Italic: string;
  };
  intro: {
    caption: string;
    headingLine1: string;
    headingLine2Italic: string;
    paragraphs: string[];
    sideImageUrl: string;
  };
  services: {
    sectionCaption: string;
    headingLine1: string;
    headingLine2Italic: string;
    items: { icon: SitePageIconName; title: string; desc: string }[];
  };
  details: {
    items: { icon: SitePageIconName; label: string; value: string }[];
  };
  map: {
    sectionCaption: string;
    headingLine1: string;
    headingLine2Italic: string;
    iframeSrc: string;
  };
  cta: {
    title: string;
    body: string;
    bookPath: string;
    bookLabel: string;
    callTel: string;
    callLabel: string;
  };
}

/** Field keys must stay stable for saveContactInquiry */
export type ContactFormFieldKey = "name" | "phone" | "email" | "preferredDate";

export interface AboutPageContent {
  hero: {
    imageUrl: string;
    caption: string;
    title: string;
    subtitle: string;
  };
  story: {
    caption: string;
    headingLine1: string;
    headingLine2Italic: string;
    paragraphs: string[];
    sideImageUrl: string;
  };
  collections: {
    sectionCaption: string;
    headingTitle: string;
    items: { title: string; desc: string }[];
  };
  journey: {
    sectionCaption: string;
    headingTitle: string;
    steps: { step: string; title: string; desc: string }[];
  };
  stats: {
    items: { icon: SitePageIconName; value: string; label: string }[];
  };
  promises: {
    sectionCaption: string;
    headingTitle: string;
    items: { icon: SitePageIconName; title: string; desc: string }[];
  };
  cta: {
    caption: string;
    title: string;
    body: string;
    primaryPath: string;
    primaryLabel: string;
    secondaryPath: string;
    secondaryLabel: string;
  };
}

export interface ContactPageContent {
  header: {
    caption: string;
    title: string;
    body: string;
  };
  form: {
    fields: { key: ContactFormFieldKey; label: string; placeholder: string }[];
    messageLabel: string;
    messagePlaceholder: string;
    submitLabel: string;
  };
  thankYou: {
    caption: string;
    title: string;
    body: string;
  };
  sidebar: {
    mapIframeSrc: string;
    addressHtml: string;
    phones: { href: string; display: string }[];
  };
}

export type SitePageContentMap = {
  heritage: HeritagePageContent;
  about: AboutPageContent;
  store: StorePageContent;
  contact: ContactPageContent;
};
