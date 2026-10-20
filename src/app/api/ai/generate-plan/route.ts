import { NextResponse } from "next/server";
import { generateEventPlan } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizePlainString } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit AI plan generation: max 20 calls per minute per user
    const rateLimit = checkRateLimit(`ai-gen:${user.id}`, 20, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded for AI plan generation. Please wait a moment.",
          retryAfterMs: rateLimit.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawPrompt = body.prompt;

    if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.trim().length < 5) {
      return NextResponse.json(
        {
          error:
            "Please enter a descriptive event prompt (e.g., 'Plan a college cultural fest for 800 people in Kolkata with ₹5,00,000 budget')",
        },
        { status: 400 }
      );
    }

    const cleanPrompt = sanitizePlainString(rawPrompt);
    const result = await generateEventPlan(cleanPrompt);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate event plan. Please refine your prompt." },
      { status: 500 }
    );
  }
}
