import { fetchDashboardData } from "@/lib/dashboard";
import { buildTrmnlMarkup } from "@/lib/trmnl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TRMNL Preview — SF Dashboard",
};

export const revalidate = 60;

export default async function PreviewPage() {
  const data = await fetchDashboardData();
  const markup = buildTrmnlMarkup(data);
  const escapedMarkup = markup.replace(/"/g, "&quot;");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-neutral-950 p-8">
      <div className="text-center">
        <h1 className="font-mono text-sm font-bold uppercase tracking-widest text-neutral-400">
          TRMNL E-Ink Preview
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-600">
          800 &times; 480 &mdash; TRMNL Framework v3
        </p>
      </div>

      <div className="relative">
        <div className="rounded-2xl bg-neutral-800 p-4 shadow-2xl">
          <div
            className="overflow-hidden rounded-sm"
            style={{ width: 800, height: 480 }}
          >
            <iframe
              srcDoc={`<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 800px;
      height: 480px;
      overflow: hidden;
      background: #fff;
      color: #000;
    }
    body { -webkit-font-smoothing: none; image-rendering: pixelated; }
  </style>
</head>
<body class="screen screen--md">
  ${escapedMarkup}
</body>
</html>`}
              width={800}
              height={480}
              className="border-0"
              title="TRMNL Preview"
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="mb-4 font-mono text-xs text-neutral-600">
          TRMNL X &mdash; 1872 &times; 1404 (scaled 50%)
        </p>
        <div className="rounded-2xl bg-neutral-800 p-4 shadow-2xl">
          <div
            className="overflow-hidden rounded-sm"
            style={{ width: 936, height: 702 }}
          >
            <iframe
              srcDoc={`<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://usetrmnl.com/css/latest/plugins.css" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 1872px;
      height: 1404px;
      overflow: hidden;
      background: #fff;
      color: #000;
      transform: scale(0.5);
      transform-origin: top left;
    }
    body { -webkit-font-smoothing: none; }
  </style>
</head>
<body class="screen screen--lg">
  ${escapedMarkup}
</body>
</html>`}
              width={936}
              height={702}
              className="border-0"
              title="TRMNL X Preview"
            />
          </div>
        </div>
      </div>

      <p className="max-w-md text-center font-mono text-xs text-neutral-700">
        Using TRMNL Framework CSS with screen classes. The actual e-ink display
        renders 1-bit (OG) or 16-shade grayscale (X).
      </p>
    </div>
  );
}
