import { NextResponse } from "next/server";
import { generateEventPlan } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await request.json();
    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a descriptive event prompt (e.g., 'Plan a college cultural fest for 800 people in Kolkata with ₹5,00,000 budget')" },
        { status: 400 }
      );
    }

    const result = await generateEventPlan(prompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Generation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate event plan. Please refine your prompt." },
      { status: 500 }
    );
  }
}

