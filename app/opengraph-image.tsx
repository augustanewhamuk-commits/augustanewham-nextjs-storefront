import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default Open Graph / Twitter card image.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#6b6b6b",
            marginBottom: 28,
          }}
        >
          Staple for your daily wear
        </div>
        <div
          style={{
            fontSize: 88,
            letterSpacing: 16,
            textTransform: "uppercase",
            fontWeight: 300,
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            width: 120,
            height: 1,
            backgroundColor: "#000000",
          }}
        />
        <div
          style={{
            fontSize: 26,
            color: "#6b6b6b",
            marginTop: 40,
            maxWidth: 760,
            textAlign: "center",
          }}
        >
          Crafted in shades that celebrate every skin tone.
        </div>
      </div>
    ),
    { ...size },
  );
}
