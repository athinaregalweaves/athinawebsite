import { Link } from "react-router-dom";
import { getBlogPosts } from "@/lib/blogStorage";
import { Clock, ArrowRight } from "lucide-react";

const BlogList = () => {
  const allPosts = getBlogPosts();
  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  return (
    <main className="min-h-screen bg-background">
      {/* Masthead */}
      <div className="border-b-4 border-double border-foreground/30 py-8 text-center">
        <p className="text-xs tracking-[0.5em] uppercase text-muted-foreground mb-2">The</p>
        <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-foreground">Athina Chronicle</h1>
        <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mt-2">Heritage · Craft · Style — 35 Stories of Indian Textiles</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Featured */}
        <Link to={`/blog/${featured.slug}`} className="group block mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="overflow-hidden rounded-sm">
              <img src={featured.image} alt={featured.headline} className="w-full h-[320px] object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: "sepia(8%)" }} loading="eager" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">{featured.category}</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-3 group-hover:text-gold transition-colors leading-tight">{featured.headline}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{featured.date}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{featured.readTime}</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="border-t border-border/50 mb-10" />

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rest.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group block border border-border/40 rounded-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="overflow-hidden">
                <img src={post.image} alt={post.headline} className="w-full h-[180px] object-cover group-hover:scale-105 transition-transform duration-500" style={{ filter: "sepia(6%)" }} loading="lazy" />
              </div>
              <div className="p-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-semibold">{post.category}</span>
                <h3 className="font-display text-sm font-bold mt-1 mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-3">{post.headline}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{post.date}</span>
                  <span className="flex items-center gap-1 text-gold opacity-0 group-hover:opacity-100 transition-opacity">Read <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default BlogList;
