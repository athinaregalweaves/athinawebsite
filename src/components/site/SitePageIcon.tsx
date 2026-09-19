import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  Award,
  Clock,
  Eye,
  Heart,
  Leaf,
  Lock,
  MapPin,
  Palette,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import type { SitePageIconName } from "@/types/sitePages";

const MAP: Record<SitePageIconName, ComponentType<LucideProps>> = {
  Users,
  Leaf,
  Award,
  ShieldCheck,
  Eye,
  Palette,
  Lock,
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
};

type Props = { name: SitePageIconName } & LucideProps;

export function SitePageIcon({ name, ...rest }: Props) {
  const C = MAP[name] ?? Users;
  return <C {...rest} />;
}
