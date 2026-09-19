import { useParams, Link } from "react-router-dom";
import { getBlogPosts } from "@/lib/blogStorage";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";

const BlogArticle = () => {
  const { slug } = useParams();
  const blogPosts = getBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Article Not Found</h1>
          <Link to="/blog" className="text-gold underline">Back to Blog</Link>
        </div>
      </main>
    );
  }

  // Pick 3 related posts (same category or next in list)
  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);
  if (related.length < 3) {
    const extras = blogPosts.filter((p) => p.id !== post.id && !related.includes(p)).slice(0, 3 - related.length);
    related.push(...extras);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Back */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to The Athina Chronicle
        </Link>
      </div>

      {/* Hero */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">{post.category}</span>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black mt-3 mb-4 leading-tight">{post.headline}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{post.excerpt}</p>
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} read</span>
          </div>
        </div>

        {/* Main image */}
        <div className="mb-10">
          <img src={post.image} alt={post.headline} className="w-full h-[300px] md:h-[450px] object-cover rounded-sm" style={{ filter: "sepia(6%)" }} />
        </div>

        {/* Body with inline images */}
        <div className="max-w-3xl mx-auto">
          {post.body.map((para, i) => (
            <div key={i}>
              <p className="text-base leading-[1.9] mb-6" style={{ textAlign: "justify" }}>
                {i === 0 && <span className="float-left font-display text-6xl font-black text-maroon mr-3 mt-1 leading-[0.8]">{para[0]}</span>}
                {i === 0 ? para.slice(1) : para}
              </p>
              {/* Insert image after every 2 paragraphs */}
              {post.images[Math.floor(i / 2)] && i % 2 === 1 && (
                <figure className="my-8">
                  <img
                    src={post.images[Math.floor(i / 2)].src}
                    alt={post.images[Math.floor(i / 2)].caption}
                    className="w-full h-[250px] md:h-[350px] object-cover rounded-sm"
                    style={{ filter: "sepia(8%)" }}
                    loading="lazy"
                  />
                  <figcaption className="text-[10px] italic text-muted-foreground mt-2 text-center">
                    — {post.images[Math.floor(i / 2)].caption}
                  </figcaption>
                </figure>
              )}
            </div>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="text-center my-12">
          <span className="text-2xl text-gold">✦ ✦ ✦</span>
        </div>

        {/* Related */}
        <div className="border-t border-border/40 pt-10">
          <h2 className="font-display text-xl font-bold mb-6 text-center">Continue Reading</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} to={`/blog/${r.slug}`} className="group block">
                <img src={r.image} alt={r.headline} className="w-full h-[140px] object-cover rounded-sm mb-3 group-hover:scale-[1.02] transition-transform" style={{ filter: "sepia(6%)" }} loading="lazy" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold">{r.category}</span>
                <h3 className="font-display text-sm font-bold mt-1 leading-snug group-hover:text-gold transition-colors line-clamp-2">{r.headline}</h3>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
};

export default BlogArticle;
