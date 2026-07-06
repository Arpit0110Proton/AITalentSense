import { z } from "zod";
import { groqParse, GROQ_MODEL } from "./groqClients.js";
import type { FilterSet } from "../providers/types.js";

const FilterSetSchema = z.object({
  titles: z.array(z.string()),
  skills: z.array(z.string()),
  seniority: z.array(z.enum(["junior", "mid", "senior", "lead", "director"])),
  locations: z.array(z.string()),
  industries: z.array(z.string()),
  minYears: z.number().nullable(),
  maxYears: z.number().nullable(),
});

const SYSTEM_PROMPT = `You are a technical recruiter's assistant. Extract structured search filters from the job description the user provides. Respond ONLY with a JSON object matching exactly this schema:
{"titles": string[], "skills": string[], "seniority": ("junior"|"mid"|"senior"|"lead"|"director")[], "locations": string[], "industries": string[], "minYears": number|null, "maxYears": number|null}
Rules:
- titles: 1-4 job titles a recruiter would search for this role, most specific first.
- skills: 3-10 concrete technical or professional skills explicitly mentioned or unambiguously required. No soft skills like "communication".
- seniority: infer from title and years required. Multiple bands allowed if the JD is broad.
- locations: ONLY locations the JD explicitly states. "Remote" counts. If the JD says nothing about location, return [].
- industries: ONLY if the JD names or clearly implies an industry. Otherwise [].
- minYears/maxYears: ONLY numbers stated in the JD (e.g. "3+ years" means minYears 3, maxYears null). If not stated, null.
- NEVER guess or invent values for fields the JD does not mention. Empty array / null is the correct answer for unstated fields.`;

export async function parseJd(jdText: string): Promise<FilterSet> {
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: { role: "system" | "user"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: jdText },
    ];

    if (attempt > 0 && lastError) {
      messages.push({
        role: "user",
        content: `Your previous reply failed validation: ${lastError}. Reply with ONLY the corrected JSON.`,
      });
    }

    try {
      const response = await groqParse.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");

      const parsed = JSON.parse(content);
      const validated = FilterSetSchema.parse(parsed);
      return validated;
    } catch (err) {
      if (err instanceof z.ZodError) {
        lastError = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      } else {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  const error = new Error(
    "Couldn't read that JD. Try trimming it to the core role description."
  ) as Error & { statusCode: number; code: string };
  error.statusCode = 502;
  error.code = "parse_failed";
  throw error;
}
