import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu, X } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ivory-warm">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile; fixed on lg so it never moves when main scrolls */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — min-h-0 lets overflow-y work inside flex; lg:ml-64 clears fixed sidebar */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden lg:ml-64">
        {/* Mobile header bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-foreground/70 hover:text-foreground transition-colors"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="font-display text-sm font-semibold text-foreground">Admin Panel</span>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
