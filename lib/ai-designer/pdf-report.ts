import "server-only";

import type { KitchenDesignJob } from "./types";
import { requiredEnv } from "./env";

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildReportHtml(job: KitchenDesignJob): string {
  const colors = job.color_palette.join(", ");
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>DC Joinery AI Kitchen Concept</title>
      <style>
        body { font-family: Inter, Arial, sans-serif; color: #111; margin: 32px; line-height: 1.5; }
        .brand { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
        .sub { color: #444; margin-bottom: 24px; }
        .section { margin-bottom: 24px; }
        .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.06em; }
        .value { font-size: 16px; font-weight: 600; margin-top: 4px; }
        .card { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
        img { width: 100%; border-radius: 12px; border: 1px solid #ddd; margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="brand">DC Joinery - AI Kitchen Designer</div>
      <div class="sub">Concept report for lead qualification and consultation.</div>
      <div class="section card">
        <div class="label">Style</div>
        <div class="value">${escapeHtml(job.style)}</div>
        <div class="label" style="margin-top: 12px;">Color palette</div>
        <div class="value">${escapeHtml(colors)}</div>
        <div class="label" style="margin-top: 12px;">Supplier selections</div>
        <div class="value">${escapeHtml(job.customer_notes ?? "Not provided")}</div>
      </div>
      <div class="section card">
        <div class="label">Professional concept description</div>
        <p>${escapeHtml(job.project_description ?? "No description generated.")}</p>
      </div>
      ${
        job.generated_image_url
          ? `<div class="section card"><div class="label">Generated visual concept</div><img src="${escapeHtml(
              job.generated_image_url
            )}" alt="AI kitchen concept image" /></div>`
          : ""
      }
      <p style="margin-top: 24px; color: #555; font-size: 12px;">
        Disclaimer: This is an AI-assisted concept based on selected supplier brochure options. Final scope requires a site survey and technical review.
      </p>
    </body>
  </html>
  `;
}

export async function generateKitchenPdfReport(job: KitchenDesignJob): Promise<ArrayBuffer> {
  const apiKey = requiredEnv("PDFSHIFT_API_KEY");
  const sourceHtml = buildReportHtml(job);

  const requestBody = JSON.stringify({
    source: sourceHtml,
    landscape: false,
    use_print: false,
    format: "A4",
  });

  let response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: requestBody,
    cache: "no-store",
  });

  if (response.status === 401) {
    const credentials = Buffer.from(`${apiKey}:`).toString("base64");
    response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
      cache: "no-store",
    });
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PDF generation failed: ${response.status} ${body}`);
  }

  return response.arrayBuffer();
}
