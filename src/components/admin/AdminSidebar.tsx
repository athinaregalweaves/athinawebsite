import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Image, ShoppingBag, Crown, ClipboardList, LogOut, Clock, Sparkles, Leaf, MessageSquare, BookOpen, Users, Star, Globe } from "lucide-react";
import { logoutAdmin } from "@/lib/api";
import logoFull from "@/assets/logo-full.png";
import { fetchCollectionDefinitions, type CollectionDefinition } from "@/lib/collectionAssignments";
import { getCollectionIconComponent } from "@/lib/collectionIcons";

const NAV_TOP = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Orders", url: "/admin/orders", icon: ClipboardList },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Site pages", url: "/admin/site-pages", icon: Globe },
  { title: "Hero Sections", url: "/admin/sections", icon: Image },
  { title: "Collections", url: "/admin/collections", icon: ShoppingBag },
  { title: "Bridal Collection", url: "/admin/bridal", icon: Crown },
  { title: "Tissue Collection", url: "/admin/tissue", icon: Sparkles },
  { title: "Linen Collection", url: "/admin/linen", icon: Leaf },
];

const NAV_BOTTOM = [
  { title: "Blog", url: "/admin/blog", icon: BookOpen },
  { title: "Edit History", url: "/admin/history", icon: Clock },
];

interface AdminSidebarProps {
  onNavigate?: () => void;
}

const AdminSidebar = ({ onNavigate }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customCollections, setCustomCollections] = useState<CollectionDefinition[]>([]);

  useEffect(() => {
    fetchCollectionDefinitions().then(setCustomCollections).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <aside className="w-64 h-screen bg-background border-r border-border flex flex-col shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <img src={logoFull} alt="Athina Regal Weaves" className="h-10 w-auto" />
        <p className="font-body text-xs text-foreground/40 mt-2">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {NAV_TOP.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${
                isActive
                  ? "bg-maroon/10 text-maroon border-l-3 border-maroon"
                  : "text-foreground/60 hover:text-foreground hover:bg-ivory-warm"
              }`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.title}</span>
            </Link>
          );
        })}
        {customCollections.length > 0 && (
          <div className="pt-2 pb-1 px-4">
            <p className="font-body text-[10px] uppercase tracking-wider text-foreground/35">Custom collections</p>
          </div>
        )}
        {customCollections.map((c) => {
          const url = `/admin/collection/${encodeURIComponent(c.collection_key)}`;
          const isActive = location.pathname === url;
          const CollIcon = getCollectionIconComponent(c.icon_key);
          return (
            <Link
              key={c.collection_key}
              to={url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${
                isActive
                  ? "bg-maroon/10 text-maroon border-l-3 border-maroon"
                  : "text-foreground/60 hover:text-foreground hover:bg-ivory-warm"
              }`}
            >
              <CollIcon size={20} strokeWidth={1.5} />
              <span className="truncate">{c.display_name}</span>
            </Link>
          );
        })}
        {NAV_BOTTOM.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 font-body text-sm font-medium transition-colors ${
                isActive
                  ? "bg-maroon/10 text-maroon border-l-3 border-maroon"
                  : "text-foreground/60 hover:text-foreground hover:bg-ivory-warm"
              }`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full font-body text-sm font-medium text-foreground/50 hover:text-destructive transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
