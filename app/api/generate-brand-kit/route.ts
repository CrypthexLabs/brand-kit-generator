import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brandName, industry, adjectives, audience } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OpenAI API key on server" },
        { status: 500 }
      );
    }

    // Build a clear prompt for the AI
    const prompt = `
You are a brand designer. Generate a simple brand kit for the following brand.

Brand name: ${brandName || "Unknown Brand"}
Industry / niche: ${industry || "Not specified"}
Adjectives: ${adjectives || "Not specified"}
Target audience: ${audience || "Not specified"}

Return a JSON object with this exact shape:

{
  "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "headingFont": "Name of heading font (Google Fonts compatible)",
  "bodyFont": "Name of body font (Google Fonts compatible)",
  "personality": "2-3 sentences describing the brand personality and tone of voice"
}

Important:
- Use real hex colors.
- Colors should match the adjectives and industry.
- Fonts should be widely available on Google Fonts.
- Personality should be concrete and helpful.
`;

    // Call OpenAI API (using fetch to keep it simple)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert brand designer. Always respond with valid JSON, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate brand kit" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "No content returned from AI" },
        { status: 500 }
      );
    }

    // The AI is asked to return raw JSON; parse it
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.error("Failed to parse AI JSON:", rawContent);
      return NextResponse.json(
        { error: "Invalid JSON from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
