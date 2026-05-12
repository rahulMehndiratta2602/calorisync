import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Calorisync — AI calorie tracker, photo & voice logging";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f8fafc 0%, #e6f5ec 60%, #d3f0e0 100%)",
          padding: "80px 96px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#4ca36c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "white",
              boxShadow: "0 10px 30px rgba(76,163,108,0.35)",
            }}
          >
            ◐
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#0a0a0a", letterSpacing: -0.5 }}>
            Calorisync
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: "rgba(76,163,108,0.12)",
              color: "#3a7d52",
              fontSize: 18,
              fontWeight: 500,
              marginBottom: 32,
            }}
          >
            Open beta — free during launch
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 88,
              fontWeight: 500,
              color: "#0a0a0a",
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 920,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Log meals in 4 seconds. Photo, voice, or text.
          </div>

          {/* Subhead */}
          <div
            style={{
              marginTop: 32,
              fontSize: 28,
              color: "#404040",
              lineHeight: 1.4,
              maxWidth: 920,
              display: "flex",
            }}
          >
            AI-powered calorie tracker, web-first, no app install.
          </div>

          {/* Footer URL */}
          <div
            style={{
              marginTop: 48,
              fontSize: 20,
              color: "#737373",
              fontFamily: "ui-monospace, SF Mono, monospace",
              display: "flex",
            }}
          >
            calorisync.com
          </div>
        </div>

        {/* Right side decorative dot pattern */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -120,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(76,163,108,0.22) 0%, rgba(76,163,108,0) 70%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
