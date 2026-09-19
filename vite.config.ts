import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { cpSync, existsSync, rmSync } from "node:fs";

/** Each production build gets a new ?v= timestamp on icon URLs so browsers fetch the latest favicon. */
function faviconCacheBust(): Plugin {
  return {
    name: "favicon-cache-bust",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (ctx.server) return html;
        const v = Date.now().toString();
        return html
          .replace(/href="\/apple-touch-icon\.png\?v=[^"]+"/g, `href="/apple-touch-icon.png?v=${v}"`)
          .replace(/href="\/favicon\.ico\?v=[^"]+"/g, `href="/favicon.ico?v=${v}"`);
      },
    },
  };
}

/** After each build, replace dist/api entirely from public/api (same as uploading API on Hostinger). */
function replaceDistApiFromPublic(): Plugin {
  return {
    name: "replace-dist-api-from-public",
    closeBundle() {
      const src = path.resolve(__dirname, "public/api");
      const dst = path.resolve(__dirname, "dist/api");
      if (!existsSync(src)) return;
      rmSync(dst, { recursive: true, force: true });
      cpSync(src, dst, { recursive: true });
      // Helpful when checking the build output (migrations also copied via public/ → dist/migrations/)
      console.log("[vite] dist/api copied from public/api (includes api/migrations/ if present).");
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), faviconCacheBust(), replaceDistApiFromPublic()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
