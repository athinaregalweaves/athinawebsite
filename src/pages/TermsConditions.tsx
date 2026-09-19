import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <main className="bg-background min-h-screen">
      <section className="bg-charcoal-mid pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="luxury-container text-center">
          <p className="luxury-caption text-gold mb-4">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="font-body text-sm text-ivory/50 mt-4">Last updated: March 25, 2026</p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24 max-w-3xl mx-auto">
        <div className="prose prose-lg font-body text-foreground/80 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">1. General</h2>
            <p className="leading-relaxed">
              Welcome to Athina Regal Weaves (athinaregalweaves.in). By accessing or using our website, you agree to
              be bound by these Terms and Conditions. If you do not agree, please do not use our website or services.
              These terms apply to all visitors, users, and customers.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">2. Products &amp; Pricing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All products listed are handloom sarees crafted by skilled artisans</li>
              <li>Prices are listed in Indian Rupees (₹) and include applicable taxes</li>
              <li>Due to the handwoven nature of our sarees, slight variations in color, pattern, and texture are natural and do not constitute defects</li>
              <li>We reserve the right to modify prices without prior notice</li>
              <li>Product images are representative; actual colors may vary slightly due to screen settings</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">3. Orders &amp; Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders are confirmed only after successful payment</li>
              <li>We accept payments through Razorpay, including UPI, credit/debit cards, and net banking</li>
              <li>All transactions are processed in a secure environment</li>
              <li>We reserve the right to cancel orders in case of pricing errors or stock unavailability</li>
              <li>An order confirmation email with your order number will be sent upon successful payment</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">4. User Accounts</h2>
            <p className="leading-relaxed">
              When you create an account, you are responsible for maintaining the confidentiality of your credentials.
              You must provide accurate and complete information. We reserve the right to suspend or terminate accounts
              that violate these terms or are involved in fraudulent activity.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">5. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this website — including text, images, logos, designs, and product photographs — is the
              property of Athina Regal Weaves and is protected by copyright laws. Unauthorized reproduction,
              distribution, or use of any content is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Athina Regal Weaves shall not be liable for any indirect, incidental, or consequential damages arising
              from the use of our website or products. Our total liability shall not exceed the amount paid by you
              for the specific product or service in question.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">7. Governing Law</h2>
            <p className="leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes
              arising from these terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad,
              Telangana.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">8. Contact</h2>
            <div className="p-6 bg-secondary/50 border border-border">
              <p className="font-semibold text-foreground">Athina Regal Weaves</p>
              <p>No. 1299/K, Road No. 66, Beside BSNL Office</p>
              <p>Jubilee Hills, Hyderabad - 500033</p>
              <p className="mt-2">Phone: +91 97019 01999 / 040-3588 9666</p>
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

export default TermsConditions;
