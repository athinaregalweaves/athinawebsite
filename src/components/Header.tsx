import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, ShoppingBag, Package, Heart } from "lucide-react";
import { isCustomerLoggedIn, getStoredCustomer } from "@/lib/customerApi";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import logoNav from "@/assets/logo-full.png";

const navLinks = [
  { label: "Collections", path: "/collections" },
  { label: "Bridal", path: "/bridal" },
  { label: "Heritage", path: "/heritage" },
  { label: "Atelier", path: "/store" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const loggedIn = isCustomerLoggedIn();
  const customer = getStoredCustomer();
  const cartCount = useCart((s) => s.getCount());
  const wishlistCount = useWishlist((s) => s.getCount());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "bg-charcoal shadow-lg" : "bg-charcoal/95 backdrop-blur-md"
      }`}
    >
      <div className="flex w-full min-w-0 max-w-[100vw] items-center justify-between gap-2 sm:gap-4 min-h-[56px] md:min-h-[64px] px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] py-2 md:px-6 lg:px-10 xl:px-14">
        {/* Logo — start of full-width bar */}
        <Link to="/" className="flex min-w-0 shrink-0 items-center">
          <img src={logoNav} alt="Athina Regal Weaves" className="h-9 w-auto sm:h-10 md:h-12" />
        </Link>

        {/* Desktop: single row — nav + utilities + CTA aligned to the right */}
        <div className="hidden md:flex min-w-0 flex-1 items-center justify-end gap-3 lg:gap-5 xl:gap-6">
          <nav className="flex flex-nowrap items-center justify-end gap-x-2 lg:gap-x-3 xl:gap-x-5 min-w-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative shrink-0 whitespace-nowrap px-1.5 lg:px-2 py-1.5 font-body text-[10px] md:text-[11px] lg:text-xs font-extrabold uppercase tracking-[0.1em] lg:tracking-[0.14em] transition-colors duration-300 ${
                  location.pathname === link.path ? "text-gold" : "text-ivory hover:text-gold"
                }`}
              >
                {link.label}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 lg:left-2 lg:right-2 h-[2px] bg-gold" />
                )}
              </Link>
            ))}
          </nav>

          <span className="h-5 w-px shrink-0 bg-gold/30" aria-hidden />

          <div className="flex shrink-0 items-center gap-2 lg:gap-3">
            <Link
              to="/wishlist"
              className="relative rounded-sm p-1.5 text-ivory transition-colors hover:bg-ivory/5 hover:text-gold"
              aria-label="Wishlist"
            >
              <Heart size={19} strokeWidth={1.75} />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-maroon text-[9px] font-bold text-ivory">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative rounded-sm p-1.5 text-ivory transition-colors hover:bg-ivory/5 hover:text-gold"
              aria-label="Cart"
            >
              <ShoppingBag size={19} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-charcoal">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Link
              to="/track-order"
              className="inline-flex items-center gap-1.5 px-1 py-1 font-body text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.12em] text-ivory transition-colors hover:text-gold"
              title="Track your order"
            >
              <Package size={16} strokeWidth={2} />
              <span className="whitespace-nowrap">Track</span>
            </Link>
            {loggedIn ? (
              <Link
                to="/profile"
                className="flex max-w-[88px] lg:max-w-[110px] items-center gap-1.5 px-1 py-1 font-body text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.1em] text-ivory transition-colors hover:text-gold xl:max-w-[130px]"
              >
                <User size={15} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{customer?.name?.split(" ")[0] || "Profile"}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-1 py-1 font-body text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.1em] text-ivory transition-colors hover:text-gold"
              >
                <User size={15} strokeWidth={2} />
                <span className="whitespace-nowrap">Sign In</span>
              </Link>
            )}
          </div>

          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap bg-gold px-4 py-2 font-body text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-charcoal transition-colors duration-300 hover:bg-gold-light lg:px-5 lg:text-[11px] lg:tracking-[0.2em]"
          >
            Book Visit
          </Link>
        </div>

        {/* Mobile: icons + menu — even spacing, aligned to end */}
        <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:hidden">
          <Link to="/wishlist" className="relative -mr-0.5 rounded-md p-2 text-ivory active:bg-ivory/10 hover:text-gold" aria-label="Wishlist">
            <Heart size={21} strokeWidth={1.75} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-maroon px-0.5 text-[9px] font-bold text-ivory">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative -mr-0.5 rounded-md p-2 text-ivory active:bg-ivory/10 hover:text-gold" aria-label="Cart">
            <ShoppingBag size={21} strokeWidth={1.75} />
            {cartCount > 0 && (
              <span className="absolute right-0.5 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold px-0.5 text-[9px] font-bold text-charcoal">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-0.5 rounded-md p-2 text-ivory transition-colors hover:text-gold active:bg-ivory/10"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden max-h-[min(70vh,calc(100dvh-3.5rem))] overflow-y-auto overscroll-contain border-t border-gold/20 bg-charcoal-mid animate-fade-in-slow">
          <nav className="mx-auto w-full max-w-7xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                className={`py-3 font-body text-sm font-bold uppercase tracking-[0.2em] transition-colors ${
                  location.pathname === link.path ? "text-gold" : "text-ivory hover:text-gold"
                }`}>
                {link.label}
              </Link>
            ))}
            <div className="h-[2px] bg-gold/20 my-3" />
            <Link to="/wishlist" onClick={() => setIsOpen(false)}
              className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-ivory hover:text-gold flex items-center gap-2">
              <Heart size={16} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </Link>
            <Link to="/track-order" onClick={() => setIsOpen(false)}
              className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-ivory hover:text-gold flex items-center gap-2">
              <Package size={16} /> Track Order
            </Link>
            <Link to="/cart" onClick={() => setIsOpen(false)}
              className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-ivory hover:text-gold flex items-center gap-2">
              <ShoppingBag size={16} /> Bag {cartCount > 0 && `(${cartCount})`}
            </Link>
            {loggedIn ? (
              <Link to="/profile" onClick={() => setIsOpen(false)}
                className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-gold flex items-center gap-2">
                <User size={16} /> My Profile
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}
                className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-gold flex items-center gap-2">
                <User size={16} /> Sign In
              </Link>
            )}
            <Link to="/contact" onClick={() => setIsOpen(false)}
              className="py-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-ivory hover:text-gold">
              Book Appointment
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
