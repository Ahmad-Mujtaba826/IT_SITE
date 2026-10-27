import { NextRequest, NextResponse } from "next/server";

function fallback(text: string): string {
  const t = text.toLowerCase();
  const map: [RegExp, string][] = [
    [/app|mobile|ios|android/, "Mobile apps. A first version usually takes 8 to 12 weeks."],
    [/ai|bot|automat|chat/, "AI solutions. A focused pilot can be live in 4 to 6 weeks."],
    [/aws|cloud|server|devops/, "Cloud and DevOps. A migration plan is typically ready in 2 weeks."],
    [/design|ui|ux/, "UI and UX design. Expect 3 to 5 weeks for a tested prototype."],
    [/data|analytics|dashboard/, "Data and analytics. A first dashboard is usually ready in 3 to 4 weeks."],
  ];
  const hit = map.find(([rx]) => rx.test(t));
  return `I'd point you to ${hit ? hit[1] : "Web development. Most platforms ship a first release in 6 to 10 weeks."} Share the details through the contact form and we'll reply within a day.`;
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ reply: "Please describe your idea." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL ?? "gemini-2.5-flash"}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are the website assistant for Axiora Technologies, a software company in Lahore. Services: web development, mobile apps, AI solutions, cloud and DevOps on AWS, UI/UX design, data and analytics. Reply in the same language the visitor uses (English or Roman Urdu), in 3 to 5 short sentences, recommend the best fitting service, give a rough timeline range. If anyone asks how to contact us or reach the team, tell them they can: 1) Fill the message form below on this page, 2) Email us at ahmadmujtaba826@gmail.com, 3) Call or WhatsApp us at +923295405754. Do not quote exact prices."
              }]
            },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: { maxOutputTokens: 200 }
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (reply) return NextResponse.json({ reply });
    } catch (err) {
      console.error("Gemini error:", err);
    }
  }

  return NextResponse.json({ reply: fallback(message) });
}
