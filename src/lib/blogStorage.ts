import { blogPosts, type BlogPost } from "@/data/blogData";

const STORAGE_KEY = "admin_blog_overrides";
const CUSTOM_BLOGS_KEY = "admin_custom_blogs";
const HIDDEN_BLOGS_KEY = "admin_hidden_blogs";

export interface BlogOverride {
  headline?: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readTime?: string;
  author?: string;
  body?: string[];
  image?: string;
  images?: { src: string; caption: string }[];
}

function getOverrides(): Record<number, BlogOverride> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function getCustomBlogs(): BlogPost[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_BLOGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function getHiddenIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_BLOGS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getBlogPosts(): BlogPost[] {
  const overrides = getOverrides();
  const hidden = getHiddenIds();
  const base = blogPosts
    .filter((post) => !hidden.includes(post.id))
    .map((post) => {
      const o = overrides[post.id];
      if (!o) return post;
      return {
        ...post,
        headline: o.headline ?? post.headline,
        excerpt: o.excerpt ?? post.excerpt,
        category: o.category ?? post.category,
        date: o.date ?? post.date,
        readTime: o.readTime ?? post.readTime,
        author: o.author ?? post.author,
        body: o.body ?? post.body,
        image: o.image ?? post.image,
        images: o.images ?? post.images,
      };
    });
  const custom = getCustomBlogs();
  return [...base, ...custom];
}

export function addCustomBlog(post: Omit<BlogPost, "id">): BlogPost {
  const custom = getCustomBlogs();
  const allPosts = [...blogPosts, ...custom];
  const maxId = allPosts.reduce((max, p) => Math.max(max, p.id), 0);
  const newPost: BlogPost = { ...post, id: maxId + 1 } as BlogPost;
  custom.push(newPost);
  localStorage.setItem(CUSTOM_BLOGS_KEY, JSON.stringify(custom));
  return newPost;
}

export function deleteBlog(id: number) {
  if (isCustomBlog(id)) {
    const custom = getCustomBlogs().filter((p) => p.id !== id);
    localStorage.setItem(CUSTOM_BLOGS_KEY, JSON.stringify(custom));
  } else {
    // Hide hardcoded blog
    const hidden = getHiddenIds();
    if (!hidden.includes(id)) {
      hidden.push(id);
      localStorage.setItem(HIDDEN_BLOGS_KEY, JSON.stringify(hidden));
    }
    // Clean up any overrides
    const overrides = getOverrides();
    delete overrides[id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }
}

export function updateCustomBlog(id: number, override: BlogOverride) {
  const custom = getCustomBlogs().map((p) => {
    if (p.id !== id) return p;
    return {
      ...p,
      headline: override.headline ?? p.headline,
      excerpt: override.excerpt ?? p.excerpt,
      category: override.category ?? p.category,
      date: override.date ?? p.date,
      readTime: override.readTime ?? p.readTime,
      author: override.author ?? p.author,
      body: override.body ?? p.body,
      image: override.image ?? p.image,
      images: override.images ?? p.images,
    };
  });
  localStorage.setItem(CUSTOM_BLOGS_KEY, JSON.stringify(custom));
}

export function isCustomBlog(id: number): boolean {
  return getCustomBlogs().some((p) => p.id === id);
}

export function saveBlogOverride(id: number, override: BlogOverride) {
  if (isCustomBlog(id)) {
    updateCustomBlog(id, override);
    return;
  }
  const overrides = getOverrides();
  overrides[id] = { ...overrides[id], ...override };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetBlogOverride(id: number) {
  const overrides = getOverrides();
  delete overrides[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}
