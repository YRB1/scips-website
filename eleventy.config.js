import { HtmlBasePlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import { readFileSync } from "node:fs";
import markdownItAnchor from "markdown-it-anchor";
import { buildDuotones } from "./scripts/duotone.js";

const photos = JSON.parse(readFileSync("src/_data/photos.json", "utf8"));

/**
 * Responsive image from the photo library in src/_data/photos.json.
 * Generates AVIF/WebP/JPEG at several widths and returns a <picture>.
 */
async function picture(id, sizes = "100vw", { loading = "lazy", className = "", widths = [480, 800, 1024], colour = false } = {}) {
  const p = photos[id];
  if (!p) throw new Error(`Unknown photo id: ${id}`);
  const src = colour ? p.src : `.cache/duotone/${id}.jpg`;
  const meta = await Image(src, {
    widths: [...widths, "auto"],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "_site/assets/img/",
    urlPath: "/assets/img/",
    sharpJpegOptions: { quality: 78, mozjpeg: true },
    sharpWebpOptions: { quality: 74 },
    sharpAvifOptions: { quality: 52 },
  });
  return Image.generateHTML(meta, {
    alt: p.alt,
    sizes,
    loading,
    decoding: "async",
    ...(className ? { class: className } : {}),
    ...(loading === "eager" ? { fetchpriority: "high" } : {}),
  });
}

function credit(id) {
  const p = photos[id];
  return `${p.place}. Photo: <a href="${p.link}">${p.author}</a>, <a href="${p.licenceUrl}">${p.licence}</a>`;
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", buildDuotones);

  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/assets/roofline.svg": "assets/roofline.svg" });
  eleventyConfig.addPassthroughCopy({ "src/static/.nojekyll": ".nojekyll" });

  eleventyConfig.addShortcode("picture", picture);
  eleventyConfig.addShortcode("credit", credit);
  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  eleventyConfig.addFilter("isCurrent", (navUrl, pageUrl) =>
    navUrl === "/" ? pageUrl === "/" : pageUrl.startsWith(navUrl)
  );

  // Headings get stable ids so guides can have a contents list
  eleventyConfig.amendLibrary("md", (md) => md.use(markdownItAnchor, { level: [2], tabIndex: false }));

  /** Extract <h2 id="..."> headings from rendered HTML for a contents list */
  eleventyConfig.addFilter("toc", (html = "") =>
    [...html.matchAll(/<h2 id="([^"]+)"[^>]*>(.*?)<\/h2>/g)].map(([, id, text]) => ({
      id,
      text: text.replace(/<[^>]+>/g, ""),
    }))
  );

  eleventyConfig.addCollection("sitemap", (api) =>
    api.getAll().filter((p) => p.url && !p.url.endsWith(".xml") && !p.url.endsWith(".txt") && p.url !== "/404.html")
  );

  eleventyConfig.addPassthroughCopy({ "src/assets/og.png": "assets/og.png" });
  eleventyConfig.addPassthroughCopy({ "src/assets/apple-touch-icon.png": "apple-touch-icon.png", "src/assets/icon-512.png": "assets/icon-512.png" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/leaflet/dist/leaflet.js": "assets/vendor/leaflet/leaflet.js",
    "node_modules/leaflet/dist/leaflet.css": "assets/vendor/leaflet/leaflet.css",
  });
  eleventyConfig.addPassthroughCopy({ "src/assets/map-office.webp": "assets/map-office.webp", "src/assets/map-office.jpg": "assets/map-office.jpg" });

  eleventyConfig.addWatchTarget("src/assets/");

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    // Served from yrb1.github.io/scips-website/ during the pitch.
    // Set PATH_PREFIX=/ when it moves to scips.org.uk.
    pathPrefix: process.env.PATH_PREFIX ?? "/scips-website/",
  };
}
