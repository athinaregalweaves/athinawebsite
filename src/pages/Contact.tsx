import { useState } from "react";
import { saveContactInquiry } from "@/lib/contactStorage";
import { CONTACT_PAGE_DEFAULT } from "@/data/sitePageContentDefaults";
import { useSitePageContent } from "@/hooks/useSitePageContent";
import type { ContactFormFieldKey } from "@/types/sitePages";

function fieldInputType(key: ContactFormFieldKey): string {
  if (key === "email") return "email";
  if (key === "phone") return "tel";
  if (key === "preferredDate") return "date";
  return "text";
}

const Contact = () => {
  const { content: c } = useSitePageContent("contact", CONTACT_PAGE_DEFAULT);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDate: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveContactInquiry(formData);
    setSubmitted(true);
  };

  return (
    <main className="pt-24 md:pt-28">
      {/* Header */}
      <section className="luxury-container py-16 md:py-24 text-center">
        <p className="luxury-caption text-gold mb-4">{c.header.caption}</p>
        <h1 className="luxury-heading">{c.header.title}</h1>
        <div className="luxury-divider" />
        <p className="luxury-body text-muted-foreground max-w-2xl mx-auto">{c.header.body}</p>
      </section>

      <section className="luxury-container pb-20 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="text-center py-20">
                <p className="luxury-caption text-gold mb-4">{c.thankYou.caption}</p>
                <h2 className="luxury-subheading mb-4">{c.thankYou.title}</h2>
                <p className="luxury-body text-muted-foreground">{c.thankYou.body}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {c.form.fields.map((field) => (
                  <div key={field.key}>
                    <label className="luxury-caption block mb-3">{field.label}</label>
                    <input
                      type={fieldInputType(field.key)}
                      placeholder={field.placeholder}
                      required
                      value={formData[field.key]}
                      onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full bg-transparent border-b border-border py-3 font-body text-base font-light tracking-wide focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="luxury-caption block mb-3">{c.form.messageLabel}</label>
                  <textarea
                    placeholder={c.form.messagePlaceholder}
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border-b border-border py-3 font-body text-base font-light tracking-wide focus:outline-none focus:border-gold transition-colors resize-none"
                  />
                </div>
                <button type="submit" className="luxury-btn w-full text-center">
                  {c.form.submitLabel}
                </button>
              </form>
            )}
          </div>

          {/* Right side - Map & Details */}
          <div className="space-y-8">
            <div className="w-full h-[300px] lg:h-[350px] border border-border overflow-hidden">
              <iframe
                src={c.sidebar.mapIframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Athina Regal Weaves Location"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="luxury-caption text-gold mb-2">Address</p>
                <p
                  className="font-body text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: c.sidebar.addressHtml }}
                />
              </div>
              <div>
                <p className="luxury-caption text-gold mb-2">Contact</p>
                <p className="font-body text-sm text-muted-foreground">
                  {c.sidebar.phones.map((ph, i) => (
                    <span key={`${ph.href}-${i}`}>
                      <a href={ph.href} className="hover:text-foreground transition-colors">
                        {ph.display}
                      </a>
                      {i < c.sidebar.phones.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
