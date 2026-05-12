import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calorisync — AI calorie tracker",
    short_name: "Calorisync",
    description: "Log meals in 4 seconds. Photo, voice, or text — AI handles macros.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: "#0a0a0a",
    background_color: "#ffffff",
    categories: ["health", "fitness", "lifestyle", "food", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
