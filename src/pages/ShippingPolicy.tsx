import { Link } from "react-router-dom";
import { Truck, MapPin, Clock, Package } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <main className="bg-background min-h-screen">
      <section className="bg-charcoal-mid pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="luxury-container text-center">
          <p className="luxury-caption text-gold mb-4">Policy</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tight">
            Shipping Policy
          </h1>
          <p className="font-body text-sm text-ivory/50 mt-4">Last updated: March 25, 2026</p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24 max-w-3xl mx-auto">
        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders above ₹5,000" },
            { icon: Clock, title: "5–7 Days", desc: "Standard delivery" },
            { icon: MapPin, title: "Pan India", desc: "We ship nationwide" },
            { icon: Package, title: "Secure Packing", desc: "Premium packaging" },
          ].map((item) => (
            <div key={item.title} className="p-4 border border-border bg-secondary/30 text-center">
              <item.icon size={22} className="mx-auto text-gold mb-2" />
              <h3 className="font-body text-xs font-bold uppercase tracking-wider text-foreground">{item.title}</h3>
              <p className="font-body text-xs text-foreground/60 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-lg font-body text-foreground/80 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Shipping Coverage</h2>
            <p className="leading-relaxed">
              Athina Regal Weaves ships to all locations within India. We currently do not offer international shipping.
              All orders are dispatched from our Hyderabad atelier.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Delivery Timelines</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-3 border border-border font-bold">Location</th>
                    <th className="text-left p-3 border border-border font-bold">Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-3 border border-border">Hyderabad &amp; Telangana</td><td className="p-3 border border-border">2–3 business days</td></tr>
                  <tr><td className="p-3 border border-border">Metro cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata)</td><td className="p-3 border border-border">3–5 business days</td></tr>
                  <tr><td className="p-3 border border-border">Other cities &amp; towns</td><td className="p-3 border border-border">5–7 business days</td></tr>
                  <tr><td className="p-3 border border-border">Remote/rural areas</td><td className="p-3 border border-border">7–10 business days</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm mt-3 text-foreground/60">
              * Delivery timelines are estimates and may vary due to unforeseen circumstances, weather, or holidays.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Shipping Charges</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Free shipping</strong> on all orders above ₹5,000</li>
              <li>A flat shipping fee of <strong>₹150</strong> applies for orders below ₹5,000</li>
              <li>Express shipping (1–2 days for metros) available at additional cost — contact us for details</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Packaging</h2>
            <p className="leading-relaxed">
              Every saree is carefully folded and placed in premium tissue paper, enclosed in a branded gift box.
              Our packaging ensures your handloom piece arrives in pristine condition. Bridal collection orders
              include complimentary luxury gift packaging.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Order Tracking</h2>
            <p className="leading-relaxed">
              Once your order is shipped, you will receive an email and SMS with the tracking details. You can also
              track your order anytime using your order number on our{" "}
              <Link to="/track-order" className="text-gold hover:underline font-semibold">Track Order</Link> page.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <div className="p-6 bg-secondary/50 border border-border">
              <p className="font-semibold text-foreground">Athina Regal Weaves</p>
              <p>No. 1299/K, Road No. 66, Beside BSNL Office</p>
              <p>Jubilee Hills, Hyderabad - 500033</p>
              <p className="mt-2">Phone: +91 97019 01999</p>
              <p>Email: info@athinaregalweaves.com</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="luxury-btn-maroon inline-block">Back to Home</Link>
        </div>
      </section>
    </main>
  );
};

export default ShippingPolicy;
