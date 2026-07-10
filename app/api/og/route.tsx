import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

/**
 * Branded Open Graph card generated on demand. Pages without a representative
 * photo (legal, FAQ, contact, etc.) point their og:image here with a `title`
 * query param so each share still carries the page name. Mirrors the visual of
 * app/opengraph-image.tsx, with the page title beneath the wordmark.
 *
 * Example: /api/og?title=About%20Us
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "").slice(0, 90);
  const eyebrow =
    (searchParams.get("eyebrow") ?? "Staple for your daily wear").slice(0, 60);

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
          {eyebrow}
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
            marginTop: 44,
            width: 120,
            height: 1,
            backgroundColor: "#000000",
          }}
        />
        {title ? (
          <div
            style={{
              fontSize: 38,
              color: "#1a1a1a",
              marginTop: 40,
              maxWidth: 900,
              textAlign: "center",
              letterSpacing: 2,
            }}
          >
            {title}
          </div>
        ) : null}
      </div>
    ),
    { ...SIZE },
  );
}
