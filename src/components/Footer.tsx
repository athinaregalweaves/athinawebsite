import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";
import logoFull from "@/assets/logo-full.png";

const Footer = () => {
  return (
    <footer className="bg-charcoal-mid pt-16 pb-[max(5rem,env(safe-area-inset-bottom,0px))] md:py-24">
      <div className="luxury-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="mb-6">
              <img src={logoFull} alt="Athina Regal Weaves" className="h-20 w-auto" />
            </div>
            <p className="font-body text-sm font-medium leading-relaxed text-ivory/50 max-w-xs">
              Heritage handloom sarees crafted for modern royalty. 
              Each piece tells a story of artisanal mastery and timeless elegance.
            </p>
          </div>

          {/* Collections */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-6">Collections</h4>
            <ul className="space-y-3">
              {[
                { label: "Handloom Kora", path: "/collections" },
                { label: "Silk Sarees", path: "/collections" },
                { label: "Bridal Collection", path: "/bridal" },
                { label: "Festive Sarees", path: "/collections" },
                { label: "Limited Edition", path: "/collections" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="font-body text-sm font-medium text-ivory/50 hover:text-ivory transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-6">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About Us", path: "/about" },
                { label: "Our Heritage", path: "/heritage" },
                { label: "Contact Us", path: "/contact" },
                { label: "The Atelier", path: "/store" },
                { label: "Track Order", path: "/track-order" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="font-body text-sm font-medium text-ivory/50 hover:text-ivory transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="md:col-span-2">
            <h4 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-6">Policies</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", path: "/privacy-policy" },
                { label: "Terms & Conditions", path: "/terms-conditions" },
                { label: "Refund & Cancellation", path: "/refund-policy" },
                { label: "Shipping Policy", path: "/shipping-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="font-body text-sm font-medium text-ivory/50 hover:text-ivory transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Visit Us under policies on desktop, separate on mobile */}
            <div className="mt-8">
              <h4 className="font-body text-[10px] uppercase tracking-[0.3em] font-bold text-gold mb-4">Visit Us</h4>
              <div className="font-body text-sm font-medium text-ivory/50 space-y-1">
                <p>No. 1299/K, Road No. 66,</p>
                <p>Beside BSNL Office, Jubilee Hills,</p>
                <p>Hyderabad-500033</p>
                <p className="pt-2 text-ivory/70">+91 97019 01999</p>
                <p className="text-ivory/70">040-3588 9666</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-ivory/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-ivory/30 max-w-prose">
            Athina Regal Weaves &mdash; Handwoven Heritage Since 2009
          </p>
          {/*<div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {["Instagram"].map((social) => (
              <span key={social} className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-ivory/30">
                {social}
              </span>
            ))}
          </div>*/}


          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
           {[
             { name: "Instagram", url: "https://instagram.com/athinaregalweaves", icon: Instagram },
             { name: "Facebook", url: "https://www.facebook.com/61574649460842/", icon: Facebook },
             { name: "YouTube", url: "https://youtube.com/@athinaregalweaves?si=ji57lf24_yQMsdje", icon: Youtube },
            ].map((social) => (
               <a
                 key={social.name}
                 href={social.url}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-ivory/30 hover:text-gold transition"
               >
                 <social.icon size={12} />
                 {social.name}
               </a>
            ))}
          </div>  
        </div>
      </div>
    </footer>
  );
};

export default Footer;
