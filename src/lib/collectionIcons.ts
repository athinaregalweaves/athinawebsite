import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Sparkles,
  Leaf,
  Flower2,
  Heart,
  Gem,
  Sun,
  Feather,
  Flame,
  Ribbon,
  FolderOpen,
} from "lucide-react";

/** Stable IDs stored in DB / API (10 options) */
export const COLLECTION_ICON_KEYS = [
  "crown",
  "sparkles",
  "leaf",
  "flower2",
  "heart",
  "gem",
  "sun",
  "feather",
  "flame",
  "ribbon",
] as const;

export type CollectionIconKey = (typeof COLLECTION_ICON_KEYS)[number];

const ICON_MAP: Record<CollectionIconKey, LucideIcon> = {
  crown: Crown,
  sparkles: Sparkles,
  leaf: Leaf,
  flower2: Flower2,
  heart: Heart,
  gem: Gem,
  sun: Sun,
  feather: Feather,
  flame: Flame,
  ribbon: Ribbon,
};

/** Short labels for admin tooltips */
export const COLLECTION_ICON_LABELS: Record<CollectionIconKey, string> = {
  crown: "Crown",
  sparkles: "Sparkles",
  leaf: "Leaf",
  flower2: "Flower",
  heart: "Heart",
  gem: "Gem",
  sun: "Sun",
  feather: "Feather",
  flame: "Flame",
  ribbon: "Ribbon",
};

export function isValidCollectionIconKey(s: string | null | undefined): s is CollectionIconKey {
  return !!s && (COLLECTION_ICON_KEYS as readonly string[]).includes(s);
}

/** Resolve Lucide component for a stored key; unknown/null → folder */
export function getCollectionIconComponent(key: string | null | undefined): LucideIcon {
  if (isValidCollectionIconKey(key)) return ICON_MAP[key];
  return FolderOpen;
}

export const DEFAULT_COLLECTION_ICON_KEY: CollectionIconKey = "sparkles";
