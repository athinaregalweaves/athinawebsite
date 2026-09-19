"""Generate Athina Regal Weaves tech stack PDF."""

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = Path(__file__).resolve().parent.parent / "TechStack.pdf"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#1a1a2e"),
            spaceAfter=6,
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            name="DocSubtitle",
            parent=styles["Normal"],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#555555"),
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionHeading",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#16213e"),
            spaceBefore=14,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyTextCustom",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#333333"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletItem",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            leftIndent=14,
            bulletIndent=0,
            textColor=colors.HexColor("#333333"),
            spaceAfter=3,
        )
    )
    return styles


def make_table(rows, col_widths):
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#16213e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 10),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 9),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f4f6f8")]),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d0d7de")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def main():
    styles = build_styles()
    story = []

    story.append(Paragraph("Athina Regal Weaves", styles["DocTitle"]))
    story.append(Paragraph("Technology Stack Overview", styles["DocTitle"]))
    story.append(
        Paragraph(
            f"Project: Athina Regal Weaves E-commerce &amp; CMS<br/>"
            f"Live site: https://athinaregalweaves.com<br/>"
            f"Generated: {date.today().strftime('%B %d, %Y')}",
            styles["DocSubtitle"],
        )
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#16213e")))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("1. Frontend", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "The customer-facing storefront and admin CMS are built as a single-page application (SPA) "
            "compiled to static assets and served from the web host.",
            styles["BodyTextCustom"],
        )
    )
    frontend_rows = [
        ["Category", "Technology", "Purpose"],
        ["Core framework", "React 18", "UI component library and rendering"],
        ["Language", "TypeScript", "Type-safe frontend code"],
        ["Build tool", "Vite 5", "Dev server, bundling, and production build"],
        ["Styling", "Tailwind CSS 3", "Utility-first CSS framework"],
        ["UI components", "shadcn/ui (Radix UI)", "Accessible, reusable UI primitives"],
        ["Icons", "Lucide React", "Icon set across storefront and admin"],
        ["Routing", "React Router DOM v6", "Client-side navigation (store + admin routes)"],
        ["Forms", "React Hook Form + Zod", "Form handling and schema validation"],
        ["Server state", "TanStack React Query v5", "API data fetching and caching"],
        ["Client state", "Zustand", "Lightweight global/client state"],
        ["Persistence", "localStorage / sessionStorage", "Cart, wishlist, auth tokens, UI prefs"],
        ["Charts", "Recharts", "Admin dashboard visualizations"],
        ["Excel export", "SheetJS (xlsx)", "Spreadsheet export in admin"],
        ["Notifications", "Sonner", "Toast notifications"],
        ["Testing", "Vitest + Testing Library", "Unit and component tests"],
    ]
    story.append(make_table(frontend_rows, [4.2 * cm, 4.8 * cm, 7.5 * cm]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Build command:</b> npm run build → output folder: dist/", styles["BodyTextCustom"]))

    story.append(Paragraph("2. Backend", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "The backend is a REST-style PHP API. Each resource is exposed as a separate PHP endpoint "
            "under the /api directory. There is no Node.js or separate application server.",
            styles["BodyTextCustom"],
        )
    )
    backend_rows = [
        ["Category", "Technology", "Details"],
        ["Runtime", "PHP", "Runs on Hostinger shared hosting (Apache)"],
        ["Architecture", "REST-style endpoints", "One PHP file per resource (products.php, orders.php, etc.)"],
        ["Database access", "PDO (PHP Data Objects)", "Prepared statements, MySQL connection"],
        ["Auth", "Bearer tokens", "Admin and customer session tokens with expiry"],
        ["File uploads", "upload.php", "Images stored in /uploads/ (max 50 MB)"],
        ["CORS", "db.php headers", "JSON API accessible from frontend origin"],
        ["Payments", "Razorpay", "Checkout payment gateway integration"],
        ["Email", "PHP mail / Hostinger SMTP", "Order and contact notifications"],
    ]
    story.append(make_table(backend_rows, [4.2 * cm, 4.8 * cm, 7.5 * cm]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Key API endpoints:</b>", styles["BodyTextCustom"]))
    api_endpoints = [
        "auth.php — Admin login, verify, logout",
        "products.php — Product CRUD and listing",
        "collections.php — Collection metadata and assignments",
        "sections.php — Homepage section CMS",
        "page_content.php — Editable site pages",
        "orders.php — Order management and emails",
        "customer-auth.php — Customer register, OTP, login",
        "upload.php — Image uploads",
        "contacts.php — Contact form inquiries",
        "reviews.php — Product reviews",
        "blogs.php — Blog CMS",
        "history.php — Admin edit history",
    ]
    for item in api_endpoints:
        story.append(Paragraph(f"• {item}", styles["BulletItem"]))

    story.append(Paragraph("3. Database", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "All persistent data is stored in MySQL on Hostinger. The frontend never connects directly "
            "to the database; all access goes through the PHP API.",
            styles["BodyTextCustom"],
        )
    )
    db_rows = [
        ["Category", "Technology", "Details"],
        ["Database engine", "MySQL", "Relational database on Hostinger"],
        ["Management UI", "phpMyAdmin", "Via Hostinger hPanel → Databases"],
        ["Connection", "PDO over localhost", "Credentials in api/config.php on server"],
        ["Schema reference", "public/api/database.sql", "Base schema and seed data"],
        ["Charset", "utf8mb4", "Full Unicode support (e.g. product names)"],
    ]
    story.append(make_table(db_rows, [4.2 * cm, 4.8 * cm, 7.5 * cm]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Core database tables:</b>", styles["BodyTextCustom"]))
    db_tables = [
        "admin_users — Admin accounts and tokens",
        "admin_products — Product catalog (images, price, category, fabric)",
        "homepage_sections — Hero, bridal, tissue, linen, bestseller sections",
        "collection_meta / collection_assignments — Collection display and product mapping",
        "customers — Customer accounts and OTP auth",
        "orders / order_items — Checkout and order line items",
        "contact_inquiries — Contact form submissions",
        "site_page_content — Editable pages (About, Heritage, etc.)",
        "blogs — Blog posts",
        "edit_history — Admin change audit log",
    ]
    for item in db_tables:
        story.append(Paragraph(f"• {item}", styles["BulletItem"]))

    story.append(Paragraph("4. Hosting &amp; Deployment", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "The entire application is hosted on Hostinger. The frontend is static files; the backend "
            "is PHP; the database is MySQL — all on the same Hostinger account.",
            styles["BodyTextCustom"],
        )
    )
    hosting_rows = [
        ["Category", "Technology", "Details"],
        ["Hosting provider", "Hostinger", "Shared web hosting with hPanel"],
        ["Web server", "Apache", "mod_rewrite for SPA routing (.htaccess)"],
        ["Frontend deploy", "Static files in public_html", "Upload contents of dist/ after npm run build"],
        ["Backend deploy", "PHP in /api/", "Sync public/api/ to live /api/ on server"],
        ["Media storage", "/uploads/ directory", "Writable folder for product and collection images"],
        ["Domain", "athinaregalweaves.com", "Production storefront and admin"],
        ["SSL", "Hostinger HTTPS", "HTTPS enabled on production domain"],
        ["Config", "api/config.php + secrets.local.php", "DB credentials and Razorpay keys on server"],
    ]
    story.append(make_table(hosting_rows, [4.2 * cm, 4.8 * cm, 7.5 * cm]))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Deployment steps:</b>", styles["BodyTextCustom"]))
    deploy_steps = [
        "Edit src/ (frontend) and/or public/api/ (backend)",
        "Run npm run build to produce dist/",
        "Upload dist/ contents to Hostinger public_html",
        "Ensure /api/*.php, config.php, and /uploads/ exist and are correct on server",
        "Hard-refresh or clear CDN cache if assets 404 after deploy",
    ]
    for i, step in enumerate(deploy_steps, 1):
        story.append(Paragraph(f"{i}. {step}", styles["BulletItem"]))

    story.append(Paragraph("5. Architecture Summary", styles["SectionHeading"]))
    story.append(
        Paragraph(
            "<b>Browser</b> → React SPA (Vite build) → HTTP/JSON → PHP API (/api/*.php) → "
            "PDO → MySQL (Hostinger). Payments flow through Razorpay from the checkout page.",
            styles["BodyTextCustom"],
        )
    )
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("<b>Not used in this project:</b>", styles["BodyTextCustom"]))
    not_used = [
        "Next.js, Node.js API server, Firebase, Supabase",
        "Direct browser-to-MySQL connection",
        "Docker / Kubernetes / cloud PaaS (Vercel, Netlify, AWS)",
    ]
    for item in not_used:
        story.append(Paragraph(f"• {item}", styles["BulletItem"]))

    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cccccc")))
    story.append(
        Paragraph(
            "Document generated from project source (package.json, README, KT.md, public/api/).",
            ParagraphStyle(
                name="Footer",
                parent=styles["Normal"],
                fontSize=8,
                textColor=colors.HexColor("#888888"),
                alignment=TA_CENTER,
                spaceBefore=8,
            ),
        )
    )

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title="Athina Regal Weaves - Technology Stack",
        author="Athina Regal Weaves",
    )
    doc.build(story)
    print(f"PDF created: {OUTPUT}")


if __name__ == "__main__":
    main()
