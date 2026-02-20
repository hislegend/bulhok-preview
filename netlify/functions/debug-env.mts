import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const raw = process.env.GOOGLE_SA_KEY || "(not set)";
  const len = raw.length;
  const first50 = raw.substring(0, 50);
  const last50 = raw.substring(raw.length - 50);
  
  let parsed = "parse failed";
  let keys: string[] = [];
  try {
    const obj = JSON.parse(raw);
    parsed = "ok";
    keys = Object.keys(obj);
  } catch (e: any) {
    parsed = e.message;
    // try fixing newlines
    try {
      const obj = JSON.parse(raw.replace(/\\n/g, "\n"));
      parsed = "ok (after fix)";
      keys = Object.keys(obj);
    } catch (e2: any) {
      parsed += " | after fix: " + e2.message;
    }
  }

  return new Response(JSON.stringify({ len, first50, last50, parsed, keys }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
