import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <section className="bg-charcoal-mid pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="luxury-container text-center">
          <p className="luxury-caption text-gold mb-4">Legal</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tight">
            Privacy Policy
          </h1>
          <p className="font-body text-sm text-ivory/50 mt-4">Last updated: March 25, 2026</p>
        </div>
      </section>

      <section className="luxury-container py-16 md:py-24 max-w-3xl mx-auto">
        <div className="prose prose-lg font-body text-foreground/80 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">
              At Athina Regal Weaves, we collect information you provide directly to us when you create an account,
              place an order, subscribe to our newsletter, or contact us. This includes:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Personal details: Name, email address, phone number</li>
              <li>Shipping information: Address, city, state, PIN code</li>
              <li>Payment information: Processed securely through Razorpay (we do not store card details)</li>
              <li>Order history and preferences</li>
              <li>Communication records when you contact our support team</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To process and fulfill your orders</li>
              <li>To send order confirmations and shipping updates</li>
              <li>To communicate about our collections and promotions (with your consent)</li>
              <li>To improve our website and customer experience</li>
              <li>To prevent fraud and ensure security</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">3. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Payment processors (Razorpay) to complete transactions</li>
              <li>Shipping partners to deliver your orders</li>
              <li>Service providers who assist in website operations</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures to protect your personal information. All payment
              transactions are encrypted using SSL technology and processed through Razorpay's secure payment gateway.
              We do not store your credit/debit card information on our servers.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">5. Cookies</h2>
            <p className="leading-relaxed">
              Our website uses cookies and similar technologies to enhance your browsing experience, analyze site
              traffic, and personalize content. You can control cookie preferences through your browser settings.
              We use Google Analytics to understand how visitors interact with our website.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
            <p className="leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
            <p className="leading-relaxed">
              For any privacy-related concerns or requests, please contact us at:
            </p>
            <div className="mt-3 p-6 bg-secondary/50 border border-border">
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

export default PrivacyPolicy;
