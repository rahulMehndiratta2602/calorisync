import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { publicEnv } from "@/lib/env";
import landing from "@/content/landing.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const SITE = publicEnv.SITE_URL;
const seo = landing.seo;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: seo.title,
    template: "%s — Calorisync",
  },
  description: seo.description,
  keywords: seo.keywords,
  authors: [{ name: "Calorisync" }],
  creator: "Calorisync",
  publisher: "Calorisync",
  applicationName: "Calorisync",
  category: "Health & Fitness",
  alternates: {
    canonical: SITE,
  },
  openGraph: {
    type: "website",
    title: seo.og_title,
    description: seo.og_description,
    url: SITE,
    siteName: "Calorisync",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Calorisync — AI calorie tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.og_title,
    description: seo.og_description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(landing.structured_data),
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              className:
                "rounded-xl border border-border bg-card text-card-foreground shadow-lg",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
