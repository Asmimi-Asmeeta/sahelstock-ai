import { NextResponse } from "next/server";

import { buildFallbackSummary } from "@/lib/summary";
import type { SummaryPayload, SummaryResponse } from "@/lib/types";

async function generateOpenAiSummary(payload: SummaryPayload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = `
Tu es un assistant métier en français pour un mini SaaS de gestion de stock.
Rédige un court résumé professionnel, clair et actionnable en 5 à 7 phrases.
Mets en avant :
- les produits à surveiller
- les meilleures ventes
- les besoins de réapprovisionnement
- les opportunités de marge

Données :
${JSON.stringify(payload, null, 2)}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "Tu rédiges des résumés métiers courts, concrets, sobres et utiles pour un responsable de stock.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("OpenAI indisponible");
  }

  const json = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return json.choices?.[0]?.message?.content?.trim() ?? null;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SummaryPayload;
    const fallbackSummary = buildFallbackSummary(payload);

    try {
      const openAiSummary = await generateOpenAiSummary(payload);

      if (openAiSummary) {
        return NextResponse.json<SummaryResponse>({
          summary: openAiSummary,
          mode: "openai",
        });
      }
    } catch {
      // Le fallback local garde l'application utilisable sans bloquer l'utilisateur.
    }

    return NextResponse.json<SummaryResponse>({
      summary: fallbackSummary,
      mode: "fallback",
    });
  } catch {
    return NextResponse.json<SummaryResponse>(
      {
        summary:
          "Impossible de générer un résumé pour le moment. Vérifiez les données importées puis réessayez.",
        mode: "fallback",
      },
      { status: 200 },
    );
  }
}
