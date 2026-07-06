// lib/csv.ts — client-side CSV builder (§11.2.6)
// Columns: rank,name,score,headline,location,years_experience,
//          current_title,current_company,skills,linkedin_url,blurb
// Proper quoting/escaping: wrap in ", double internal ". UTF-8 BOM prefix.

import type { ScoredCandidate } from "./api";

function escapeField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildCsv(candidates: ScoredCandidate[], titleSlug: string): void {
  const BOM = "\uFEFF";
  const headers = [
    "rank",
    "name",
    "score",
    "headline",
    "location",
    "years_experience",
    "current_title",
    "current_company",
    "skills",
    "linkedin_url",
    "blurb",
  ];

  const rows = candidates.map((c, i) =>
    [
      String(i + 1),
      escapeField(c.name),
      String(c.score),
      escapeField(c.headline),
      escapeField(c.location),
      String(c.yearsOfExperience),
      escapeField(c.currentTitle),
      escapeField(c.currentCompany),
      escapeField(c.skills.join("; ")),
      c.linkedinUrl || "",
      escapeField(c.blurb),
    ].join(",")
  );

  const csv = BOM + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const slug = titleSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const filename = `ai-talent-sense-${slug}-${date}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
