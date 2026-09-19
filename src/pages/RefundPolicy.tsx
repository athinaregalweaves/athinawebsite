import { Link } from "react-router-dom";
import { RotateCcw, Clock, ShieldCheck, Phone } from "lucide-react";

const RefundPolicy = () => {
  return (
    <main className="bg-background min-h-screen">
      <section className="bg-charcoal-mid pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="luxury-container text-center">
          <p className="luxury-caption text-gold mb-4">Policy</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tight">
            Refund &amp; Cancellation
          </h1>
          <p className="font-body text-sm text-ivory/50 mt-4">Last updated: March 25, 2026</p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24 max-w-3xl mx-auto">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {[
            { icon: RotateCcw, title: "7-Day Returns", desc: "Return within 7 days of delivery" },
            { icon: Clock, title: "5-7 Day Refunds", desc: "Refund processed in 5–7 business days" },
            { icon: ShieldCheck, title: "Quality Assured", desc: "Every piece inspected before dispatch" },
            { icon: Phone, title: "Easy Process", desc: "Call or email to initiate returns" },
          ].map((item) => (
            <div key={item.title} className="p-5 border border-border bg-secondary/30 text-center">
              <item.icon size={24} className="mx-auto text-gold mb-3" />
              <h3 className="font-body text-sm font-bold uppercase tracking-wider text-foreground">{item.title}</h3>
              <p className="font-body text-sm text-foreground/60 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-lg font-body text-foreground/80 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders can be cancelled within <strong>24 hours</strong> of placing the order</li>
              <li>Once the order is shipped, cancellation is not possible</li>
              <li>To cancel, contact us with your order number at +91 97019 01999 or info@athinaregalweaves.com</li>
              <li>Cancellation refunds will be processed within 3–5 business days to the original payment method</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Return Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We accept returns within <strong>7 days</strong> of delivery</li>
              <li>The product must be unused, unwashed, and in its original packaging with all tags intact</li>
              <li>Due to the handloom nature, slight variations in color and weave are not eligible for returns</li>
              <li>Customized or altered sarees cannot be returned</li>
              <li>Bridal collection items are non-returnable once altered</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Refund Process</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us via phone (+91 97019 01999) or email (info@athinaregalweaves.com) with your order number and reason for return</li>
              <li>Our team will review and approve the return request within 48 hours</li>
              <li>Ship the product back to our Hyderabad address (shipping costs for returns are borne by the customer unless the product is defective)</li>
              <li>Upon receiving and inspecting the returned item, the refund will be initiated</li>
              <li>Refund will be credited to the original payment method within <strong>5–7 business days</strong></li>
            </ol>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Damaged or Defective Products</h2>
            <p className="leading-relaxed">
              If you receive a damaged or defective product, please contact us within <strong>48 hours</strong> of
              delivery with photographs of the damage. We will arrange a free return pickup and provide a full
              refund or replacement at no additional cost to you.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Non-Refundable Items</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gift cards and vouchers</li>
              <li>Products marked as "Final Sale" or "Non-Returnable"</li>
              <li>Customized or personalized items</li>
              <li>Items not in original condition or missing tags</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Contact for Returns</h2>
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

export default RefundPolicy;
